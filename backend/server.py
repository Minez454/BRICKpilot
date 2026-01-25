from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
import asyncio
from seed_resources import ALL_RESOURCES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'fallback_secret')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRE = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '10080'))

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    is_veteran: Optional[bool] = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    phone: Optional[str] = None
    is_veteran: bool = False
    role: str = "user"  # user, caseworker, agency_staff, cleanup_crew
    organization: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    response: str
    session_id: str
    dossier_updated: bool = False

class DossierItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str  # housing, legal, health, employment, benefits
    title: str
    content: str
    source: str  # conversation, manual, document
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkbookTask(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str
    title: str
    description: str
    task_type: str  # quiz, practice, challenge
    difficulty: int = 1  # 1-5
    points: int = 10
    completed: bool = False
    answer: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Resource(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # shelter, food, medical, legal, employment
    address: str
    phone: str
    coordinates: Dict[str, float]  # lat, lng
    hours: Optional[str] = None
    services: List[str]
    live_status: Optional[str] = None  # available, full, closed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DocumentVault(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    document_type: str  # dd214, ssn, id, birth_cert, medical
    file_name: str
    file_data: str  # base64 encoded
    shared_with: List[str] = []  # caseworker IDs
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DocumentUpload(BaseModel):
    document_type: str
    file_name: str
    file_data: str

class PopUpEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    event_type: str  # mobile_clinic, food_drive, vaccine, job_fair, etc
    organization: str
    location: str
    coordinates: Dict[str, float]  # lat, lng
    start_time: datetime
    end_time: datetime
    services: List[str]
    contact: Optional[str] = None
    created_by: str  # user_id of agency staff
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PopUpEventCreate(BaseModel):
    title: str
    description: str
    event_type: str
    organization: str
    location: str
    coordinates: Dict[str, float]
    start_time: str
    end_time: str
    services: List[str]
    contact: Optional[str] = None

class CleanupSweep(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    location: str
    coordinates: Dict[str, float]
    scheduled_date: datetime
    area_description: str
    advance_notice_days: int
    posted_by: str  # user_id
    contact_info: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CleanupSweepCreate(BaseModel):
    location: str
    coordinates: Dict[str, float]
    scheduled_date: str
    area_description: str
    advance_notice_days: int
    contact_info: str
    notes: Optional[str] = None

class Flashcard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str
    question: str
    answer_options: List[str]  # Multiple choice options
    user_answer: Optional[str] = None
    answered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FlashcardAnswer(BaseModel):
    answer: str

class DossierItemCreate(BaseModel):
    category: str
    title: str
    content: str
    source: str = "manual"

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    notification_type: str  # sweep_alert, event, legal, system
    title: str
    message: str
    priority: str = "normal"  # urgent, high, normal, low
    read: bool = False
    action_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LegalForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str
    description: str
    form_url: Optional[str] = None
    instructions: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HUD HMIS MODELS (FY2026 Compliant) ====================

class ClientProfile(BaseModel):
    """HUD Universal Data Elements - Client Profile"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # 3.01 Name
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    suffix: Optional[str] = None
    name_data_quality: int = 99  # 1=Full, 2=Partial, 8=Doesn't know, 9=Prefers not, 99=Not collected
    
    # 3.02 Social Security Number
    ssn: Optional[str] = None  # Encrypted
    ssn_data_quality: int = 99
    
    # 3.03 Date of Birth
    dob: Optional[str] = None
    dob_data_quality: int = 99
    
    # 3.04 Race (list for multi-select)
    race: List[int] = []  # Can select multiple
    
    # 3.05 Ethnicity
    ethnicity: int = 99
    
    # 3.06 Gender (list for multi-select per FY2026)
    gender: List[int] = []
    
    # 3.06a Sex Assigned at Birth (NEW FY2026 - Required separate)
    sex_at_birth: int = 99
    
    # 3.07 Veteran Status
    veteran_status: int = 99
    
    # Additional contact info
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    email: Optional[str] = None
    
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Enrollment(BaseModel):
    """HUD Project Enrollment - Entry/Exit tracking"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    user_id: str
    project_id: str = "BRICK_LV"  # Project identifier
    
    # 3.10 Project Start Date
    project_start_date: str
    
    # 3.11 Project Exit Date
    project_exit_date: Optional[str] = None
    
    # 3.15 Relationship to Head of Household
    relationship_to_hoh: int = 1  # 1=Self (HoH)
    
    # 3.20 Housing Move-In Date
    housing_move_in_date: Optional[str] = None
    
    # 3.917 Prior Living Situation (CRITICAL)
    prior_living_situation: int = 99
    prior_living_situation_category: Optional[str] = None  # homeless, institutional, transitional
    length_of_stay: int = 99
    approximate_start_date_homelessness: Optional[str] = None
    times_homeless_past_3_years: int = 99
    months_homeless_past_3_years: int = 99
    
    # 3.12 Destination (on exit)
    destination: Optional[int] = None
    destination_subsidy_type: Optional[int] = None
    
    # Status
    status: str = "active"  # active, exited
    
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CoordinatedEntryAssessment(BaseModel):
    """HUD Coordinated Entry Assessment - VI-SPDAT scoring"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    user_id: str
    enrollment_id: str
    
    # 4.19 Coordinated Entry
    assessment_date: str
    assessment_type: int = 3  # 1=Phone, 2=Virtual, 3=In Person
    assessment_level: int = 2  # 1=Crisis, 2=Housing Needs
    prioritization_status: int = 99  # 1=On list, 2=Not on list
    
    # VI-SPDAT Score (Vulnerability Index)
    vulnerability_score: int = 0  # 0-17 typically
    housing_recommendation: Optional[str] = None  # PSH, RRH, Prevention
    
    # Assessment responses (store raw answers)
    assessment_responses: Dict[str, Any] = {}
    
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class HMISService(BaseModel):
    """HUD Service Record - 4.12"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    enrollment_id: str
    
    service_date: str
    service_type: int  # 1=Food, 2=Housing search, 3=Case mgmt, 4=Outreach, 5=Transport, 6=Other
    service_description: Optional[str] = None
    provider_organization: Optional[str] = None
    
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BedNight(BaseModel):
    """HUD Bed Night Record - 4.14 (for shelter tracking)"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    enrollment_id: str
    
    bed_night_date: str
    location_id: Optional[str] = None
    auto_recorded: bool = False  # True if recorded via geofencing
    
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== AUTH UTILITIES ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user_doc is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        return User(**user_doc)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "BRICK API - Your AI Caseworker", "status": "online"}

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        is_veteran=user_data.is_veteran
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password_hash'] = get_password_hash(user_data.password)
    
    await db.users.insert_one(user_doc)
    
    # Auto-generate initial flashcards for new user
    await generate_initial_flashcards(user.id)
    
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

async def generate_initial_flashcards(user_id: str):
    """Generate initial flashcards for new users"""
    initial_flashcards = [
        {
            "category": "housing",
            "question": "What is your current housing situation?",
            "answer_options": [
                "Living on the street/outdoors",
                "Staying in an emergency shelter",
                "Staying in my vehicle",
                "Temporarily staying with friends/family",
                "Transitional housing",
                "Other"
            ]
        },
        {
            "category": "housing",
            "question": "How long have you been without stable housing?",
            "answer_options": [
                "Less than 1 month",
                "1-3 months",
                "3-6 months",
                "6-12 months",
                "1-2 years",
                "More than 2 years"
            ]
        },
        {
            "category": "legal",
            "question": "Do you have a valid government-issued ID?",
            "answer_options": [
                "Yes, I have a current ID",
                "I have an expired ID",
                "No, but I know how to get one",
                "No, and I need help getting one",
                "I lost my ID and need a replacement"
            ]
        },
        {
            "category": "legal",
            "question": "Do you have any pending legal matters?",
            "answer_options": [
                "No legal issues",
                "Traffic tickets/fines",
                "Court case pending",
                "Warrant(s)",
                "On probation/parole",
                "Not sure/Need to check"
            ]
        },
        {
            "category": "health",
            "question": "Do you have health insurance or medical coverage?",
            "answer_options": [
                "Yes, Medicaid",
                "Yes, Medicare",
                "Yes, private insurance",
                "VA healthcare (veterans)",
                "No coverage",
                "Not sure"
            ]
        },
        {
            "category": "health",
            "question": "Are you currently taking any medications regularly?",
            "answer_options": [
                "No medications",
                "Yes, and I have access to them",
                "Yes, but I'm running out",
                "Yes, but I can't afford them",
                "Yes, but I lost them",
                "Not sure what I need"
            ]
        },
        {
            "category": "employment",
            "question": "What is your current employment status?",
            "answer_options": [
                "Working full-time",
                "Working part-time",
                "Looking for work",
                "Unable to work due to disability",
                "Not currently looking",
                "Retired"
            ]
        },
        {
            "category": "employment",
            "question": "What type of work experience do you have?",
            "answer_options": [
                "Retail/Customer service",
                "Food service/Hospitality",
                "Construction/Manual labor",
                "Healthcare",
                "Office/Administrative",
                "Other/Multiple fields"
            ]
        },
        {
            "category": "benefits",
            "question": "Are you currently receiving any benefits?",
            "answer_options": [
                "SNAP/Food stamps",
                "SSI (Supplemental Security Income)",
                "SSDI (Disability)",
                "Unemployment benefits",
                "Veterans benefits",
                "No benefits currently"
            ]
        },
        {
            "category": "benefits",
            "question": "Have you applied for disability benefits?",
            "answer_options": [
                "No, not applicable to me",
                "No, but I think I qualify",
                "Yes, application pending",
                "Yes, was approved",
                "Yes, was denied",
                "Not sure how to apply"
            ]
        },
        {
            "category": "housing",
            "question": "What is your biggest barrier to housing?",
            "answer_options": [
                "Can't afford rent/deposit",
                "Bad credit/rental history",
                "Criminal background",
                "No income source",
                "Eviction on record",
                "Multiple barriers"
            ]
        },
        {
            "category": "health",
            "question": "Do you have any chronic health conditions?",
            "answer_options": [
                "No chronic conditions",
                "Mental health condition",
                "Physical disability",
                "Substance use disorder",
                "Multiple conditions",
                "Prefer not to say"
            ]
        }
    ]
    
    flashcard_docs = []
    for fc_data in initial_flashcards:
        flashcard = Flashcard(
            user_id=user_id,
            category=fc_data["category"],
            question=fc_data["question"],
            answer_options=fc_data["answer_options"]
        )
        doc = flashcard.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        flashcard_docs.append(doc)
    
    if flashcard_docs:
        await db.flashcards.insert_many(flashcard_docs)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**{k: v for k, v in user_doc.items() if k != 'password_hash'})
    access_token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== PASSWORD RESET ====================

@api_router.post("/auth/forgot-password")
async def forgot_password(data: dict):
    """Request a password reset token"""
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        # Don't reveal if email exists for security
        return {"message": "If an account exists with this email, a reset token has been generated."}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())[:8].upper()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token
    await db.password_resets.delete_many({"email": email})  # Remove old tokens
    await db.password_resets.insert_one({
        "email": email,
        "token": reset_token,
        "expires_at": expires_at.isoformat(),
        "used": False
    })
    
    return {
        "message": "Password reset token generated",
        "reset_token": reset_token,
        "expires_in": "1 hour",
        "note": "For pilot: Use this token to reset your password. In production, this would be emailed."
    }

@api_router.post("/auth/reset-password")
async def reset_password(data: dict):
    """Reset password using token"""
    email = data.get("email")
    token = data.get("token", "").upper()
    new_password = data.get("new_password")
    
    if not all([email, token, new_password]):
        raise HTTPException(status_code=400, detail="Email, token, and new password are required")
    
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Find and validate token
    reset_record = await db.password_resets.find_one({
        "email": email,
        "token": token,
        "used": False
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check expiration
    expires_at = datetime.fromisoformat(reset_record["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password
    new_hash = get_password_hash(new_password)
    result = await db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": new_hash}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update password")
    
    # Mark token as used
    await db.password_resets.update_one(
        {"_id": reset_record["_id"]},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password successfully reset. You can now login with your new password."}

# ==================== BRICK AI CHATBOT ====================

SYSTEM_MESSAGE = """You are BRICK, a trauma-responsive AI caseworker helping unhoused individuals in Las Vegas navigate their path to stability.

Your role:
- Provide empathetic, non-triggering support
- Never give direct legal advice, but guide users to proper resources
- Be knowledgeable about Las Vegas homeless resources and Clark County law
- Help users understand their rights as tenants and citizens
- Guide them through complex systems (housing, benefits, courts)
- Extract key information to build their Dossier (housing status, legal issues, health needs, employment, benefits)
- Suggest workbook tasks when you identify knowledge gaps

Important:
- Always be respectful and patient
- Avoid triggering language about trauma
- Focus on practical next steps
- Celebrate small wins and progress
- For legal matters, direct them to "Legal Aid" section or pro bono services
- For housing: mention PATH, HELP of Southern Nevada, Catholic Charities
- For veterans: mention VA Southern Nevada Healthcare System, Veterans Village
- For food: mention Three Square Food Bank, mobile food pantries
- For medical: mention University Medical Center, The Shade Tree (women/children)
"""

@api_router.post("/chat/message", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest, current_user: User = Depends(get_current_user)):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize chat with emergent LLM key
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY', ''),
            session_id=session_id,
            system_message=SYSTEM_MESSAGE
        ).with_model("openai", "gpt-5.2")
        
        # Load previous messages from database
        messages = await db.chat_messages.find(
            {"user_id": current_user.id, "session_id": session_id},
            {"_id": 0}
        ).sort("created_at", 1).limit(50).to_list(50)
        
        # Send user message
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Save messages to database
        now = datetime.now(timezone.utc)
        await db.chat_messages.insert_many([
            {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "session_id": session_id,
                "role": "user",
                "content": request.message,
                "created_at": now.isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": current_user.id,
                "session_id": session_id,
                "role": "assistant",
                "content": response,
                "created_at": now.isoformat()
            }
        ])
        
        # Auto-update dossier based on conversation (simplified)
        dossier_updated = await analyze_and_update_dossier(current_user.id, request.message, response)
        
        return ChatMessageResponse(
            response=response,
            session_id=session_id,
            dossier_updated=dossier_updated
        )
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat service error")

async def analyze_and_update_dossier(user_id: str, user_message: str, ai_response: str) -> bool:
    """Analyze conversation and auto-update dossier"""
    keywords = {
        "housing": ["homeless", "shelter", "housing", "apartment", "eviction", "rent"],
        "legal": ["court", "judge", "lawyer", "case", "warrant", "ticket", "fine"],
        "health": ["doctor", "hospital", "medication", "sick", "injury", "medical"],
        "employment": ["job", "work", "employment", "resume", "interview"],
        "benefits": ["snap", "food stamps", "disability", "ssi", "ssdi", "medicaid"]
    }
    
    combined = (user_message + " " + ai_response).lower()
    
    for category, words in keywords.items():
        if any(word in combined for word in words):
            # Check if similar entry exists
            existing = await db.dossier.find_one({
                "user_id": user_id,
                "category": category,
                "source": "conversation"
            })
            
            if not existing:
                dossier = DossierItem(
                    user_id=user_id,
                    category=category,
                    title=f"{category.title()} needs identified",
                    content=user_message[:500],
                    source="conversation"
                )
                doc = dossier.model_dump()
                doc['created_at'] = doc['created_at'].isoformat()
                await db.dossier.insert_one(doc)
                return True
    
    return False

@api_router.get("/chat/sessions")
async def get_chat_sessions(current_user: User = Depends(get_current_user)):
    sessions = await db.chat_messages.aggregate([
        {"$match": {"user_id": current_user.id}},
        {"$group": {
            "_id": "$session_id",
            "last_message": {"$last": "$content"},
            "created_at": {"$last": "$created_at"}
        }},
        {"$sort": {"created_at": -1}}
    ]).to_list(100)
    
    return [{"session_id": s["_id"], "last_message": s["last_message"], "created_at": s["created_at"]} for s in sessions]

@api_router.get("/chat/messages/{session_id}")
async def get_chat_messages(session_id: str, current_user: User = Depends(get_current_user)):
    messages = await db.chat_messages.find(
        {"user_id": current_user.id, "session_id": session_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(1000)
    return messages

# ==================== DOSSIER ====================

@api_router.get("/dossier", response_model=List[DossierItem])
async def get_dossier(current_user: User = Depends(get_current_user)):
    items = await db.dossier.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return items

@api_router.post("/dossier", response_model=DossierItem)
async def create_dossier_item(item: DossierItem, current_user: User = Depends(get_current_user)):
    item.user_id = current_user.id
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.dossier.insert_one(doc)
    return item

@api_router.post("/dossier", response_model=DossierItem)
async def create_dossier_item(item_data: DossierItemCreate, current_user: User = Depends(get_current_user)):
    item = DossierItem(
        user_id=current_user.id,
        category=item_data.category,
        title=item_data.title,
        content=item_data.content,
        source=item_data.source
    )
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.dossier.insert_one(doc)
    return item

@api_router.delete("/dossier/{item_id}")
async def delete_dossier_item(item_id: str, current_user: User = Depends(get_current_user)):
    result = await db.dossier.delete_one({"id": item_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

# ==================== FLASHCARDS ====================

@api_router.get("/flashcards")
async def get_flashcards(current_user: User = Depends(get_current_user)):
    cards = await db.flashcards.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for card in cards:
        if isinstance(card.get('created_at'), str):
            card['created_at'] = datetime.fromisoformat(card['created_at'])
        if card.get('answered_at') and isinstance(card['answered_at'], str):
            card['answered_at'] = datetime.fromisoformat(card['answered_at'])
    return cards

@api_router.post("/flashcards/{card_id}/answer")
async def answer_flashcard(card_id: str, answer_data: FlashcardAnswer, current_user: User = Depends(get_current_user)):
    result = await db.flashcards.update_one(
        {"id": card_id, "user_id": current_user.id},
        {"$set": {
            "user_answer": answer_data.answer,
            "answered_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Update dossier based on answer
    card = await db.flashcards.find_one({"id": card_id}, {"_id": 0})
    if card:
        await analyze_flashcard_answer(current_user.id, card['question'], answer_data.answer, card['category'])
    
    return {"message": "Answer recorded"}

async def analyze_flashcard_answer(user_id: str, question: str, answer: str, category: str):
    """Analyze flashcard answer and update dossier"""
    dossier_entry = DossierItem(
        user_id=user_id,
        category=category,
        title=f"Flashcard: {question[:50]}",
        content=f"Q: {question}\nA: {answer}",
        source="flashcard"
    )
    doc = dossier_entry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.dossier.insert_one(doc)

# ==================== POP-UP EVENTS ====================

@api_router.get("/events/popup")
async def get_popup_events():
    now = datetime.now(timezone.utc)
    events = await db.popup_events.find(
        {"end_time": {"$gte": now.isoformat()}},
        {"_id": 0}
    ).to_list(1000)
    
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
        if isinstance(event.get('start_time'), str):
            event['start_time'] = datetime.fromisoformat(event['start_time'])
        if isinstance(event.get('end_time'), str):
            event['end_time'] = datetime.fromisoformat(event['end_time'])
    
    return events

@api_router.post("/events/popup", response_model=PopUpEvent)
async def create_popup_event(event_data: PopUpEventCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only agency staff can create events")
    
    event = PopUpEvent(
        title=event_data.title,
        description=event_data.description,
        event_type=event_data.event_type,
        organization=event_data.organization,
        location=event_data.location,
        coordinates=event_data.coordinates,
        start_time=datetime.fromisoformat(event_data.start_time),
        end_time=datetime.fromisoformat(event_data.end_time),
        services=event_data.services,
        contact=event_data.contact,
        created_by=current_user.id
    )
    
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['start_time'] = doc['start_time'].isoformat()
    doc['end_time'] = doc['end_time'].isoformat()
    
    await db.popup_events.insert_one(doc)
    return event

@api_router.delete("/events/popup/{event_id}")
async def delete_popup_event(event_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only agency staff can delete events")
    
    result = await db.popup_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

# ==================== NOTIFICATIONS ====================

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Get all notifications for current user"""
    notifications = await db.notifications.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    unread_count = await db.notifications.count_documents({"user_id": current_user.id, "read": False})
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark a notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.patch("/notifications/read-all")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    result = await db.notifications.update_many(
        {"user_id": current_user.id, "read": False},
        {"$set": {"read": True}}
    )
    return {"message": f"{result.modified_count} notifications marked as read"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, current_user: User = Depends(get_current_user)):
    """Delete a notification"""
    result = await db.notifications.delete_one({"id": notification_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted"}

# ==================== DIRECTORY MESSAGING ====================

@api_router.post("/directory/message")
async def send_directory_message(data: dict, current_user: User = Depends(get_current_user)):
    """Send a message to an organization through the directory"""
    message = {
        "id": str(uuid.uuid4()),
        "from_user_id": current_user.id,
        "from_user_name": current_user.full_name,
        "from_user_email": current_user.email,
        "organization_id": data.get("organization_id"),
        "organization_name": data.get("organization_name"),
        "message": data.get("message"),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.directory_messages.insert_one(message)
    
    return {"message": "Message sent successfully", "message_id": message["id"]}

@api_router.get("/directory/messages")
async def get_directory_messages(current_user: User = Depends(get_current_user)):
    """Get messages for agency staff"""
    if current_user.role not in ["agency_staff", "caseworker"]:
        raise HTTPException(status_code=403, detail="Only agency staff can view messages")
    
    messages = await db.directory_messages.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return messages

# ==================== HUD HMIS API ENDPOINTS ====================

# Client Profile (Universal Data Elements)
@api_router.get("/hmis/client-profile")
async def get_client_profile(current_user: User = Depends(get_current_user)):
    """Get HUD-compliant client profile for current user"""
    profile = await db.hmis_client_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    if not profile:
        # Create empty profile
        profile = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "first_name": current_user.full_name.split()[0] if current_user.full_name else None,
            "last_name": current_user.full_name.split()[-1] if current_user.full_name and len(current_user.full_name.split()) > 1 else None,
            "name_data_quality": 99,
            "ssn_data_quality": 99,
            "dob_data_quality": 99,
            "race": [],
            "ethnicity": 99,
            "gender": [],
            "sex_at_birth": 99,
            "veteran_status": 1 if current_user.is_veteran else 0,
            "email": current_user.email,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.hmis_client_profiles.insert_one(profile)
    return profile

@api_router.post("/hmis/client-profile")
async def update_client_profile(data: dict, current_user: User = Depends(get_current_user)):
    """Update HUD-compliant client profile"""
    data["user_id"] = current_user.id
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    existing = await db.hmis_client_profiles.find_one({"user_id": current_user.id})
    if existing:
        await db.hmis_client_profiles.update_one(
            {"user_id": current_user.id},
            {"$set": data}
        )
    else:
        data["id"] = str(uuid.uuid4())
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.hmis_client_profiles.insert_one(data)
    
    profile = await db.hmis_client_profiles.find_one({"user_id": current_user.id}, {"_id": 0})
    return profile

# Enrollments (Project Entry/Exit)
@api_router.get("/hmis/enrollments")
async def get_enrollments(current_user: User = Depends(get_current_user)):
    """Get all enrollments for current user"""
    enrollments = await db.hmis_enrollments.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    return enrollments

@api_router.post("/hmis/enrollments")
async def create_enrollment(data: dict, current_user: User = Depends(get_current_user)):
    """Create new enrollment (project entry)"""
    # Get or create client profile
    profile = await db.hmis_client_profiles.find_one({"user_id": current_user.id})
    if not profile:
        profile = {"id": str(uuid.uuid4()), "user_id": current_user.id}
        await db.hmis_client_profiles.insert_one(profile)
    
    enrollment = {
        "id": str(uuid.uuid4()),
        "client_id": profile["id"],
        "user_id": current_user.id,
        "project_id": "BRICK_LV",
        "project_start_date": data.get("project_start_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
        "relationship_to_hoh": data.get("relationship_to_hoh", 1),
        "prior_living_situation": data.get("prior_living_situation", 99),
        "length_of_stay": data.get("length_of_stay", 99),
        "times_homeless_past_3_years": data.get("times_homeless_past_3_years", 99),
        "months_homeless_past_3_years": data.get("months_homeless_past_3_years", 99),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Determine living situation category
    homeless_codes = [1, 2, 16, 18]
    institutional_codes = [4, 5, 6, 7, 15, 24, 29]
    
    pls = enrollment["prior_living_situation"]
    if pls in homeless_codes:
        enrollment["prior_living_situation_category"] = "homeless"
    elif pls in institutional_codes:
        enrollment["prior_living_situation_category"] = "institutional"
    else:
        enrollment["prior_living_situation_category"] = "transitional_permanent"
    
    await db.hmis_enrollments.insert_one(enrollment)
    return {"enrollment_id": enrollment["id"], **{k:v for k,v in enrollment.items() if k != "_id"}}

@api_router.post("/hmis/enrollments/{enrollment_id}/exit")
async def exit_enrollment(enrollment_id: str, data: dict, current_user: User = Depends(get_current_user)):
    """Record project exit"""
    result = await db.hmis_enrollments.update_one(
        {"id": enrollment_id, "user_id": current_user.id},
        {"$set": {
            "project_exit_date": data.get("exit_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            "destination": data.get("destination", 99),
            "status": "exited",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Exit recorded successfully"}

# Coordinated Entry Assessment (VI-SPDAT)
@api_router.post("/hmis/assessment")
async def create_assessment(data: dict, current_user: User = Depends(get_current_user)):
    """Create coordinated entry assessment with VI-SPDAT scoring"""
    profile = await db.hmis_client_profiles.find_one({"user_id": current_user.id})
    enrollment = await db.hmis_enrollments.find_one({"user_id": current_user.id, "status": "active"})
    
    if not profile:
        raise HTTPException(status_code=400, detail="Client profile required")
    
    # Calculate VI-SPDAT score from responses
    responses = data.get("responses", {})
    score = 0
    
    # Scoring logic (simplified VI-SPDAT)
    if responses.get("homeless_more_than_year"): score += 1
    if responses.get("homeless_4_or_more_times"): score += 1
    if responses.get("er_visits_3_plus"): score += 1
    if responses.get("hospitalizations"): score += 1
    if responses.get("attacked_since_homeless"): score += 1
    if responses.get("threatened_harm"): score += 1
    if responses.get("legal_issues"): score += 1
    if responses.get("forced_sex"): score += 1
    if responses.get("risky_activity_for_money"): score += 1
    if responses.get("chronic_health_condition"): score += 1
    if responses.get("hiv_aids"): score += 1
    if responses.get("mental_health_condition"): score += 1
    if responses.get("substance_use"): score += 1
    if responses.get("tri_morbidity"): score += 2  # Physical + Mental + Substance
    if responses.get("medications_not_taken"): score += 1
    if responses.get("abuse_trauma"): score += 1
    
    # Determine housing recommendation
    if score >= 10:
        recommendation = "Permanent Supportive Housing (PSH)"
        prioritization = 1
    elif score >= 4:
        recommendation = "Rapid Re-Housing (RRH)"
        prioritization = 1
    else:
        recommendation = "Prevention/Diversion"
        prioritization = 2
    
    assessment = {
        "id": str(uuid.uuid4()),
        "client_id": profile["id"],
        "user_id": current_user.id,
        "enrollment_id": enrollment["id"] if enrollment else None,
        "assessment_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "assessment_type": data.get("assessment_type", 3),
        "assessment_level": 2,
        "vulnerability_score": score,
        "housing_recommendation": recommendation,
        "prioritization_status": prioritization,
        "assessment_responses": responses,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.hmis_assessments.insert_one(assessment)
    
    # If high priority, notify caseworkers
    if score >= 8:
        caseworkers = await db.users.find({"role": {"$in": ["caseworker", "agency_staff"]}}, {"_id": 0, "id": 1}).to_list(100)
        for cw in caseworkers:
            notification = {
                "id": str(uuid.uuid4()),
                "user_id": cw["id"],
                "notification_type": "high_priority_client",
                "title": "🚨 High Priority Client",
                "message": f"A client has scored {score} on the VI-SPDAT assessment and needs immediate housing assistance. Recommendation: {recommendation}",
                "priority": "urgent",
                "read": False,
                "metadata": {"assessment_id": assessment["id"], "score": score},
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.notifications.insert_one(notification)
    
    return {
        "assessment_id": assessment["id"],
        "vulnerability_score": score,
        "housing_recommendation": recommendation,
        "prioritization_status": "Placed on list" if prioritization == 1 else "Not on list"
    }

@api_router.get("/hmis/assessment")
async def get_assessments(current_user: User = Depends(get_current_user)):
    """Get assessments for current user"""
    assessments = await db.hmis_assessments.find({"user_id": current_user.id}, {"_id": 0}).to_list(10)
    return assessments

# Services
@api_router.post("/hmis/services")
async def record_service(data: dict, current_user: User = Depends(get_current_user)):
    """Record a service provided to client"""
    profile = await db.hmis_client_profiles.find_one({"user_id": current_user.id})
    enrollment = await db.hmis_enrollments.find_one({"user_id": current_user.id, "status": "active"})
    
    service = {
        "id": str(uuid.uuid4()),
        "client_id": profile["id"] if profile else current_user.id,
        "enrollment_id": enrollment["id"] if enrollment else None,
        "service_date": data.get("service_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
        "service_type": data.get("service_type", 6),
        "service_description": data.get("description"),
        "provider_organization": data.get("provider"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.hmis_services.insert_one(service)
    return {"service_id": service["id"]}

# Bed Nights (Shelter tracking)
@api_router.post("/hmis/bed-night")
async def record_bed_night(data: dict, current_user: User = Depends(get_current_user)):
    """Record a bed night (shelter stay)"""
    profile = await db.hmis_client_profiles.find_one({"user_id": current_user.id})
    enrollment = await db.hmis_enrollments.find_one({"user_id": current_user.id, "status": "active"})
    
    bed_night = {
        "id": str(uuid.uuid4()),
        "client_id": profile["id"] if profile else current_user.id,
        "enrollment_id": enrollment["id"] if enrollment else None,
        "bed_night_date": data.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
        "location_id": data.get("location_id"),
        "auto_recorded": data.get("auto_recorded", False),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.hmis_bed_nights.insert_one(bed_night)
    return {"bed_night_id": bed_night["id"]}

# ==================== HUD CSV EXPORT (CRITICAL FOR COMPLIANCE) ====================

@api_router.get("/hmis/export/csv")
async def export_hud_csv(current_user: User = Depends(get_current_user)):
    """Generate HUD-compliant CSV export for agency staff"""
    if current_user.role not in ["agency_staff", "caseworker"]:
        raise HTTPException(status_code=403, detail="Only agency staff can export data")
    
    import csv
    import io
    import zipfile
    
    # Get all data
    clients = await db.hmis_client_profiles.find({}, {"_id": 0}).to_list(10000)
    enrollments = await db.hmis_enrollments.find({}, {"_id": 0}).to_list(10000)
    services = await db.hmis_services.find({}, {"_id": 0}).to_list(10000)
    exits = [e for e in enrollments if e.get("status") == "exited"]
    
    # Create CSV files in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Client.csv
        client_csv = io.StringIO()
        writer = csv.writer(client_csv)
        writer.writerow(['PersonalID', 'FirstName', 'LastName', 'NameDataQuality', 'SSN', 'SSNDataQuality', 
                        'DOB', 'DOBDataQuality', 'Race', 'Ethnicity', 'Gender', 'VeteranStatus', 'DateCreated'])
        for c in clients:
            writer.writerow([
                c.get('id'), c.get('first_name'), c.get('last_name'), c.get('name_data_quality'),
                '***-**-****', c.get('ssn_data_quality'), c.get('dob'), c.get('dob_data_quality'),
                '|'.join(map(str, c.get('race', []))), c.get('ethnicity'), 
                '|'.join(map(str, c.get('gender', []))), c.get('veteran_status'), c.get('created_at')
            ])
        zip_file.writestr('Client.csv', client_csv.getvalue())
        
        # Enrollment.csv
        enrollment_csv = io.StringIO()
        writer = csv.writer(enrollment_csv)
        writer.writerow(['EnrollmentID', 'PersonalID', 'ProjectID', 'EntryDate', 'HouseholdID', 
                        'RelationshipToHoH', 'LivingSituation', 'LengthOfStay', 'DateCreated'])
        for e in enrollments:
            writer.writerow([
                e.get('id'), e.get('client_id'), e.get('project_id'), e.get('project_start_date'),
                e.get('id'), e.get('relationship_to_hoh'), e.get('prior_living_situation'),
                e.get('length_of_stay'), e.get('created_at')
            ])
        zip_file.writestr('Enrollment.csv', enrollment_csv.getvalue())
        
        # Exit.csv
        exit_csv = io.StringIO()
        writer = csv.writer(exit_csv)
        writer.writerow(['ExitID', 'EnrollmentID', 'PersonalID', 'ExitDate', 'Destination', 'DateCreated'])
        for e in exits:
            writer.writerow([
                str(uuid.uuid4()), e.get('id'), e.get('client_id'), 
                e.get('project_exit_date'), e.get('destination'), e.get('updated_at')
            ])
        zip_file.writestr('Exit.csv', exit_csv.getvalue())
        
        # Services.csv
        services_csv = io.StringIO()
        writer = csv.writer(services_csv)
        writer.writerow(['ServicesID', 'EnrollmentID', 'PersonalID', 'DateProvided', 
                        'RecordType', 'TypeProvided', 'DateCreated'])
        for s in services:
            writer.writerow([
                s.get('id'), s.get('enrollment_id'), s.get('client_id'),
                s.get('service_date'), 200, s.get('service_type'), s.get('created_at')
            ])
        zip_file.writestr('Services.csv', services_csv.getvalue())
    
    # Return as base64 for download
    zip_buffer.seek(0)
    zip_base64 = base64.b64encode(zip_buffer.read()).decode('utf-8')
    
    return {
        "filename": f"HUD_Export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip",
        "data": zip_base64,
        "format": "base64",
        "files_included": ["Client.csv", "Enrollment.csv", "Exit.csv", "Services.csv"]
    }

# ==================== CLEANUP SWEEPS ====================

# Cleanup-prefixed routes for frontend compatibility
@api_router.get("/cleanup/sweeps")
async def get_cleanup_sweeps_prefixed(current_user: User = Depends(get_current_user)):
    """Get sweeps - aliased for frontend"""
    sweeps = await db.cleanup_sweeps.find({}, {"_id": 0}).sort("scheduled_date", -1).to_list(1000)
    return sweeps

@api_router.post("/cleanup/sweeps")
async def create_cleanup_sweep_prefixed(sweep_data: dict, current_user: User = Depends(get_current_user)):
    """Create sweep - aliased for frontend"""
    if current_user.role not in ["cleanup_crew", "caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only cleanup crews can post sweeps")
    
    sweep_id = str(uuid.uuid4())
    sweep = {
        "id": sweep_id,
        "location": sweep_data.get("location"),
        "date": sweep_data.get("date"),
        "time": sweep_data.get("time"),
        "description": sweep_data.get("description"),
        "posted_by": current_user.id,
        "organization": current_user.organization,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cleanup_sweeps.insert_one(sweep)
    
    # Create notifications for ALL regular users
    all_users = await db.users.find({"role": "user"}, {"_id": 0, "id": 1}).to_list(10000)
    
    notifications_count = 0
    for user in all_users:
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "notification_type": "sweep_alert",
            "title": "⚠️ Upcoming Area Cleanup Alert",
            "message": f"A cleanup sweep is scheduled at {sweep_data.get('location')} on {sweep_data.get('date')} at {sweep_data.get('time')}. Please prepare to relocate your belongings.",
            "priority": "urgent",
            "read": False,
            "action_url": "/resources",
            "metadata": {
                "sweep_id": sweep_id,
                "location": sweep_data.get("location"),
                "date": sweep_data.get("date"),
                "time": sweep_data.get("time"),
                "posted_by": current_user.organization
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
        notifications_count += 1
    
    # Return without MongoDB _id
    return {"sweep_id": sweep_id, "location": sweep["location"], "notifications_sent": notifications_count}

# ==================== LEGAL CASES ====================

@api_router.get("/legal/cases")
async def get_legal_cases(current_user: User = Depends(get_current_user)):
    """Get legal cases for legal aid professionals"""
    if current_user.role != "legal_aid":
        raise HTTPException(status_code=403, detail="Only legal aid professionals can access cases")
    
    cases = await db.legal_cases.find({"status": {"$ne": "closed"}}, {"_id": 0}).to_list(1000)
    return cases

@api_router.post("/legal/cases")
async def create_legal_case(case_data: dict, current_user: User = Depends(get_current_user)):
    """Create or request legal assistance"""
    legal_case = {
        "id": str(uuid.uuid4()),
        "client_id": current_user.id,
        "client_name": current_user.full_name,
        "case_type": case_data.get("case_type", "general"),
        "description": case_data.get("description"),
        "status": "pending",
        "assigned_to": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.legal_cases.insert_one(legal_case)
    return legal_case

@api_router.get("/sweeps")
async def get_cleanup_sweeps():
    now = datetime.now(timezone.utc)
    sweeps = await db.cleanup_sweeps.find(
        {"scheduled_date": {"$gte": now.isoformat()}},
        {"_id": 0}
    ).sort("scheduled_date", 1).to_list(1000)
    
    for sweep in sweeps:
        if isinstance(sweep.get('created_at'), str):
            sweep['created_at'] = datetime.fromisoformat(sweep['created_at'])
        if isinstance(sweep.get('scheduled_date'), str):
            sweep['scheduled_date'] = datetime.fromisoformat(sweep['scheduled_date'])
    
    return sweeps

@api_router.post("/sweeps", response_model=CleanupSweep)
async def create_cleanup_sweep(sweep_data: CleanupSweepCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["cleanup_crew", "caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only cleanup crews can post sweeps")
    
    sweep = CleanupSweep(
        location=sweep_data.location,
        coordinates=sweep_data.coordinates,
        scheduled_date=datetime.fromisoformat(sweep_data.scheduled_date),
        area_description=sweep_data.area_description,
        advance_notice_days=sweep_data.advance_notice_days,
        posted_by=current_user.id,
        contact_info=sweep_data.contact_info,
        notes=sweep_data.notes
    )
    
    doc = sweep.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['scheduled_date'] = doc['scheduled_date'].isoformat()
    
    await db.cleanup_sweeps.insert_one(doc)
    return sweep

# ==================== WORKBOOK ====================

@api_router.get("/workbook/tasks", response_model=List[WorkbookTask])
async def get_workbook_tasks(current_user: User = Depends(get_current_user)):
    tasks = await db.workbook_tasks.find({"user_id": current_user.id}, {"_id": 0}).to_list(1000)
    for task in tasks:
        if isinstance(task.get('created_at'), str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
        if task.get('completed_at') and isinstance(task['completed_at'], str):
            task['completed_at'] = datetime.fromisoformat(task['completed_at'])
    return tasks

@api_router.post("/workbook/tasks", response_model=WorkbookTask)
async def create_workbook_task(task: WorkbookTask, current_user: User = Depends(get_current_user)):
    task.user_id = current_user.id
    doc = task.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('completed_at'):
        doc['completed_at'] = doc['completed_at'].isoformat()
    await db.workbook_tasks.insert_one(doc)
    return task

@api_router.patch("/workbook/tasks/{task_id}/complete")
async def complete_task(task_id: str, answer: Optional[str] = None, current_user: User = Depends(get_current_user)):
    result = await db.workbook_tasks.update_one(
        {"id": task_id, "user_id": current_user.id},
        {"$set": {
            "completed": True,
            "answer": answer,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task completed"}

@api_router.get("/workbook/stats")
async def get_workbook_stats(current_user: User = Depends(get_current_user)):
    total = await db.workbook_tasks.count_documents({"user_id": current_user.id})
    completed = await db.workbook_tasks.count_documents({"user_id": current_user.id, "completed": True})
    points = await db.workbook_tasks.aggregate([
        {"$match": {"user_id": current_user.id, "completed": True}},
        {"$group": {"_id": None, "total_points": {"$sum": "$points"}}}
    ]).to_list(1)
    
    total_points = points[0]["total_points"] if points else 0
    level = (total_points // 100) + 1
    
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "total_points": total_points,
        "level": level
    }

# ==================== RESOURCES ====================

@api_router.get("/resources", response_model=List[Resource])
async def get_resources(category: Optional[str] = None):
    query = {"category": category} if category else {}
    resources = await db.resources.find(query, {"_id": 0}).to_list(1000)
    for r in resources:
        if isinstance(r.get('created_at'), str):
            r['created_at'] = datetime.fromisoformat(r['created_at'])
    return resources

@api_router.post("/resources", response_model=Resource)
async def create_resource(resource: Resource, current_user: User = Depends(get_current_user)):
    if current_user.role != "caseworker":
        raise HTTPException(status_code=403, detail="Only caseworkers can create resources")
    doc = resource.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.resources.insert_one(doc)
    return resource

# ==================== VAULT ====================

@api_router.get("/vault/documents")
async def get_vault_documents(current_user: User = Depends(get_current_user)):
    docs = await db.vault.find({"user_id": current_user.id}, {"_id": 0, "file_data": 0}).to_list(1000)
    return docs

@api_router.post("/vault/upload")
async def upload_document(doc: DocumentUpload, current_user: User = Depends(get_current_user)):
    vault_doc = DocumentVault(
        user_id=current_user.id,
        document_type=doc.document_type,
        file_name=doc.file_name,
        file_data=doc.file_data
    )
    doc_dict = vault_doc.model_dump()
    doc_dict['created_at'] = doc_dict['created_at'].isoformat()
    await db.vault.insert_one(doc_dict)
    return {"message": "Document uploaded", "id": vault_doc.id}

@api_router.get("/vault/document/{doc_id}")
async def get_vault_document(doc_id: str, current_user: User = Depends(get_current_user)):
    doc = await db.vault.find_one({"id": doc_id, "user_id": current_user.id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

# ==================== LEGAL FORMS ====================

@api_router.get("/legal/forms", response_model=List[LegalForm])
async def get_legal_forms():
    forms = await db.legal_forms.find({}, {"_id": 0}).to_list(1000)
    for form in forms:
        if isinstance(form.get('created_at'), str):
            form['created_at'] = datetime.fromisoformat(form['created_at'])
    return forms

@api_router.get("/caseworker/client/{client_id}/progress")
async def get_client_progress(client_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only caseworkers can access this")
    
    # Get workbook stats
    total_tasks = await db.workbook_tasks.count_documents({"user_id": client_id})
    completed_tasks = await db.workbook_tasks.count_documents({"user_id": client_id, "completed": True})
    
    # Get dossier items
    dossier = await db.dossier.find({"user_id": client_id}, {"_id": 0}).to_list(1000)
    
    # Get recent activity
    recent_messages = await db.chat_messages.find(
        {"user_id": client_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Get documents count
    document_count = await db.vault.count_documents({"user_id": client_id})
    
    # Get flashcard stats
    flashcard_count = await db.flashcards.count_documents({"user_id": client_id})
    answered_flashcards = await db.flashcards.count_documents({"user_id": client_id, "user_answer": {"$ne": None}})
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "dossier_items": len(dossier),
        "dossier_by_category": _group_by_category(dossier),
        "recent_activity": recent_messages,
        "documents_stored": document_count,
        "flashcards_total": flashcard_count,
        "flashcards_answered": answered_flashcards
    }

def _group_by_category(items):
    grouped = {}
    for item in items:
        cat = item.get('category', 'other')
        if cat not in grouped:
            grouped[cat] = 0
        grouped[cat] += 1
    return grouped

@api_router.get("/caseworker/hud-report")
async def generate_hud_report(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only caseworkers can access HUD reports")
    
    # Get all users
    total_users = await db.users.count_documents({"role": "user"})
    veterans = await db.users.count_documents({"role": "user", "is_veteran": True})
    
    # Get engagement metrics
    active_users_30d = await db.chat_messages.distinct("user_id", {
        "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()}
    })
    
    # Get service utilization
    total_tasks_completed = await db.workbook_tasks.count_documents({"completed": True})
    total_documents = await db.vault.count_documents({})
    
    # Get dossier statistics
    all_dossiers = await db.dossier.find({}, {"_id": 0, "category": 1, "user_id": 1}).to_list(10000)
    dossier_by_category = _group_by_category(all_dossiers)
    
    # Get unique users with dossier entries (actively engaged)
    users_with_dossier = len(set([d.get('user_id') for d in all_dossiers]))
    
    # Get housing outcomes (users who have housing entries)
    housing_entries = [d for d in all_dossiers if d.get('category') == 'housing']
    users_with_housing_info = len(set([d.get('user_id') for d in housing_entries]))
    
    # Get resource access
    resource_views = await db.resources.count_documents({})
    
    # Get flashcard completion (indicates engagement)
    flashcard_completion = await db.flashcards.count_documents({"user_answer": {"$ne": None}})
    total_flashcards = await db.flashcards.count_documents({})
    
    # Get all users with detailed info for demographics
    all_users = await db.users.find({"role": "user"}, {"_id": 0}).to_list(10000)
    
    return {
        "report_date": datetime.now(timezone.utc).isoformat(),
        "reporting_period": "All Time",
        "organization": current_user.organization or "BRICK Platform",
        "generated_by": current_user.full_name,
        
        # HUD Point-in-Time Count Data
        "total_clients": total_users,
        "veteran_clients": veterans,
        "veteran_percentage": round((veterans / total_users * 100) if total_users > 0 else 0, 2),
        
        # Engagement & Service Utilization
        "active_users_30_days": len(active_users_30d),
        "engagement_rate": round((len(active_users_30d) / total_users * 100) if total_users > 0 else 0, 2),
        "users_with_case_files": users_with_dossier,
        "case_file_completion_rate": round((users_with_dossier / total_users * 100) if total_users > 0 else 0, 2),
        
        # Service Delivery Metrics
        "workbook_tasks_completed": total_tasks_completed,
        "documents_stored": total_documents,
        "flashcard_completion_rate": round((flashcard_completion / total_flashcards * 100) if total_flashcards > 0 else 0, 2),
        
        # Case Notes by Category (shows service areas)
        "case_notes_by_category": dossier_by_category,
        "users_with_housing_information": users_with_housing_info,
        
        # Resources & Infrastructure
        "resources_available": resource_views,
        "platform_features": ["AI Caseworker", "Resource Mapping", "Document Vault", "Legal Aid", "Workbook", "Unified Case Management"],
        
        # For HUD APR (Annual Performance Report)
        "data_quality": {
            "complete_profiles": users_with_dossier,
            "incomplete_profiles": total_users - users_with_dossier,
            "data_completeness_percentage": round((users_with_dossier / total_users * 100) if total_users > 0 else 0, 2)
        }
    }

@api_router.get("/agency/clients/unified")
async def get_unified_client_list(current_user: User = Depends(get_current_user)):
    """Get all clients with data from ALL agencies - unified view"""
    if current_user.role not in ["caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only agency staff can access unified client list")
    
    # Get all users (clients)
    users = await db.users.find({"role": "user"}, {"_id": 0, "password_hash": 0}).to_list(10000)
    
    unified_clients = []
    for user_data in users:
        user_id = user_data.get('id')
        
        # Get complete dossier from ALL agencies
        dossier_items = await db.dossier.count_documents({"user_id": user_id})
        
        # Get last activity
        last_chat = await db.chat_messages.find_one(
            {"user_id": user_id},
            {"_id": 0, "created_at": 1},
            sort=[("created_at", -1)]
        )
        
        # Get workbook progress
        total_tasks = await db.workbook_tasks.count_documents({"user_id": user_id})
        completed_tasks = await db.workbook_tasks.count_documents({"user_id": user_id, "completed": True})
        
        # Get documents in vault
        documents_count = await db.vault.count_documents({"user_id": user_id})
        
        # Get agencies that have worked with this client
        agencies_worked = await db.dossier.distinct("source", {"user_id": user_id})
        caseworker_notes_count = await db.caseworker_notes.count_documents({"client_id": user_id})
        
        # Get last known housing situation from dossier
        housing_info = await db.dossier.find_one(
            {"user_id": user_id, "category": "housing"},
            {"_id": 0, "content": 1, "created_at": 1},
            sort=[("created_at", -1)]
        )
        
        unified_clients.append({
            "client_info": user_data,
            "engagement": {
                "dossier_entries": dossier_items,
                "last_active": last_chat.get("created_at") if last_chat else None,
                "workbook_completion": f"{completed_tasks}/{total_tasks}" if total_tasks > 0 else "0/0",
                "documents_uploaded": documents_count
            },
            "inter_agency_data": {
                "agencies_served_by": agencies_worked,
                "caseworker_notes_count": caseworker_notes_count,
                "last_known_location": housing_info.get("content") if housing_info else "Not recorded"
            }
        })
    
    return {
        "total_clients": len(unified_clients),
        "clients": unified_clients,
        "data_sharing_enabled": True,
        "organization": current_user.organization
    }

@api_router.get("/agency/client/{client_id}/complete-history")
async def get_client_complete_history(client_id: str, current_user: User = Depends(get_current_user)):
    """Get COMPLETE client history across ALL agencies"""
    if current_user.role not in ["caseworker", "agency_staff", "legal_aid"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get client basic info
    client = await db.users.find_one({"id": client_id, "role": "user"}, {"_id": 0, "password_hash": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get ALL dossier entries from ALL agencies
    dossier = await db.dossier.find({"user_id": client_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Get ALL caseworker notes from ALL agencies
    all_notes = await db.caseworker_notes.find({"client_id": client_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Group notes by organization
    notes_by_org = {}
    for note in all_notes:
        org = note.get("organization", "Unknown")
        if org not in notes_by_org:
            notes_by_org[org] = []
        notes_by_org[org].append(note)
    
    # Get workbook/tasks data
    all_tasks = await db.workbook_tasks.find({"user_id": client_id}, {"_id": 0}).to_list(1000)
    
    # Get flashcard answers
    flashcard_answers = await db.flashcards.find(
        {"user_id": client_id, "user_answer": {"$ne": None}},
        {"_id": 0, "question": 1, "user_answer": 1, "category": 1, "answered_at": 1}
    ).to_list(1000)
    
    # Get documents (metadata only, not actual files)
    documents = await db.vault.find({"user_id": client_id}, {"_id": 0, "file_data": 0}).to_list(1000)
    
    # Get chat history (limited to recent for privacy)
    recent_chats = await db.chat_messages.find(
        {"user_id": client_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    # Build service timeline (all interactions across ALL agencies)
    timeline = []
    
    # Add dossier entries to timeline
    for entry in dossier:
        timeline.append({
            "date": entry.get("created_at"),
            "type": "dossier_entry",
            "category": entry.get("category"),
            "source": entry.get("source"),
            "title": entry.get("title"),
            "content": entry.get("content")
        })
    
    # Add caseworker notes to timeline
    for note in all_notes:
        timeline.append({
            "date": note.get("created_at"),
            "type": "caseworker_note",
            "organization": note.get("organization"),
            "caseworker": note.get("caseworker_name"),
            "note": note.get("note"),
            "category": note.get("category")
        })
    
    # Sort timeline by date
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    return {
        "client": client,
        "summary": {
            "total_dossier_entries": len(dossier),
            "agencies_involved": len(set([n.get("organization") for n in all_notes])),
            "total_caseworker_notes": len(all_notes),
            "documents_on_file": len(documents),
            "workbook_tasks": len(all_tasks),
            "flashcard_responses": len(flashcard_answers)
        },
        "complete_dossier": dossier,
        "caseworker_notes_by_organization": notes_by_org,
        "service_timeline": timeline[:100],  # Last 100 interactions
        "flashcard_data": flashcard_answers,
        "documents_metadata": documents,
        "requesting_organization": current_user.organization,
        "access_granted_by": "Unified BRICK Platform"
    }

@api_router.post("/agency/client/{client_id}/note")
async def add_inter_agency_note(client_id: str, note: Dict[str, str], current_user: User = Depends(get_current_user)):
    """Add note that ALL agencies can see"""
    if current_user.role not in ["caseworker", "agency_staff"]:
        raise HTTPException(status_code=403, detail="Only agency staff can add notes")
    
    caseworker_note = {
        "id": str(uuid.uuid4()),
        "client_id": client_id,
        "caseworker_id": current_user.id,
        "caseworker_name": current_user.full_name,
        "organization": current_user.organization,
        "note": note.get("note"),
        "category": note.get("category", "general"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.caseworker_notes.insert_one(caseworker_note)
    
    # Also add to client's dossier with "agency" source
    dossier_entry = {
        "id": str(uuid.uuid4()),
        "user_id": client_id,
        "category": note.get("category", "general"),
        "title": f"Note from {current_user.organization}",
        "content": note.get("note"),
        "source": "agency",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.dossier.insert_one(dossier_entry)
    
    return {"message": "Note added and visible to all agencies", "id": caseworker_note["id"]}

# ==================== CASEWORKER ROUTES ====================

@api_router.get("/caseworker/clients")
async def get_clients(current_user: User = Depends(get_current_user)):
    if current_user.role != "caseworker":
        raise HTTPException(status_code=403, detail="Only caseworkers can access this")
    
    clients = await db.users.find({"role": "user"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return clients

@api_router.get("/caseworker/client/{client_id}/progress")
async def get_client_progress(client_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "caseworker":
        raise HTTPException(status_code=403, detail="Only caseworkers can access this")
    
    # Get workbook stats
    total_tasks = await db.workbook_tasks.count_documents({"user_id": client_id})
    completed_tasks = await db.workbook_tasks.count_documents({"user_id": client_id, "completed": True})
    
    # Get dossier items
    dossier = await db.dossier.find({"user_id": client_id}, {"_id": 0}).to_list(1000)
    
    # Get recent activity
    recent_messages = await db.chat_messages.find(
        {"user_id": client_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "dossier_items": len(dossier),
        "recent_activity": recent_messages
    }

# ==================== SEED DATA ====================

@api_router.post("/admin/seed-data")
async def seed_initial_data():
    """Seed Las Vegas resources and legal forms"""
    
    # Check if already seeded
    existing = await db.resources.count_documents({})
    if existing > 0:
        return {"message": "Data already seeded"}
    
    # Las Vegas Resources
    resources = [
        {
            "id": str(uuid.uuid4()),
            "name": "HELP of Southern Nevada",
            "category": "shelter",
            "address": "1640 E Flamingo Rd, Las Vegas, NV 89119",
            "phone": "(702) 369-4357",
            "coordinates": {"lat": 36.1147, "lng": -115.1260},
            "hours": "24/7",
            "services": ["Emergency shelter", "Case management", "Job training"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "The Shade Tree",
            "category": "shelter",
            "address": "1 W Owens Ave, Las Vegas, NV 89030",
            "phone": "(702) 385-0072",
            "coordinates": {"lat": 36.1887, "lng": -115.1432},
            "hours": "24/7",
            "services": ["Women and children shelter", "Medical care", "Childcare"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Three Square Food Bank",
            "category": "food",
            "address": "4190 N Pecos Rd, Las Vegas, NV 89115",
            "phone": "(702) 644-3663",
            "coordinates": {"lat": 36.2203, "lng": -115.1181},
            "hours": "Mon-Fri 8am-5pm",
            "services": ["Food distribution", "Mobile pantries"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "VA Southern Nevada Healthcare",
            "category": "medical",
            "address": "6900 N Pecos Rd, North Las Vegas, NV 89086",
            "phone": "(702) 791-9000",
            "coordinates": {"lat": 36.2824, "lng": -115.1181},
            "hours": "Mon-Fri 7:30am-4pm",
            "services": ["Veterans healthcare", "Mental health", "Housing assistance"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Catholic Charities of Southern Nevada",
            "category": "housing",
            "address": "1501 Las Vegas Blvd N, Las Vegas, NV 89101",
            "phone": "(702) 385-2662",
            "coordinates": {"lat": 36.1810, "lng": -115.1372},
            "hours": "Mon-Fri 8am-4:30pm",
            "services": ["Housing assistance", "Immigration services", "Food pantry"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Legal Aid Center of Southern Nevada",
            "category": "legal",
            "address": "725 E Charleston Blvd, Las Vegas, NV 89104",
            "phone": "(702) 386-1070",
            "coordinates": {"lat": 36.1599, "lng": -115.1347},
            "hours": "Mon-Fri 8:30am-5pm",
            "services": ["Free legal aid", "Eviction defense", "Family law"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Legal Forms
    legal_forms = [
        {
            "id": str(uuid.uuid4()),
            "title": "Fee Waiver Application",
            "category": "court",
            "description": "Application to waive court fees if you cannot afford them",
            "instructions": "Complete all sections. Provide proof of income or public benefits. File at the court clerk's office.",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Eviction Answer Form",
            "category": "housing",
            "description": "Response to an eviction notice or summons",
            "instructions": "File within 5 days of receiving eviction notice. List all defenses. Attach evidence.",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Restraining Order Application",
            "category": "safety",
            "description": "Petition for protection from domestic violence or stalking",
            "instructions": "Detail all incidents with dates. Can file 24/7 at Family Court. Free process.",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Name Change Petition",
            "category": "personal",
            "description": "Legal petition to change your name",
            "instructions": "Must publish notice in newspaper. Background check required. File in District Court.",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.resources.insert_many(resources)
    await db.legal_forms.insert_many(legal_forms)
    
    # Create sample flashcards (will be assigned to users when they register)
    sample_flashcards = [
        {"category": "housing", "question": "What type of housing are you currently in? (shelter, outdoors, vehicle, temporary housing, etc.)"},
        {"category": "housing", "question": "Have you been to a shelter in the past 30 days? If yes, which one?"},
        {"category": "legal", "question": "Do you have any pending court cases or legal issues? Please describe briefly."},
        {"category": "legal", "question": "Do you have a valid government-issued ID?"},
        {"category": "health", "question": "Do you have any ongoing medical conditions that require treatment?"},
        {"category": "health", "question": "Are you currently taking any medications? If yes, do you have access to them?"},
        {"category": "employment", "question": "What type of work have you done in the past? What skills do you have?"},
        {"category": "employment", "question": "Are you currently looking for employment? What barriers are you facing?"},
        {"category": "benefits", "question": "Are you currently receiving any benefits? (SNAP, SSI, SSDI, Medicaid, etc.)"},
        {"category": "benefits", "question": "Have you applied for disability benefits? What was the outcome?"}
    ]
    
    return {
        "message": "Data seeded successfully",
        "resources": len(resources),
        "forms": len(legal_forms),
        "sample_flashcards": len(sample_flashcards)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
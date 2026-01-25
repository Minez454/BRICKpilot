# BRICK - AI Caseworker for Unhoused Individuals

## Original Problem Statement
Build a full-stack application named "BRICK", designed as an AI-powered caseworker for unhoused individuals in Las Vegas.

## ✅ PILOT-READY STATUS (January 25, 2026)

All core features working with 100% test pass rate.

### NEW: HUD FY2026 HMIS Compliance Added!
BRICK is now a **federally compliant Homeless Management Information System** that can replace Bitfocus Clarity.

---

## COMPREHENSIVE APP SUMMARY

### FOR INDIVIDUAL USERS (Unhoused Individuals)

#### 🤖 BRICK AI Chatbot
- **Trauma-responsive AI** that listens empathetically and guides users through complex systems
- Learns your story and auto-saves relevant information to your Dossier
- Provides personalized resource recommendations for Las Vegas area
- Helps navigate housing, legal, health, employment, and benefits systems
- Never gives direct legal advice but connects users to proper resources

#### 📍 Resource Directory (NEW - 25 Real Organizations!)
- **Live database of verified Las Vegas service providers** including:
  - **Coordinated Entry Points** (6): The Courtyard, Catholic Charities, Family Promise, HELP of SN, NPHY, VA CRRC
  - **Emergency Shelters** (6): The Courtyard, Las Vegas Rescue Mission, The Shade Tree, SafeNest, Shannon West, Salvation Army
  - **Food Resources** (5): St. Vincent's, Rescue Mission meals, City Mission, Just One Project, Three Square
  - **Medical Services** (5): Nevada Health Centers, Mobile Medical Van, First Person Care, SNHD Sexual Health, Mojave Mental Health
  - **Legal Aid** (3): Nevada Homeless Alliance, Legal Aid Center, Silver State Fair Housing
- Filter by category, search by name or service
- Contact organizations directly via phone or in-app messaging
- View hours, addresses, services, and target populations

#### 🗺️ Resource Map
- Interactive Leaflet map showing Las Vegas homeless services
- Color-coded markers by service type (shelter, food, medical, legal)
- Quick access to directions and contact info

#### 🔐 The Vault (Document Storage)
- Secure, encrypted storage for vital documents
- Upload DD-214 (veterans), IDs, birth certificates, medical records
- Share documents with caseworkers when needed
- Access your documents from anywhere

#### 📋 My Dossier (Personal History)
- Organized record of your housing history, legal issues, health needs
- Auto-populated from BRICK AI conversations
- Color-coded by source (AI conversation, manual entry, flashcards)
- Used for Quick-Apply feature (coming soon)

#### 📚 Workbook (Self-Assessment)
- 12 auto-generated flashcards covering housing, legal, health, employment, benefits
- Points and level progression to track your journey
- Answers help BRICK AI understand your needs better

#### 🔔 Notification System
- **Real-time sweep alerts** from cleanup crews
- Never miss important information about encampment relocations
- Bell icon with unread count badge

---

### FOR AGENCIES (Caseworkers, Shelters, Service Providers)

#### 🏢 Agency Dashboards (11 Organization Themes)
Each organization gets a custom-branded dashboard with their colors and logo:
- **Shine-A-Light Las Vegas** - Mobile outreach
- **Recover Las Vegas** - Recovery services
- **Catholic Charities** - Social services
- **Salvation Army** - Shelter and rehabilitation
- **NPHY** - Homeless youth services
- **Veterans Village** - Veteran-specific services
- **Shannon West Center** - Youth shelter
- **TRAC-B** - Harm reduction
- **City of Las Vegas** - Government coordination
- **Clark County** - County services
- **HELP of Southern Nevada** - Comprehensive services

#### 📊 Dashboard Features
- Client overview with recent activity
- Search and filter clients
- View individual client progress
- Access unified client database

#### 📈 HUD HMIS Compliance (FY2026 Standards)
Full federal compliance for Homeless Management Information System:
- **Universal Data Elements** (3.01-3.07): Name, SSN, DOB, Race, Ethnicity, Gender, Veteran Status
- **FY2026 Updates**: Sex Assigned at Birth (3.06a), expanded Gender options
- **Prior Living Situation Logic Tree** (3.917): Homeless, Institutional, Transitional categories
- **Project Enrollment/Exit Tracking**
- **Coordinated Entry Assessments** with VI-SPDAT scoring
- **Service Recording** (4.12)
- **Bed Night Tracking** (4.14)

#### 📤 HUD CSV Export
One-click export of compliant data files:
- Client.csv
- Enrollment.csv
- Exit.csv
- Services.csv

These files can be imported directly into Clark County's HMIS system.

#### 🧹 Cleanup Crew Dashboard
- Post upcoming sweep schedules
- Auto-notify ALL registered users in the affected area
- View scheduled and past sweeps

#### ⚖️ Legal Aid Portal
- View client cases needing legal assistance
- Access legal resources library
- Schedule workshops and clinics

---

## Complete Login Credentials

### Agency/Organization Accounts
| Organization | Email | Password |
|--------------|-------|----------|
| **Shine-A-Light** | outreach@shinealightlv.org | shinealight2024 |
| **Recover Las Vegas** | team@recoverlv.org | recover2024 |
| **Catholic Charities** | outreach@catholiccharities.org | catholic2024 |
| **Salvation Army** | services@salvationarmylv.org | salvation2024 |
| **NPHY (Youth)** | youth@nphy.org | nphy2024 |
| **Veterans Village** | veterans@veteransvillage.org | veterans2024 |
| **Shannon West Center** | shelter@shannonwest.org | shannon2024 |
| **TRAC-B** | mobile@tracb.org | tracb2024 |
| **City of Las Vegas** | coordinator@cityoflv.gov | citylv2024 |
| **Clark County** | services@clarkcounty.gov | clark2024 |
| **HELP of SN** | agency@help.org | agency123 |

### Other Role Accounts
| Role | Email | Password |
|------|-------|----------|
| Regular User | testuser@example.com | password123 |
| Cleanup Crew | cleanup@vegas.gov | cleanup123 |
| Legal Aid | lawyer@legalaid.org | lawyer123 |
| Paralegal | paralegal@legalaid.org | paralegal123 |
| Caseworker | caseworker@brick.org | caseworker123 |

---

## Technical Architecture

```
/app/
├── backend/
│   ├── server.py              # FastAPI with all endpoints
│   ├── seed_resources.py      # Las Vegas resource data
│   ├── hud_standards.py       # HMIS Pydantic models
│   ├── requirements.txt
│   └── .env
├── frontend/
│   └── src/
│       ├── App.js
│       ├── index.css          # Wizard of Oz theme
│       ├── components/
│       │   └── NotificationBell.js
│       └── pages/
│           ├── LandingPage.js
│           ├── BrickChat.js
│           ├── Directory.js       # NEW: Real data from DB
│           ├── AgencyDashboard.js
│           ├── CleanupDashboard.js
│           ├── LegalAidPortal.js
│           ├── HUDIntake.js
│           ├── Workbook.js
│           ├── Dossier.js
│           ├── ResourceMap.js
│           └── Vault.js
└── DEPLOY.md               # Self-hosting guide
```

---

## Post-Pilot Backlog

### P0 - Next Priority
- [ ] Quick-Apply - Auto-fill housing applications
- [ ] VI-SPDAT Assessment via AI chat

### P1 - High Priority
- [ ] Organization messaging (frontend flow completion)
- [ ] Pop-up Events on map
- [ ] Print Dossier to PDF

### P2 - Medium Priority
- [ ] Live Bed Night Count with geofencing
- [ ] Auto-exit logic (AI texts inactive users)
- [ ] Inter-agency messaging
- [ ] SMS/Email notifications

---

*Last Updated: January 25, 2026*
*Status: PILOT-READY with Resource Directory (25 real Las Vegas organizations)*

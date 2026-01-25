"""
BRICK API Backend Tests - Pilot Readiness Testing
Tests all core features: auth, notifications, cleanup sweeps, vault, resources
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from requirements
TEST_CREDENTIALS = {
    "regular_user": {"email": "testuser@example.com", "password": "password123"},
    "agency_help": {"email": "agency@help.org", "password": "agency123"},
    "shine_a_light": {"email": "outreach@shinealightlv.org", "password": "shinealight2024"},
    "recover_lv": {"email": "team@recoverlv.org", "password": "recover2024"},
    "cleanup_crew": {"email": "cleanup@vegas.gov", "password": "cleanup123"},
    "legal_aid": {"email": "lawyer@legalaid.org", "password": "lawyer123"}
}


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root_accessible(self):
        """Test that API root is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "BRICK" in data["message"]
        print(f"✓ API root accessible: {data['message']}")


class TestAuthentication:
    """Authentication endpoint tests for all roles"""
    
    def test_login_regular_user(self):
        """Test regular user login"""
        creds = TEST_CREDENTIALS["regular_user"]
        response = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == creds["email"]
        assert data["user"]["role"] == "user"
        print(f"✓ Regular user login successful: {data['user']['full_name']}")
    
    def test_login_agency_help(self):
        """Test HELP agency staff login"""
        creds = TEST_CREDENTIALS["agency_help"]
        response = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "agency_staff"
        print(f"✓ Agency (HELP) login successful: {data['user']['organization']}")
    
    def test_login_shine_a_light(self):
        """Test Shine-A-Light agency login"""
        creds = TEST_CREDENTIALS["shine_a_light"]
        response = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "agency_staff"
        assert "Shine" in data["user"]["organization"]
        print(f"✓ Shine-A-Light login successful: {data['user']['organization']}")
    
    def test_login_recover_lv(self):
        """Test Recover LV agency login"""
        creds = TEST_CREDENTIALS["recover_lv"]
        response = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "agency_staff"
        assert "Recover" in data["user"]["organization"]
        print(f"✓ Recover LV login successful: {data['user']['organization']}")
    
    def test_login_cleanup_crew(self):
        """Test cleanup crew login"""
        creds = TEST_CREDENTIALS["cleanup_crew"]
        response = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "cleanup_crew"
        print(f"✓ Cleanup crew login successful: {data['user']['full_name']}")
    
    def test_login_legal_aid(self):
        """Test legal aid login"""
        creds = TEST_CREDENTIALS["legal_aid"]
        response = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert data["user"]["role"] == "legal_aid"
        print(f"✓ Legal aid login successful: {data['user']['full_name']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")
    
    def test_auth_me_endpoint(self):
        """Test /auth/me endpoint returns current user"""
        # First login
        creds = TEST_CREDENTIALS["regular_user"]
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        token = login_res.json()["access_token"]
        
        # Then get current user
        response = requests.get(f"{BASE_URL}/api/auth/me", 
                               headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == creds["email"]
        print(f"✓ Auth/me endpoint working: {data['email']}")


class TestUserRegistration:
    """Test new user registration flow"""
    
    def test_register_new_user(self):
        """Test new user registration creates flashcards"""
        unique_email = f"TEST_newuser_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "full_name": "Test New User",
            "phone": "702-555-0123",
            "is_veteran": False
        })
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "user"
        
        # Verify flashcards were auto-generated
        token = data["access_token"]
        flashcards_res = requests.get(f"{BASE_URL}/api/flashcards",
                                      headers={"Authorization": f"Bearer {token}"})
        assert flashcards_res.status_code == 200
        flashcards = flashcards_res.json()
        assert len(flashcards) > 0, "Flashcards should be auto-generated for new users"
        print(f"✓ New user registered with {len(flashcards)} auto-generated flashcards")
    
    def test_register_duplicate_email(self):
        """Test registration with existing email fails"""
        creds = TEST_CREDENTIALS["regular_user"]
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": creds["email"],
            "password": "testpass123",
            "full_name": "Duplicate User"
        })
        assert response.status_code == 400
        print("✓ Duplicate email registration correctly rejected")


class TestNotifications:
    """Test notification system"""
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_notifications(self, user_token):
        """Test getting notifications for user"""
        response = requests.get(f"{BASE_URL}/api/notifications",
                               headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "notifications" in data
        assert "unread_count" in data
        print(f"✓ Notifications endpoint working: {data['unread_count']} unread")
    
    def test_mark_all_notifications_read(self, user_token):
        """Test marking all notifications as read"""
        response = requests.patch(f"{BASE_URL}/api/notifications/read-all", json={},
                                 headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        print("✓ Mark all notifications read working")


class TestCleanupSweeps:
    """Test cleanup sweep posting and notification creation"""
    
    @pytest.fixture
    def cleanup_token(self):
        """Get cleanup crew token"""
        creds = TEST_CREDENTIALS["cleanup_crew"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_sweeps(self, cleanup_token):
        """Test getting cleanup sweeps"""
        response = requests.get(f"{BASE_URL}/api/cleanup/sweeps",
                               headers={"Authorization": f"Bearer {cleanup_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get sweeps working: {len(data)} sweeps found")
    
    def test_post_sweep_creates_notifications(self, cleanup_token, user_token):
        """Test posting a sweep creates notifications for users"""
        # Get initial notification count for user
        initial_notifs = requests.get(f"{BASE_URL}/api/notifications",
                                      headers={"Authorization": f"Bearer {user_token}"})
        initial_count = len(initial_notifs.json()["notifications"])
        
        # Post a new sweep
        sweep_data = {
            "location": "TEST_Fremont Street underpass",
            "date": "2026-02-01",
            "time": "08:00",
            "description": "Test sweep for pilot readiness"
        }
        response = requests.post(f"{BASE_URL}/api/cleanup/sweeps", json=sweep_data,
                                headers={"Authorization": f"Bearer {cleanup_token}"})
        assert response.status_code == 200, f"Post sweep failed: {response.text}"
        data = response.json()
        assert "sweep_id" in data or "id" in data
        print(f"✓ Sweep posted successfully")
        
        # Verify notification was created for user
        new_notifs = requests.get(f"{BASE_URL}/api/notifications",
                                  headers={"Authorization": f"Bearer {user_token}"})
        new_count = len(new_notifs.json()["notifications"])
        assert new_count > initial_count, "Notification should be created for user when sweep is posted"
        
        # Check notification content
        latest_notif = new_notifs.json()["notifications"][0]
        assert latest_notif["notification_type"] == "sweep_alert"
        assert "Cleanup" in latest_notif["title"] or "cleanup" in latest_notif["title"].lower() or "Sweep" in latest_notif["title"]
        print(f"✓ Sweep notification created for user: {latest_notif['title']}")


class TestVault:
    """Test document vault functionality"""
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_vault_documents(self, user_token):
        """Test getting vault documents"""
        response = requests.get(f"{BASE_URL}/api/vault/documents",
                               headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Vault documents endpoint working: {len(data)} documents")
    
    def test_upload_document(self, user_token):
        """Test uploading a document to vault"""
        import base64
        test_content = base64.b64encode(b"Test document content").decode()
        
        response = requests.post(f"{BASE_URL}/api/vault/upload", json={
            "document_type": "other",
            "file_name": "TEST_document.txt",
            "file_data": test_content
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        print(f"✓ Document upload working: {data['id']}")


class TestResources:
    """Test resource map functionality"""
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_resources(self, user_token):
        """Test getting Las Vegas resources"""
        response = requests.get(f"{BASE_URL}/api/resources",
                               headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Resources endpoint working: {len(data)} resources")
    
    def test_get_resources_by_category(self, user_token):
        """Test filtering resources by category"""
        response = requests.get(f"{BASE_URL}/api/resources?category=shelter",
                               headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        for resource in data:
            assert resource["category"] == "shelter"
        print(f"✓ Resource filtering working: {len(data)} shelters")


class TestAgencyDashboard:
    """Test agency dashboard functionality"""
    
    @pytest.fixture
    def agency_token(self):
        """Get agency staff token"""
        creds = TEST_CREDENTIALS["agency_help"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_unified_clients(self, agency_token):
        """Test getting unified client list"""
        response = requests.get(f"{BASE_URL}/api/agency/clients/unified",
                               headers={"Authorization": f"Bearer {agency_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "clients" in data
        assert "total_clients" in data
        print(f"✓ Unified clients endpoint working: {data['total_clients']} clients")
    
    def test_get_hud_report(self, agency_token):
        """Test getting HUD report"""
        response = requests.get(f"{BASE_URL}/api/caseworker/hud-report",
                               headers={"Authorization": f"Bearer {agency_token}"})
        assert response.status_code == 200
        data = response.json()
        assert "total_clients" in data
        assert "veteran_clients" in data
        print(f"✓ HUD report endpoint working: {data['total_clients']} total clients")


class TestLegalAid:
    """Test legal aid functionality"""
    
    @pytest.fixture
    def legal_token(self):
        """Get legal aid token"""
        creds = TEST_CREDENTIALS["legal_aid"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_legal_cases(self, legal_token):
        """Test getting legal cases"""
        response = requests.get(f"{BASE_URL}/api/legal/cases",
                               headers={"Authorization": f"Bearer {legal_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Legal cases endpoint working: {len(data)} cases")
    
    def test_get_legal_forms(self, legal_token):
        """Test getting legal forms"""
        response = requests.get(f"{BASE_URL}/api/legal/forms",
                               headers={"Authorization": f"Bearer {legal_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Legal forms endpoint working: {len(data)} forms")


class TestBrickChat:
    """Test BRICK AI chat functionality"""
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_send_chat_message(self, user_token):
        """Test sending a message to BRICK AI"""
        response = requests.post(f"{BASE_URL}/api/chat/message", json={
            "message": "Hello, I need help finding a shelter",
            "session_id": None
        }, headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200, f"Chat failed: {response.text}"
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert len(data["response"]) > 0
        print(f"✓ BRICK AI chat working: received {len(data['response'])} char response")


class TestDossier:
    """Test dossier functionality"""
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_dossier(self, user_token):
        """Test getting user dossier"""
        response = requests.get(f"{BASE_URL}/api/dossier",
                               headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Dossier endpoint working: {len(data)} entries")


class TestFlashcards:
    """Test flashcard functionality"""
    
    @pytest.fixture
    def user_token(self):
        """Get regular user token"""
        creds = TEST_CREDENTIALS["regular_user"]
        res = requests.post(f"{BASE_URL}/api/auth/login", json=creds)
        return res.json()["access_token"]
    
    def test_get_flashcards(self, user_token):
        """Test getting user flashcards"""
        response = requests.get(f"{BASE_URL}/api/flashcards",
                               headers={"Authorization": f"Bearer {user_token}"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Flashcards endpoint working: {len(data)} cards")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

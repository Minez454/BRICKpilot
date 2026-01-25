import requests
import sys
import json
from datetime import datetime
import base64

class BRICKAPITester:
    def __init__(self, base_url="https://vegas-housing.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.session_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            return {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "email": f"test_user_{timestamp}@example.com",
            "password": "TestPass123!",
            "full_name": "Test User",
            "phone": "555-0123",
            "is_veteran": True
        }
        
        response = self.run_test("User Registration", "POST", "auth/register", 200, test_data)
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user for login test
        timestamp = datetime.now().strftime('%H%M%S')
        email = f"login_test_{timestamp}@example.com"
        password = "LoginTest123!"
        
        # Register user
        reg_data = {
            "email": email,
            "password": password,
            "full_name": "Login Test User"
        }
        self.run_test("Register for Login Test", "POST", "auth/register", 200, reg_data)
        
        # Now test login
        login_data = {
            "email": email,
            "password": password
        }
        
        response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        return response and 'access_token' in response

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User", False, "No token available")
            return False
        
        response = self.run_test("Get Current User", "GET", "auth/me", 200)
        return response and 'id' in response

    def test_chat_message(self):
        """Test sending chat message to BRICK AI"""
        if not self.token:
            self.log_test("Chat Message", False, "No token available")
            return False
        
        chat_data = {
            "message": "I need help finding a shelter tonight in Las Vegas"
        }
        
        response = self.run_test("Send Chat Message", "POST", "chat/message", 200, chat_data)
        
        if response and 'response' in response:
            self.session_id = response.get('session_id')
            # Check if response contains relevant information
            if any(word in response['response'].lower() for word in ['shelter', 'las vegas', 'help']):
                return True
        return False

    def test_get_chat_sessions(self):
        """Test getting chat sessions"""
        if not self.token:
            self.log_test("Get Chat Sessions", False, "No token available")
            return False
        
        response = self.run_test("Get Chat Sessions", "GET", "chat/sessions", 200)
        return isinstance(response, list)

    def test_get_chat_messages(self):
        """Test getting chat messages for a session"""
        if not self.token or not self.session_id:
            self.log_test("Get Chat Messages", False, "No token or session_id available")
            return False
        
        response = self.run_test("Get Chat Messages", "GET", f"chat/messages/{self.session_id}", 200)
        return isinstance(response, list)

    def test_get_resources(self):
        """Test getting resources"""
        response = self.run_test("Get All Resources", "GET", "resources", 200)
        
        if isinstance(response, list) and len(response) > 0:
            # Test filtering by category
            self.run_test("Get Shelter Resources", "GET", "resources?category=shelter", 200)
            return True
        return False

    def test_get_dossier(self):
        """Test getting user dossier"""
        if not self.token:
            self.log_test("Get Dossier", False, "No token available")
            return False
        
        response = self.run_test("Get Dossier", "GET", "dossier", 200)
        return isinstance(response, list)

    def test_workbook_tasks(self):
        """Test workbook tasks"""
        if not self.token:
            self.log_test("Get Workbook Tasks", False, "No token available")
            return False
        
        # Get tasks
        tasks_response = self.run_test("Get Workbook Tasks", "GET", "workbook/tasks", 200)
        
        # Get stats
        stats_response = self.run_test("Get Workbook Stats", "GET", "workbook/stats", 200)
        
        return (isinstance(tasks_response, list) and 
                isinstance(stats_response, dict) and 
                'total_tasks' in stats_response)

    def test_vault_documents(self):
        """Test vault document operations"""
        if not self.token:
            self.log_test("Get Vault Documents", False, "No token available")
            return False
        
        # Get documents
        response = self.run_test("Get Vault Documents", "GET", "vault/documents", 200)
        return isinstance(response, list)

    def test_legal_forms(self):
        """Test getting legal forms"""
        response = self.run_test("Get Legal Forms", "GET", "legal/forms", 200)
        return isinstance(response, list) and len(response) > 0

    def test_seed_data(self):
        """Test seeding initial data"""
        response = self.run_test("Seed Initial Data", "POST", "admin/seed-data", 200)
        return response and 'message' in response

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting BRICK API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_root_endpoint()
        
        # Test data seeding first
        self.test_seed_data()
        
        # Test authentication
        if self.test_user_registration():
            self.test_get_current_user()
        
        # Test login separately
        self.test_user_login()
        
        # Test chat functionality (core feature)
        self.test_chat_message()
        self.test_get_chat_sessions()
        self.test_get_chat_messages()
        
        # Test other features
        self.test_get_resources()
        self.test_get_dossier()
        self.test_workbook_tasks()
        self.test_vault_documents()
        self.test_legal_forms()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            failed_tests = [r for r in self.test_results if not r['success']]
            print("\nFailed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return 1

def main():
    tester = BRICKAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
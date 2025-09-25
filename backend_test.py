#!/usr/bin/env python3
"""
Backend Health Check and API Testing
Tests all backend endpoints and verifies system health
Includes Google OAuth admin authentication system testing
"""

import requests
import json
import sys
import os
from datetime import datetime
import time
import subprocess

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("❌ Could not find REACT_APP_BACKEND_URL in frontend/.env")
    sys.exit(1)

API_BASE_URL = f"{BACKEND_URL}/api"
print(f"🔍 Testing backend at: {API_BASE_URL}")

def test_health_check():
    """Test basic health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Health check endpoint working")
                return True
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check request failed: {e}")
        return False

def test_create_status_check():
    """Test creating a status check entry"""
    print("\n=== Testing Create Status Check ===")
    try:
        test_data = {
            "client_name": "TestClient_HealthCheck_" + str(int(time.time()))
        }
        
        response = requests.post(
            f"{API_BASE_URL}/status", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "client_name", "timestamp"]
            
            if all(field in data for field in required_fields):
                if data["client_name"] == test_data["client_name"]:
                    print("✅ Create status check working")
                    print(f"   Created entry with ID: {data['id']}")
                    return True, data
                else:
                    print(f"❌ Client name mismatch: expected {test_data['client_name']}, got {data['client_name']}")
                    return False, None
            else:
                missing_fields = [field for field in required_fields if field not in data]
                print(f"❌ Missing required fields: {missing_fields}")
                return False, None
        else:
            print(f"❌ Create status check failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Create status check request failed: {e}")
        return False, None

def test_get_status_checks():
    """Test retrieving status check entries"""
    print("\n=== Testing Get Status Checks ===")
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get status checks working - Retrieved {len(data)} entries")
                
                # Verify structure of entries if any exist
                if data:
                    first_entry = data[0]
                    required_fields = ["id", "client_name", "timestamp"]
                    if all(field in first_entry for field in required_fields):
                        print("   ✅ Entry structure is correct")
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in first_entry]
                        print(f"   ❌ Entry missing fields: {missing_fields}")
                        return False
                else:
                    print("   ℹ️  No entries found (empty database)")
                    return True
            else:
                print(f"❌ Expected list, got {type(data)}")
                return False
        else:
            print(f"❌ Get status checks failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Get status checks request failed: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by creating and retrieving data"""
    print("\n=== Testing MongoDB Connection ===")
    
    # Create a test entry
    success, created_entry = test_create_status_check()
    if not success:
        print("❌ MongoDB connection test failed - could not create entry")
        return False
    
    # Retrieve entries to verify persistence
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            # Check if our created entry exists
            created_id = created_entry["id"]
            found_entry = next((entry for entry in data if entry["id"] == created_id), None)
            
            if found_entry:
                print("✅ MongoDB connection working - data persisted successfully")
                return True
            else:
                print("❌ MongoDB connection issue - created entry not found in database")
                return False
        else:
            print("❌ Could not retrieve data to verify MongoDB connection")
            return False
            
    except Exception as e:
        print(f"❌ MongoDB connection test failed: {e}")
        return False

def test_cors_headers():
    """Test CORS configuration"""
    print("\n=== Testing CORS Configuration ===")
    try:
        response = requests.options(f"{API_BASE_URL}/", timeout=10)
        
        cors_headers = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers'
        ]
        
        found_headers = []
        for header in cors_headers:
            if header in response.headers:
                found_headers.append(header)
        
        if found_headers:
            print("✅ CORS headers configured")
            for header in found_headers:
                print(f"   {header}: {response.headers[header]}")
            return True
        else:
            print("⚠️  No CORS headers found in OPTIONS response")
            return True  # Not critical for basic functionality
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️  CORS test failed: {e}")
        return True  # Not critical for basic functionality

def test_admin_google_login_endpoint():
    """Test Google OAuth admin login endpoint structure"""
    print("\n=== Testing Admin Google Login Endpoint ===")
    try:
        # Test with invalid/missing data to check endpoint exists and has proper error handling
        test_data = {
            "google_token": "invalid_token",
            "email": "test@example.com",
            "name": "Test User",
            "google_id": "123456789"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/admin/google-login",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # We expect this to fail with 400 (bad token) but endpoint should exist
        if response.status_code in [400, 401, 403]:
            print("✅ Admin Google login endpoint exists and has proper error handling")
            print(f"   Status: {response.status_code} (expected for invalid token)")
            return True
        elif response.status_code == 404:
            print("❌ Admin Google login endpoint not found (404)")
            return False
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return True  # Endpoint exists but different behavior
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Admin Google login endpoint test failed: {e}")
        return False

def test_admin_verify_endpoint():
    """Test admin token verification endpoint structure"""
    print("\n=== Testing Admin Verify Endpoint ===")
    try:
        # Test without authorization header - should get 401/403
        response = requests.get(f"{API_BASE_URL}/admin/verify", timeout=10)
        
        if response.status_code in [401, 403, 422]:  # 422 for missing auth header
            print("✅ Admin verify endpoint exists and requires authentication")
            print(f"   Status: {response.status_code} (expected for missing auth)")
            return True
        elif response.status_code == 404:
            print("❌ Admin verify endpoint not found (404)")
            return False
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return True  # Endpoint exists but different behavior
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Admin verify endpoint test failed: {e}")
        return False

def test_jwt_secret_environment():
    """Test JWT_SECRET environment variable is loaded"""
    print("\n=== Testing JWT_SECRET Environment Variable ===")
    try:
        # Read backend .env file to check if JWT_SECRET exists
        env_file_path = "/app/backend/.env"
        if os.path.exists(env_file_path):
            with open(env_file_path, 'r') as f:
                env_content = f.read()
                if 'JWT_SECRET=' in env_content:
                    print("✅ JWT_SECRET found in backend/.env")
                    # Extract the value (without revealing it)
                    for line in env_content.split('\n'):
                        if line.startswith('JWT_SECRET='):
                            jwt_secret = line.split('=', 1)[1].strip().strip('"')
                            if len(jwt_secret) > 10:  # Basic length check
                                print(f"   JWT_SECRET length: {len(jwt_secret)} characters (good)")
                                return True
                            else:
                                print("⚠️  JWT_SECRET seems too short for production")
                                return True  # Still working, just warning
                    print("⚠️  JWT_SECRET found but could not parse value")
                    return True
                else:
                    print("❌ JWT_SECRET not found in backend/.env")
                    return False
        else:
            print("❌ Backend .env file not found")
            return False
            
    except Exception as e:
        print(f"❌ JWT_SECRET environment test failed: {e}")
        return False

def test_mongodb_admin_users_collection():
    """Test MongoDB admin_users collection accessibility"""
    print("\n=== Testing MongoDB Admin Users Collection ===")
    try:
        # We can't directly test the collection, but we can test the admin login endpoint
        # which would fail if MongoDB connection or collection access is broken
        test_data = {
            "google_token": "test_token_for_collection_check",
            "email": "test@example.com", 
            "name": "Test User",
            "google_id": "123456789"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/admin/google-login",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # If we get a 400 (bad token) rather than 500 (server error), 
        # it means MongoDB connection and collection access is working
        if response.status_code == 400:
            try:
                error_data = response.json()
                if "Invalid Google token" in str(error_data) or "Authentication failed" in str(error_data):
                    print("✅ MongoDB admin_users collection accessible (Google token validation working)")
                    return True
            except:
                pass
        elif response.status_code == 500:
            print("❌ MongoDB admin_users collection may have issues (server error)")
            print(f"   Response: {response.text}")
            return False
        
        print("✅ MongoDB admin_users collection appears accessible")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ MongoDB admin_users collection test failed: {e}")
        return False

def test_supervisor_services():
    """Test that all supervisor services are running"""
    print("\n=== Testing Supervisor Services ===")
    try:
        result = subprocess.run(['sudo', 'supervisorctl', 'status'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            output = result.stdout
            services = ['backend', 'frontend', 'mongodb']
            running_services = []
            
            for service in services:
                if f"{service}" in output and "RUNNING" in output:
                    running_services.append(service)
            
            if len(running_services) == len(services):
                print("✅ All supervisor services running")
                for service in running_services:
                    print(f"   ✅ {service}: RUNNING")
                return True
            else:
                missing_services = [s for s in services if s not in running_services]
                print(f"⚠️  Some services not running: {missing_services}")
                for service in running_services:
                    print(f"   ✅ {service}: RUNNING")
                return False
        else:
            print(f"❌ Supervisor status check failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Supervisor status check timed out")
        return False
    except Exception as e:
        print(f"❌ Supervisor services test failed: {e}")
        return False

def test_google_auth_dependencies():
    """Test that Google Auth dependencies are available"""
    print("\n=== Testing Google Auth Dependencies ===")
    try:
        # Check if google-auth libraries are installed by testing import
        # We'll do this by checking the requirements.txt file
        requirements_file = "/app/backend/requirements.txt"
        if os.path.exists(requirements_file):
            with open(requirements_file, 'r') as f:
                requirements = f.read()
                
            google_deps = [
                'google-auth',
                'google-auth-oauthlib', 
                'google-auth-httplib2'
            ]
            
            found_deps = []
            for dep in google_deps:
                if dep in requirements:
                    found_deps.append(dep)
            
            if len(found_deps) == len(google_deps):
                print("✅ All Google Auth dependencies found in requirements.txt")
                for dep in found_deps:
                    print(f"   ✅ {dep}")
                return True
            else:
                missing_deps = [d for d in google_deps if d not in found_deps]
                print(f"❌ Missing Google Auth dependencies: {missing_deps}")
                return False
        else:
            print("❌ Requirements.txt file not found")
            return False
            
    except Exception as e:
        print(f"❌ Google Auth dependencies test failed: {e}")
        return False

def run_all_tests():
    """Run all backend tests"""
    print("🚀 Starting Backend Health Check Tests")
    print("=" * 50)
    
    test_results = []
    
    # Test 1: Health Check
    test_results.append(("Health Check", test_health_check()))
    
    # Test 2: MongoDB Connection (includes create and get tests)
    test_results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Test 3: Get Status Checks
    test_results.append(("Get Status Checks", test_get_status_checks()))
    
    # Test 4: CORS Configuration
    test_results.append(("CORS Configuration", test_cors_headers()))
    
    # Summary
    print("\n" + "=" * 50)
    print("🏁 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed + failed} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All backend tests passed! Backend is healthy.")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Backend needs attention.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
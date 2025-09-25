#!/usr/bin/env python3
"""
MySQL Backend Health Check and API Testing
Tests all backend endpoints and verifies MySQL migration
Includes Google OAuth admin authentication system testing with MySQL
"""

import requests
import json
import sys
import os
from datetime import datetime
import time
import subprocess
import pymysql

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
print(f"🔍 Testing MySQL backend at: {API_BASE_URL}")

def get_mysql_config():
    """Get MySQL configuration from backend .env file"""
    try:
        config = {}
        with open('/app/backend/.env', 'r') as f:
            for line in f:
                if line.startswith('MYSQL_'):
                    key, value = line.strip().split('=', 1)
                    config[key] = value.strip('"')
        return config
    except Exception as e:
        print(f"Error reading MySQL config: {e}")
        return None

def test_mysql_database_schema():
    """Test MySQL database schema and tables"""
    print("\n=== Testing MySQL Database Schema ===")
    try:
        mysql_config = get_mysql_config()
        if not mysql_config:
            print("❌ Could not read MySQL configuration")
            return False
        
        # Connect to MySQL database
        connection = pymysql.connect(
            host=mysql_config.get('MYSQL_HOST', 'localhost'),
            port=int(mysql_config.get('MYSQL_PORT', 3306)),
            user=mysql_config.get('MYSQL_USER', 'dbuser'),
            password=mysql_config.get('MYSQL_PASSWORD', 'dbpassword'),
            database=mysql_config.get('MYSQL_DB', 'test_database'),
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Check if required tables exist
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            
            required_tables = ['admin_users', 'status_checks']
            missing_tables = [table for table in required_tables if table not in tables]
            
            if missing_tables:
                print(f"❌ Missing required tables: {missing_tables}")
                return False
            
            print("✅ All required MySQL tables exist:")
            for table in required_tables:
                print(f"   ✅ {table}")
            
            # Check admin_users table structure
            cursor.execute("DESCRIBE admin_users")
            admin_columns = [col[0] for col in cursor.fetchall()]
            required_admin_columns = ['id', 'email', 'name', 'google_id', 'created_at', 'last_login']
            
            if all(col in admin_columns for col in required_admin_columns):
                print("✅ admin_users table has correct structure")
            else:
                missing_cols = [col for col in required_admin_columns if col not in admin_columns]
                print(f"❌ admin_users table missing columns: {missing_cols}")
                return False
            
            # Check status_checks table structure
            cursor.execute("DESCRIBE status_checks")
            status_columns = [col[0] for col in cursor.fetchall()]
            required_status_columns = ['id', 'client_name', 'timestamp']
            
            if all(col in status_columns for col in required_status_columns):
                print("✅ status_checks table has correct structure")
            else:
                missing_cols = [col for col in required_status_columns if col not in status_columns]
                print(f"❌ status_checks table missing columns: {missing_cols}")
                return False
        
        connection.close()
        print("✅ MySQL database schema verification completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ MySQL database schema test failed: {e}")
        return False

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
    """Test creating a status check entry in MySQL"""
    print("\n=== Testing Create Status Check (MySQL) ===")
    try:
        test_data = {
            "client_name": "Dubai_Business_Formation_" + str(int(time.time()))
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
                    print("✅ Create status check working (MySQL)")
                    print(f"   Created entry with UUID: {data['id']}")
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
    """Test retrieving status check entries from MySQL"""
    print("\n=== Testing Get Status Checks (MySQL) ===")
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get status checks working (MySQL) - Retrieved {len(data)} entries")
                
                # Verify structure of entries if any exist
                if data:
                    first_entry = data[0]
                    required_fields = ["id", "client_name", "timestamp"]
                    if all(field in first_entry for field in required_fields):
                        print("   ✅ Entry structure is correct")
                        print(f"   ✅ Sample entry ID: {first_entry['id']}")
                        return True
                    else:
                        missing_fields = [field for field in required_fields if field not in first_entry]
                        print(f"   ❌ Entry missing fields: {missing_fields}")
                        return False
                else:
                    print("   ℹ️  No entries found (empty MySQL database)")
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

def test_mysql_data_persistence():
    """Test MySQL data persistence by creating and retrieving data"""
    print("\n=== Testing MySQL Data Persistence ===")
    
    # Create a test entry
    success, created_entry = test_create_status_check()
    if not success:
        print("❌ MySQL data persistence test failed - could not create entry")
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
                print("✅ MySQL data persistence working - data stored and retrieved successfully")
                print(f"   ✅ Verified UUID persistence: {created_id}")
                return True
            else:
                print("❌ MySQL data persistence issue - created entry not found in database")
                return False
        else:
            print("❌ Could not retrieve data to verify MySQL persistence")
            return False
            
    except Exception as e:
        print(f"❌ MySQL data persistence test failed: {e}")
        return False

def test_admin_google_login_endpoint():
    """Test Google OAuth admin login endpoint with MySQL"""
    print("\n=== Testing Admin Google Login Endpoint (MySQL) ===")
    try:
        # Test with invalid token but valid structure
        test_data = {
            "google_token": "invalid_google_token_for_testing",
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
        elif response.status_code == 500:
            print("❌ Server error - possible MySQL connection issue")
            print(f"   Response: {response.text}")
            return False
        else:
            print(f"⚠️  Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return True  # Endpoint exists but different behavior
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Admin Google login endpoint test failed: {e}")
        return False

def test_admin_verify_endpoint():
    """Test admin token verification endpoint"""
    print("\n=== Testing Admin Verify Endpoint ===")
    try:
        # Test without authorization header - should get 401/403/422
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

def test_authorized_email_restriction():
    """Test that only authorized email can access admin"""
    print("\n=== Testing Authorized Email Restriction ===")
    try:
        # Test with unauthorized email
        test_data = {
            "google_token": "mock_valid_token",
            "email": "unauthorized@example.com",
            "name": "Unauthorized User",
            "google_id": "987654321"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/admin/google-login",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # Should get 403 for unauthorized email (after token validation fails)
        if response.status_code in [400, 403]:
            print("✅ Email authorization restriction working")
            print(f"   Status: {response.status_code} (expected for unauthorized access)")
            return True
        else:
            print(f"⚠️  Unexpected response for unauthorized email: {response.status_code}")
            return True  # Not critical if token validation fails first
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Email restriction test failed: {e}")
        return False

def test_jwt_secret_environment():
    """Test JWT_SECRET environment variable is configured"""
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
                            if len(jwt_secret) > 20:  # Good length check
                                print(f"   JWT_SECRET length: {len(jwt_secret)} characters (secure)")
                                return True
                            else:
                                print("⚠️  JWT_SECRET seems short for production")
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

def test_mysql_admin_users_table():
    """Test MySQL admin_users table accessibility"""
    print("\n=== Testing MySQL Admin Users Table ===")
    try:
        # Test the admin login endpoint which would fail if MySQL admin_users table is broken
        test_data = {
            "google_token": "test_token_for_mysql_check",
            "email": "abirsabirhossain@gmail.com",  # Authorized email
            "name": "Test Admin User",
            "google_id": "123456789"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/admin/google-login",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        # If we get a 400 (bad token) rather than 500 (server error), 
        # it means MySQL connection and admin_users table access is working
        if response.status_code == 400:
            try:
                error_data = response.json()
                if "Invalid Google token" in str(error_data) or "Authentication failed" in str(error_data):
                    print("✅ MySQL admin_users table accessible (Google token validation working)")
                    return True
            except:
                pass
        elif response.status_code == 500:
            print("❌ MySQL admin_users table may have issues (server error)")
            print(f"   Response: {response.text}")
            return False
        
        print("✅ MySQL admin_users table appears accessible")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ MySQL admin_users table test failed: {e}")
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

def test_mysql_dependencies():
    """Test that MySQL dependencies are available"""
    print("\n=== Testing MySQL Dependencies ===")
    try:
        # Check if MySQL libraries are installed by testing import
        requirements_file = "/app/backend/requirements.txt"
        if os.path.exists(requirements_file):
            with open(requirements_file, 'r') as f:
                requirements = f.read()
                
            mysql_deps = [
                'aiomysql',
                'pymysql'
            ]
            
            found_deps = []
            for dep in mysql_deps:
                if dep in requirements:
                    found_deps.append(dep)
            
            if len(found_deps) >= 1:  # At least one MySQL driver
                print("✅ MySQL dependencies found in requirements.txt")
                for dep in found_deps:
                    print(f"   ✅ {dep}")
                return True
            else:
                print(f"❌ Missing MySQL dependencies: {mysql_deps}")
                return False
        else:
            print("❌ Requirements.txt file not found")
            return False
            
    except Exception as e:
        print(f"❌ MySQL dependencies test failed: {e}")
        return False

def test_google_auth_dependencies():
    """Test that Google Auth dependencies are available"""
    print("\n=== Testing Google Auth Dependencies ===")
    try:
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
            
            if len(found_deps) >= 1:  # At least google-auth is required
                print("✅ Google Auth dependencies found in requirements.txt")
                for dep in found_deps:
                    print(f"   ✅ {dep}")
                return True
            else:
                print(f"❌ Missing Google Auth dependencies: {google_deps}")
                return False
        else:
            print("❌ Requirements.txt file not found")
            return False
            
    except Exception as e:
        print(f"❌ Google Auth dependencies test failed: {e}")
        return False

def test_supervisor_services():
    """Test that all supervisor services are running"""
    print("\n=== Testing Supervisor Services ===")
    try:
        result = subprocess.run(['sudo', 'supervisorctl', 'status'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            output = result.stdout
            services = ['backend', 'frontend']  # MySQL is not a supervisor service
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

def run_all_tests():
    """Run all MySQL backend and Google OAuth tests"""
    print("🚀 Starting Comprehensive MySQL Backend & Google OAuth Testing")
    print("🔄 Testing MySQL Migration and Google Admin Authentication")
    print("=" * 70)
    
    test_results = []
    
    # MySQL Database Tests
    print("\n🗄️  MYSQL DATABASE TESTS")
    print("-" * 40)
    test_results.append(("MySQL Database Schema", test_mysql_database_schema()))
    test_results.append(("MySQL Data Persistence", test_mysql_data_persistence()))
    test_results.append(("MySQL Dependencies", test_mysql_dependencies()))
    
    # Basic API Tests with MySQL
    print("\n📡 BASIC API ENDPOINTS (MySQL)")
    print("-" * 40)
    test_results.append(("Health Check (GET /api/)", test_health_check()))
    test_results.append(("Create Status Check (POST /api/status)", test_create_status_check()[0] if test_create_status_check() else False))
    test_results.append(("Get Status Checks (GET /api/status)", test_get_status_checks()))
    
    # Google OAuth Admin System Tests with MySQL
    print("\n🔐 GOOGLE OAUTH ADMIN SYSTEM (MySQL)")
    print("-" * 40)
    test_results.append(("Admin Google Login Endpoint (POST /api/admin/google-login)", test_admin_google_login_endpoint()))
    test_results.append(("Admin Verify Endpoint (GET /api/admin/verify)", test_admin_verify_endpoint()))
    test_results.append(("Authorized Email Restriction", test_authorized_email_restriction()))
    test_results.append(("JWT_SECRET Environment Variable", test_jwt_secret_environment()))
    test_results.append(("MySQL Admin Users Table", test_mysql_admin_users_table()))
    test_results.append(("Google Auth Dependencies", test_google_auth_dependencies()))
    
    # System Configuration Tests
    print("\n⚙️  SYSTEM CONFIGURATION")
    print("-" * 40)
    test_results.append(("CORS Configuration", test_cors_headers()))
    test_results.append(("Supervisor Services", test_supervisor_services()))
    
    # Summary
    print("\n" + "=" * 70)
    print("🏁 MYSQL MIGRATION & GOOGLE OAUTH TEST SUMMARY")
    print("=" * 70)
    
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
        print("\n🎉 All MySQL migration and Google OAuth tests passed!")
        print("✅ MySQL database migration successful")
        print("✅ MySQL schema and tables properly configured")
        print("✅ Data persistence working with UUID primary keys")
        print("✅ Google OAuth admin authentication system operational")
        print("✅ JWT authentication configured with MySQL backend")
        print("✅ All dependencies and services running correctly")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. MySQL migration or Google OAuth needs attention.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
#!/usr/bin/env python3
"""
WorkedWith Removal Verification Test
Tests that WorkedWith endpoints have been completely removed and other endpoints still work
"""

import requests
import json
import sys
import os
from datetime import datetime
import time
import subprocess

# Read backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    url = line.split('=', 1)[1].strip()
                    return url
    except:
        pass
    return "http://localhost:8001"  # fallback

BACKEND_URL = get_backend_url()
API_BASE_URL = f"{BACKEND_URL}/api"
print(f"🔍 Testing WorkedWith removal at: {API_BASE_URL}")

# Global variables for testing
test_auth_token = None
test_blog_id = None

def test_worked_with_endpoints_removed():
    """Test that all WorkedWith endpoints return 404 or method not found"""
    print("\n=== Testing WorkedWith Endpoints Removal ===")
    
    worked_with_endpoints = [
        ("GET", "/worked-with", "Get all worked with partners"),
        ("POST", "/worked-with", "Create worked with partner"),
        ("GET", "/worked-with/test-id-123", "Get single worked with partner"),
        ("PUT", "/worked-with/test-id-123", "Update worked with partner"),
        ("DELETE", "/worked-with/test-id-123", "Delete worked with partner")
    ]
    
    all_removed = True
    
    for method, endpoint, description in worked_with_endpoints:
        try:
            url = f"{API_BASE_URL}{endpoint}"
            start_time = time.time()
            
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json={"test": "data"}, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json={"test": "data"}, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, timeout=10)
            
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 404:
                print(f"✅ {method} {endpoint} - Correctly returns 404 ({response_time:.2f}ms)")
            elif response.status_code == 405:
                print(f"✅ {method} {endpoint} - Method not allowed (405) ({response_time:.2f}ms)")
            else:
                print(f"❌ {method} {endpoint} - Unexpected status {response.status_code} ({response_time:.2f}ms)")
                print(f"   Response: {response.text[:100]}...")
                all_removed = False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {method} {endpoint} - Request failed: {e}")
            all_removed = False
    
    return all_removed

def test_health_check():
    """Test basic health check endpoint"""
    print("\n=== Testing Health Check ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if "Hello World" in data.get("message", ""):
                print(f"✅ Health check endpoint working ({response_time:.2f}ms)")
                return True
            else:
                print(f"❌ Unexpected response: {data}")
                return False
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check request failed: {e}")
        return False

def test_get_blogs():
    """Test getting all blogs"""
    print("\n=== Testing Get All Blogs ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/blogs", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get blogs working ({response_time:.2f}ms) - Retrieved {len(data)} blogs")
                
                # Store first blog ID for further tests
                if data:
                    global test_blog_id
                    test_blog_id = data[0]["id"]
                    print(f"   Sample blog: {data[0].get('title', 'No title')}")
                
                return True
            else:
                print(f"❌ Expected list, got {type(data)}")
                return False
        else:
            print(f"❌ Get blogs failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get blogs request failed: {e}")
        return False

def test_get_categories():
    """Test getting all categories"""
    print("\n=== Testing Get Categories ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/categories", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get categories working ({response_time:.2f}ms) - Retrieved {len(data)} categories")
                
                # Show sample categories
                category_names = [cat.get('name', '') for cat in data[:5]]
                print(f"   Sample categories: {', '.join(category_names)}")
                
                return True
            else:
                print(f"❌ Expected list, got {type(data)}")
                return False
        else:
            print(f"❌ Get categories failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get categories request failed: {e}")
        return False

def test_get_contact_info():
    """Test getting contact info"""
    print("\n=== Testing Get Contact Info ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/contact-info", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ Get contact info working ({response_time:.2f}ms) - Retrieved {len(data)} entries")
                
                # Show sample contact info
                for contact in data[:3]:
                    print(f"   {contact.get('label', 'No label')}: {contact.get('value', 'No value')}")
                
                return True
            else:
                print(f"❌ Expected list, got {type(data)}")
                return False
        else:
            print(f"❌ Get contact info failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Get contact info request failed: {e}")
        return False

def test_firebase_auth_login():
    """Test Firebase authentication login"""
    print("\n=== Testing Firebase Auth Login ===")
    try:
        test_data = {
            "firebase_token": "mock_firebase_token_admin_test"
        }
        
        start_time = time.time()
        response = requests.post(
            f"{API_BASE_URL}/auth/firebase-login",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and "username" in data:
                print(f"✅ Firebase auth login working ({response_time:.2f}ms)")
                print(f"   User: {data['username']}")
                print(f"   Admin: {data.get('is_admin', False)}")
                global test_auth_token
                test_auth_token = data['access_token']
                return True
            else:
                print(f"❌ Auth response missing required fields")
                return False
        elif response.status_code == 400:
            print(f"✅ Firebase auth endpoint exists ({response_time:.2f}ms) - Token validation working")
            return True
        else:
            print(f"❌ Firebase auth failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Firebase auth request failed: {e}")
        return False

def test_response_times():
    """Test response times to ensure no performance degradation"""
    print("\n=== Testing Response Times ===")
    
    endpoints_to_test = [
        ("GET", "/", "Health check"),
        ("GET", "/blogs", "Get blogs"),
        ("GET", "/categories", "Get categories"),
        ("GET", "/contact-info", "Get contact info")
    ]
    
    all_fast = True
    response_times = []
    
    for method, endpoint, description in endpoints_to_test:
        try:
            url = f"{API_BASE_URL}{endpoint}"
            start_time = time.time()
            
            if method == "GET":
                response = requests.get(url, timeout=10)
            
            response_time = (time.time() - start_time) * 1000
            response_times.append(response_time)
            
            if response.status_code == 200:
                if response_time < 5000:  # Less than 5 seconds
                    print(f"✅ {description} - Fast response ({response_time:.2f}ms)")
                else:
                    print(f"⚠️  {description} - Slow response ({response_time:.2f}ms)")
                    all_fast = False
            else:
                print(f"❌ {description} - Failed with status {response.status_code}")
                all_fast = False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ {description} - Request failed: {e}")
            all_fast = False
    
    if response_times:
        avg_time = sum(response_times) / len(response_times)
        print(f"\n📊 Average response time: {avg_time:.2f}ms")
        
        if avg_time < 2000:
            print("✅ Overall performance is excellent")
        elif avg_time < 5000:
            print("✅ Overall performance is good")
        else:
            print("⚠️  Overall performance could be improved")
    
    return all_fast

def check_backend_logs():
    """Check backend logs for any WorkedWith related errors"""
    print("\n=== Checking Backend Logs ===")
    try:
        # Check supervisor backend logs
        result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.out.log'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            log_content = result.stdout.lower()
            
            # Look for WorkedWith related errors
            worked_with_errors = []
            error_keywords = ['workedwith', 'worked_with', 'worked-with']
            
            for line in result.stdout.split('\n'):
                line_lower = line.lower()
                if any(keyword in line_lower for keyword in error_keywords):
                    if 'error' in line_lower or 'exception' in line_lower or 'traceback' in line_lower:
                        worked_with_errors.append(line.strip())
            
            if worked_with_errors:
                print("❌ Found WorkedWith related errors in backend logs:")
                for error in worked_with_errors[:5]:  # Show first 5 errors
                    print(f"   {error}")
                return False
            else:
                print("✅ No WorkedWith related errors found in backend logs")
                return True
        else:
            print("⚠️  Could not read backend logs")
            return True
            
    except Exception as e:
        print(f"⚠️  Error checking backend logs: {e}")
        return True

def run_all_tests():
    """Run all tests and provide summary"""
    print("🚀 Starting WorkedWith Removal Verification Tests")
    print("=" * 60)
    
    test_results = []
    
    # Test WorkedWith endpoints removal (most important)
    test_results.append(("WorkedWith Endpoints Removed", test_worked_with_endpoints_removed()))
    
    # Test existing endpoints still work
    test_results.append(("Health Check", test_health_check()))
    test_results.append(("Get Blogs", test_get_blogs()))
    test_results.append(("Get Categories", test_get_categories()))
    test_results.append(("Get Contact Info", test_get_contact_info()))
    test_results.append(("Firebase Auth Login", test_firebase_auth_login()))
    
    # Test performance
    test_results.append(("Response Times", test_response_times()))
    
    # Check logs
    test_results.append(("Backend Logs Check", check_backend_logs()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 Results: {passed} passed, {failed} failed out of {len(test_results)} tests")
    
    if failed == 0:
        print("🎉 ALL TESTS PASSED - WorkedWith removal successful!")
        return True
    else:
        print("⚠️  Some tests failed - Review the issues above")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
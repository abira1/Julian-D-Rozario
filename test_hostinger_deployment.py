#!/usr/bin/env python3
"""
Test script for Hostinger deployment
Run this to verify everything is working correctly
"""

import requests
import json
import sys

def test_backend_connection(backend_url):
    """Test if backend is responding"""
    try:
        response = requests.get(f"{backend_url}/", timeout=10)
        if response.status_code == 200:
            print("✅ Backend is responding!")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_mysql_connection(backend_url):
    """Test MySQL database connection through backend"""
    try:
        response = requests.get(f"{backend_url}/api/blogs", timeout=10)
        if response.status_code == 200:
            print("✅ MySQL database connection working!")
            blogs = response.json().get("blogs", [])
            print(f"   Found {len(blogs)} blogs in database")
            return True
        else:
            print(f"❌ Database test failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def test_cors_headers(backend_url, frontend_domain):
    """Test CORS configuration"""
    try:
        headers = {
            'Origin': frontend_domain,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(f"{backend_url}/api/blogs", headers=headers, timeout=10)
        
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        if cors_header and (cors_header == '*' or frontend_domain in cors_header):
            print("✅ CORS configuration is working!")
            return True
        else:
            print(f"❌ CORS issue - Allow-Origin: {cors_header}")
            return False
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def main():
    print("🧪 Julian Portfolio - Hostinger Deployment Test\n")
    
    # Get URLs from user
    backend_url = input("Enter your Railway backend URL (e.g., https://your-app.railway.app): ").strip()
    frontend_domain = input("Enter your Hostinger domain (e.g., https://your-domain.com): ").strip()
    
    if not backend_url or not frontend_domain:
        print("❌ Please provide both URLs")
        sys.exit(1)
    
    print(f"\n🔍 Testing deployment...")
    print(f"Backend: {backend_url}")
    print(f"Frontend: {frontend_domain}\n")
    
    # Run tests
    tests_passed = 0
    total_tests = 3
    
    if test_backend_connection(backend_url):
        tests_passed += 1
    
    if test_mysql_connection(backend_url):
        tests_passed += 1
        
    if test_cors_headers(backend_url, frontend_domain):
        tests_passed += 1
    
    print(f"\n📊 Test Results: {tests_passed}/{total_tests} passed")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Your deployment is ready!")
        print("\n✅ Next steps:")
        print("1. Upload your React build to Hostinger public_html")
        print("2. Test Google authentication on your live site")
        print("3. Create your first blog post through admin panel")
    else:
        print("❌ Some tests failed. Check the errors above and:")
        print("1. Verify Railway environment variables are set correctly")
        print("2. Check MySQL credentials and database setup")
        print("3. Verify CORS settings include your domain")

if __name__ == "__main__":
    main()
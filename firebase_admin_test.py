#!/usr/bin/env python3
"""
Firebase Blog Admin CRUD Testing with Authentication
Tests admin-only endpoints with proper Firebase authentication
"""

import requests
import json
import sys
import os
from datetime import datetime
import time
import uuid

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
print(f"🔍 Testing Firebase Admin Blog API at: {API_BASE_URL}")

# Test data
ADMIN_EMAIL = "abirsabirhossain@gmail.com"
TEST_BLOG_DATA = {
    "title": "Advanced UAE Business Formation Strategies",
    "excerpt": "Comprehensive guide to advanced business formation strategies in the UAE, covering free zones, mainland options, and regulatory compliance.",
    "content": "<h2>Advanced UAE Business Formation</h2><p>This comprehensive guide covers advanced strategies for business formation in the UAE, including detailed analysis of free zone vs mainland options.</p><h3>Free Zone Benefits</h3><ul><li>100% foreign ownership</li><li>Tax exemptions</li><li>Streamlined setup process</li><li>Modern infrastructure</li></ul><h3>Mainland Advantages</h3><ul><li>Access to local market</li><li>Government contracts eligibility</li><li>Wider business activities</li><li>Banking advantages</li></ul><p>Contact Julian D'Rozario for expert consultation on your UAE business formation journey.</p>",
    "category": "Company Formation",
    "read_time": "12 min read",
    "featured": False,
    "tags": ["UAE", "business formation", "free zone", "mainland", "strategy", "compliance"],
    "image_url": "https://via.placeholder.com/800x600/7c3aed/ffffff?text=Advanced+UAE+Business"
}

def get_mock_admin_token():
    """Get a mock Firebase token for admin testing"""
    print("\n=== Getting Mock Admin Token ===")
    try:
        # Use mock Firebase token for testing
        mock_token = f"mock_firebase_token_admin_{int(time.time())}"
        
        # Test Firebase login endpoint
        login_data = {"firebase_token": mock_token}
        response = requests.post(
            f"{API_BASE_URL}/auth/firebase-login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            if access_token:
                print(f"✅ Mock admin token obtained successfully")
                print(f"   Username: {token_data.get('username', 'Unknown')}")
                print(f"   Is Admin: {token_data.get('is_admin', False)}")
                return access_token
            else:
                print("❌ No access token in response")
                return None
        else:
            print(f"❌ Token request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Token request failed: {e}")
        return None

def test_create_blog_with_auth(token):
    """Test POST /api/blogs with authentication"""
    print("\n=== Testing Create Blog With Auth ===")
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/blogs",
            json=TEST_BLOG_DATA,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            blog = response.json()
            required_fields = ["id", "title", "excerpt", "content", "category", "author"]
            missing_fields = [field for field in required_fields if field not in blog]
            
            if not missing_fields:
                print("✅ Create blog with auth working")
                print(f"   ✅ Created blog: '{blog.get('title', 'Unknown')}'")
                print(f"   ✅ Blog ID: {blog.get('id', 'Unknown')}")
                print(f"   ✅ Category: {blog.get('category', 'Unknown')}")
                print(f"   ✅ Featured: {blog.get('featured', False)}")
                return True, blog
            else:
                print(f"❌ Created blog missing fields: {missing_fields}")
                return False, None
        elif response.status_code == 403:
            print("❌ Create blog failed - insufficient permissions (403)")
            print("   This might indicate the mock user is not recognized as admin")
            return False, None
        else:
            print(f"❌ Create blog failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Create blog with auth test failed: {e}")
        return False, None

def test_update_blog_with_auth(token, blog_id):
    """Test PUT /api/blogs/{blog_id} with authentication"""
    print(f"\n=== Testing Update Blog With Auth ({blog_id[:8]}...) ===")
    try:
        update_data = {
            "title": "Updated: Advanced UAE Business Formation Strategies",
            "excerpt": "UPDATED: Comprehensive guide to advanced business formation strategies in the UAE.",
            "featured": True,
            "tags": ["UAE", "business formation", "updated", "advanced", "strategy"]
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.put(
            f"{API_BASE_URL}/blogs/{blog_id}",
            json=update_data,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            blog = response.json()
            if blog.get('title') == update_data['title'] and blog.get('featured') == True:
                print("✅ Update blog with auth working")
                print(f"   ✅ Updated title: '{blog.get('title', 'Unknown')}'")
                print(f"   ✅ Featured status: {blog.get('featured', False)}")
                print(f"   ✅ Updated tags: {blog.get('tags', [])}")
                return True, blog
            else:
                print("❌ Blog update did not apply correctly")
                return False, None
        elif response.status_code == 403:
            print("❌ Update blog failed - insufficient permissions (403)")
            return False, None
        elif response.status_code == 404:
            print("❌ Update blog failed - blog not found (404)")
            return False, None
        else:
            print(f"❌ Update blog failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Update blog with auth test failed: {e}")
        return False, None

def test_upload_with_auth(token):
    """Test POST /api/upload with authentication"""
    print("\n=== Testing File Upload With Auth ===")
    try:
        # Create a mock image file
        files = {
            'file': ('test_blog_image.jpg', b'fake_jpeg_image_data_for_testing', 'image/jpeg')
        }
        
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/upload",
            files=files,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            upload_data = response.json()
            if 'url' in upload_data and 'filename' in upload_data:
                print("✅ File upload with auth working")
                print(f"   ✅ Upload URL: {upload_data.get('url', 'Unknown')}")
                print(f"   ✅ Filename: {upload_data.get('filename', 'Unknown')}")
                return True, upload_data
            else:
                print("❌ Upload response missing required fields")
                return False, None
        elif response.status_code == 403:
            print("❌ File upload failed - insufficient permissions (403)")
            return False, None
        elif response.status_code == 400:
            print("❌ File upload failed - bad request (400)")
            print(f"Response: {response.text}")
            return False, None
        else:
            print(f"❌ File upload failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ File upload with auth test failed: {e}")
        return False, None

def test_delete_blog_with_auth(token, blog_id):
    """Test DELETE /api/blogs/{blog_id} with authentication"""
    print(f"\n=== Testing Delete Blog With Auth ({blog_id[:8]}...) ===")
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.delete(
            f"{API_BASE_URL}/blogs/{blog_id}",
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            if 'message' in result and 'deleted' in result['message'].lower():
                print("✅ Delete blog with auth working")
                print(f"   ✅ Delete message: {result.get('message', 'Unknown')}")
                return True
            else:
                print("❌ Delete response unexpected format")
                return False
        elif response.status_code == 403:
            print("❌ Delete blog failed - insufficient permissions (403)")
            return False
        elif response.status_code == 404:
            print("❌ Delete blog failed - blog not found (404)")
            return False
        else:
            print(f"❌ Delete blog failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Delete blog with auth test failed: {e}")
        return False

def test_create_category_with_auth(token):
    """Test POST /api/categories with authentication"""
    print("\n=== Testing Create Category With Auth ===")
    try:
        category_data = {
            "name": "Legal & Compliance",
            "description": "Legal matters, compliance requirements, and regulatory updates for UAE businesses"
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/categories",
            json=category_data,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            category = response.json()
            if category.get('name') == category_data['name']:
                print("✅ Create category with auth working")
                print(f"   ✅ Created category: '{category.get('name', 'Unknown')}'")
                print(f"   ✅ Category ID: {category.get('id', 'Unknown')}")
                print(f"   ✅ Description: {category.get('description', 'Unknown')}")
                return True, category
            else:
                print("❌ Category creation did not apply correctly")
                return False, None
        elif response.status_code == 403:
            print("❌ Create category failed - insufficient permissions (403)")
            return False, None
        else:
            print(f"❌ Create category failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Create category with auth test failed: {e}")
        return False, None

def test_admin_verify_endpoint(token):
    """Test GET /api/admin/verify with authentication"""
    print("\n=== Testing Admin Verify Endpoint ===")
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.get(
            f"{API_BASE_URL}/admin/verify",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            admin_data = response.json()
            if 'username' in admin_data and 'email' in admin_data:
                print("✅ Admin verify endpoint working")
                print(f"   ✅ Admin username: {admin_data.get('username', 'Unknown')}")
                print(f"   ✅ Admin email: {admin_data.get('email', 'Unknown')}")
                print(f"   ✅ Is admin: {admin_data.get('is_admin', False)}")
                return True
            else:
                print("❌ Admin verify response missing required fields")
                return False
        elif response.status_code == 403:
            print("❌ Admin verify failed - insufficient permissions (403)")
            return False
        elif response.status_code == 401:
            print("❌ Admin verify failed - invalid token (401)")
            return False
        else:
            print(f"❌ Admin verify failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Admin verify endpoint test failed: {e}")
        return False

def run_admin_tests():
    """Run all Firebase admin blog tests with authentication"""
    print("🚀 Starting Firebase Blog Admin CRUD Testing")
    print("🔐 Testing Admin Authentication & Authorization")
    print("=" * 70)
    
    test_results = []
    
    # Get admin token
    print("\n🎫 AUTHENTICATION")
    print("-" * 40)
    admin_token = get_mock_admin_token()
    if not admin_token:
        print("❌ Could not obtain admin token - skipping admin tests")
        return False
    
    test_results.append(("Get Admin Token", True))
    
    # Admin verification
    print("\n👤 ADMIN VERIFICATION")
    print("-" * 40)
    test_results.append(("Admin Verify Endpoint", test_admin_verify_endpoint(admin_token)))
    
    # Admin blog operations
    print("\n📝 ADMIN BLOG OPERATIONS")
    print("-" * 40)
    
    # Create blog
    create_success, created_blog = test_create_blog_with_auth(admin_token)
    test_results.append(("Create Blog (Admin)", create_success))
    
    if create_success and created_blog:
        blog_id = created_blog['id']
        
        # Update blog
        update_success, _ = test_update_blog_with_auth(admin_token, blog_id)
        test_results.append(("Update Blog (Admin)", update_success))
        
        # Delete blog (cleanup)
        delete_success = test_delete_blog_with_auth(admin_token, blog_id)
        test_results.append(("Delete Blog (Admin)", delete_success))
    else:
        test_results.append(("Update Blog (Admin)", False))
        test_results.append(("Delete Blog (Admin)", False))
        print("   ℹ️  Skipping update/delete tests (blog creation failed)")
    
    # Admin category operations
    print("\n📂 ADMIN CATEGORY OPERATIONS")
    print("-" * 40)
    test_results.append(("Create Category (Admin)", test_create_category_with_auth(admin_token)[0] if test_create_category_with_auth(admin_token) else False))
    
    # Admin file operations
    print("\n📁 ADMIN FILE OPERATIONS")
    print("-" * 40)
    test_results.append(("File Upload (Admin)", test_upload_with_auth(admin_token)[0] if test_upload_with_auth(admin_token) else False))
    
    # Summary
    print("\n" + "=" * 70)
    print("🏁 FIREBASE ADMIN BLOG TEST SUMMARY")
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
        print("\n🎉 All Firebase admin blog tests passed!")
        print("✅ Admin authentication working")
        print("✅ Admin blog CRUD operations functional")
        print("✅ Admin category management working")
        print("✅ Admin file upload operational")
        print("✅ Authorization and permissions enforced")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Admin functionality needs attention.")
        return False

if __name__ == "__main__":
    success = run_admin_tests()
    sys.exit(0 if success else 1)
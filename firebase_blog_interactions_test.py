#!/usr/bin/env python3
"""
Firebase Blog Interactions Testing
Tests blog comments, likes, and user interactions
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
print(f"🔍 Testing Firebase Blog Interactions at: {API_BASE_URL}")

def get_mock_user_token():
    """Get a mock Firebase token for user testing"""
    try:
        mock_token = f"mock_firebase_token_user_{int(time.time())}"
        
        login_data = {"firebase_token": mock_token}
        response = requests.post(
            f"{API_BASE_URL}/auth/firebase-login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get('access_token')
        return None
    except:
        return None

def get_sample_blog_id():
    """Get a sample blog ID for testing"""
    try:
        response = requests.get(f"{API_BASE_URL}/blogs", timeout=10)
        if response.status_code == 200:
            blogs = response.json()
            if blogs and len(blogs) > 0:
                return blogs[0]['id']
        return None
    except:
        return None

def test_blog_comment_creation(token, blog_id):
    """Test creating a blog comment"""
    print(f"\n=== Testing Blog Comment Creation ({blog_id[:8]}...) ===")
    try:
        comment_data = {
            "blog_id": blog_id,
            "comment_text": "This is an excellent guide to UAE business formation! Julian's expertise really shows through in the detailed analysis of free zone vs mainland options. Very helpful for entrepreneurs looking to establish their business in Dubai."
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/blog/comment",
            json=comment_data,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 200:
            comment = response.json()
            required_fields = ["id", "blog_id", "user_name", "comment_text", "timestamp"]
            missing_fields = [field for field in required_fields if field not in comment]
            
            if not missing_fields:
                print("✅ Blog comment creation working")
                print(f"   ✅ Comment ID: {comment.get('id', 'Unknown')}")
                print(f"   ✅ User: {comment.get('user_name', 'Unknown')}")
                print(f"   ✅ Comment: {comment.get('comment_text', 'Unknown')[:50]}...")
                return True, comment
            else:
                print(f"❌ Comment missing fields: {missing_fields}")
                return False, None
        else:
            print(f"❌ Comment creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Comment creation test failed: {e}")
        return False, None

def test_get_blog_comments(blog_id):
    """Test retrieving blog comments"""
    print(f"\n=== Testing Get Blog Comments ({blog_id[:8]}...) ===")
    try:
        response = requests.get(f"{API_BASE_URL}/blog/{blog_id}/comments", timeout=10)
        
        if response.status_code == 200:
            comments = response.json()
            if isinstance(comments, list):
                print(f"✅ Get blog comments working - Retrieved {len(comments)} comments")
                
                if comments:
                    first_comment = comments[0]
                    required_fields = ["id", "blog_id", "user_name", "comment_text"]
                    missing_fields = [field for field in required_fields if field not in first_comment]
                    
                    if not missing_fields:
                        print("   ✅ Comment structure is correct")
                        print(f"   ✅ Sample comment by: {first_comment.get('user_name', 'Unknown')}")
                        return True
                    else:
                        print(f"   ❌ Comment missing fields: {missing_fields}")
                        return False
                else:
                    print("   ℹ️  No comments found for this blog")
                    return True
            else:
                print(f"❌ Expected list, got {type(comments)}")
                return False
        else:
            print(f"❌ Get comments failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Get comments test failed: {e}")
        return False

def test_blog_like_toggle(token, blog_id):
    """Test toggling blog like"""
    print(f"\n=== Testing Blog Like Toggle ({blog_id[:8]}...) ===")
    try:
        like_data = {"blog_id": blog_id}
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # First like
        response1 = requests.post(
            f"{API_BASE_URL}/blog/like",
            json=like_data,
            headers=headers,
            timeout=15
        )
        
        if response1.status_code == 200:
            result1 = response1.json()
            if result1.get('liked') == True:
                print("✅ Blog like working")
                print(f"   ✅ Like result: {result1.get('message', 'Unknown')}")
                
                # Test unlike (toggle)
                response2 = requests.post(
                    f"{API_BASE_URL}/blog/like",
                    json=like_data,
                    headers=headers,
                    timeout=15
                )
                
                if response2.status_code == 200:
                    result2 = response2.json()
                    if result2.get('liked') == False:
                        print("✅ Blog unlike working")
                        print(f"   ✅ Unlike result: {result2.get('message', 'Unknown')}")
                        return True
                    else:
                        print("❌ Blog unlike did not work correctly")
                        return False
                else:
                    print(f"❌ Blog unlike failed with status {response2.status_code}")
                    return False
            else:
                print("❌ Blog like did not work correctly")
                return False
        else:
            print(f"❌ Blog like failed with status {response1.status_code}")
            print(f"Response: {response1.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Blog like toggle test failed: {e}")
        return False

def test_get_blog_likes(blog_id):
    """Test retrieving blog likes"""
    print(f"\n=== Testing Get Blog Likes ({blog_id[:8]}...) ===")
    try:
        response = requests.get(f"{API_BASE_URL}/blog/{blog_id}/likes", timeout=10)
        
        if response.status_code == 200:
            likes_data = response.json()
            if 'blog_id' in likes_data and 'likes_count' in likes_data:
                print("✅ Get blog likes working")
                print(f"   ✅ Blog ID: {likes_data.get('blog_id', 'Unknown')}")
                print(f"   ✅ Likes count: {likes_data.get('likes_count', 0)}")
                print(f"   ✅ Likes data: {len(likes_data.get('likes', []))} entries")
                return True
            else:
                print("❌ Likes response missing required fields")
                return False
        else:
            print(f"❌ Get likes failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Get likes test failed: {e}")
        return False

def test_user_auth_verify(token):
    """Test user authentication verification"""
    print("\n=== Testing User Auth Verify ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{API_BASE_URL}/auth/verify", headers=headers, timeout=10)
        
        if response.status_code == 200:
            user_data = response.json()
            if 'username' in user_data and 'email' in user_data:
                print("✅ User auth verify working")
                print(f"   ✅ Username: {user_data.get('username', 'Unknown')}")
                print(f"   ✅ Email: {user_data.get('email', 'Unknown')}")
                print(f"   ✅ Is admin: {user_data.get('is_admin', False)}")
                return True
            else:
                print("❌ User verify response missing required fields")
                return False
        else:
            print(f"❌ User auth verify failed with status {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ User auth verify test failed: {e}")
        return False

def run_interaction_tests():
    """Run all Firebase blog interaction tests"""
    print("🚀 Starting Firebase Blog Interactions Testing")
    print("💬 Testing Comments, Likes, and User Interactions")
    print("=" * 70)
    
    test_results = []
    
    # Get user token and blog ID
    print("\n🎫 SETUP")
    print("-" * 40)
    user_token = get_mock_user_token()
    blog_id = get_sample_blog_id()
    
    if not user_token:
        print("❌ Could not obtain user token - skipping interaction tests")
        return False
    
    if not blog_id:
        print("❌ Could not find sample blog - skipping interaction tests")
        return False
    
    print(f"✅ User token obtained")
    print(f"✅ Sample blog ID: {blog_id[:8]}...")
    
    # User authentication
    print("\n👤 USER AUTHENTICATION")
    print("-" * 40)
    test_results.append(("User Auth Verify", test_user_auth_verify(user_token)))
    
    # Blog interactions
    print("\n💬 BLOG INTERACTIONS")
    print("-" * 40)
    
    # Comments
    comment_success, _ = test_blog_comment_creation(user_token, blog_id)
    test_results.append(("Create Blog Comment", comment_success))
    test_results.append(("Get Blog Comments", test_get_blog_comments(blog_id)))
    
    # Likes
    test_results.append(("Blog Like Toggle", test_blog_like_toggle(user_token, blog_id)))
    test_results.append(("Get Blog Likes", test_get_blog_likes(blog_id)))
    
    # Summary
    print("\n" + "=" * 70)
    print("🏁 FIREBASE BLOG INTERACTIONS TEST SUMMARY")
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
        print("\n🎉 All Firebase blog interaction tests passed!")
        print("✅ User authentication working")
        print("✅ Blog comments system functional")
        print("✅ Blog likes system operational")
        print("✅ User interactions properly tracked")
        return True
    else:
        print(f"\n⚠️  {failed} test(s) failed. Blog interactions need attention.")
        return False

if __name__ == "__main__":
    success = run_interaction_tests()
    sys.exit(0 if success else 1)
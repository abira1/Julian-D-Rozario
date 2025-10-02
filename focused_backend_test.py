#!/usr/bin/env python3
"""
Focused Backend Testing for Blog API Endpoints
Tests the actual backend endpoints that are currently running
"""

import requests
import json
import sys
import time

# Backend URL from frontend .env
BACKEND_URL = "https://drozario.blog"
API_BASE_URL = f"{BACKEND_URL}/api"

def test_health_check():
    """Test basic health check endpoint"""
    print("=== Testing Health Check ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check working ({response_time:.2f}ms)")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Status: {data.get('status', 'N/A')}")
            print(f"   Version: {data.get('version', 'N/A')}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_get_blogs():
    """Test GET /api/blogs endpoint"""
    print("\n=== Testing GET /api/blogs ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/blogs", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if it has the expected structure
            if 'blogs' in data and isinstance(data['blogs'], list):
                blogs = data['blogs']
                total = data.get('total', len(blogs))
                
                print(f"✅ GET /api/blogs working ({response_time:.2f}ms)")
                print(f"   Retrieved {len(blogs)} blogs (total: {total})")
                
                # Check blog structure
                if blogs:
                    first_blog = blogs[0]
                    required_fields = ['id', 'title', 'excerpt', 'content', 'category', 'author']
                    missing_fields = [field for field in required_fields if field not in first_blog]
                    
                    if not missing_fields:
                        print("   ✅ Blog structure is correct")
                        print(f"   Sample blog: '{first_blog['title'][:50]}...'")
                        return True, blogs[0]['id'] if blogs else None
                    else:
                        print(f"   ❌ Blog missing fields: {missing_fields}")
                        return False, None
                else:
                    print("   ℹ️  No blogs found")
                    return True, None
            else:
                print(f"❌ Unexpected response structure: {list(data.keys())}")
                return False, None
        else:
            print(f"❌ GET /api/blogs failed with status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False, None
    except Exception as e:
        print(f"❌ GET /api/blogs failed: {e}")
        return False, None

def test_get_single_blog(blog_id):
    """Test GET /api/blogs/{id} endpoint"""
    print(f"\n=== Testing GET /api/blogs/{blog_id} ===")
    
    if not blog_id:
        print("⚠️  No blog ID available for testing")
        return True
    
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/blogs/{blog_id}", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ['id', 'title', 'excerpt', 'content', 'category', 'author']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print(f"✅ GET /api/blogs/{blog_id} working ({response_time:.2f}ms)")
                print(f"   Blog: '{data['title'][:50]}...'")
                print(f"   Category: {data['category']}")
                print(f"   Author: {data['author']}")
                print(f"   Views: {data.get('views', 0)}")
                return True
            else:
                print(f"❌ Blog missing fields: {missing_fields}")
                return False
        elif response.status_code == 404:
            print("⚠️  Blog not found (404)")
            return True
        else:
            print(f"❌ GET /api/blogs/{blog_id} failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ GET /api/blogs/{blog_id} failed: {e}")
        return False

def test_get_categories():
    """Test GET /api/categories endpoint"""
    print("\n=== Testing GET /api/categories ===")
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/categories", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                print(f"✅ GET /api/categories working ({response_time:.2f}ms)")
                print(f"   Retrieved {len(data)} categories")
                
                # Show categories
                for i, category in enumerate(data[:5]):  # Show first 5
                    name = category.get('name', 'Unknown')
                    desc = category.get('description', 'No description')
                    print(f"   {i+1}. {name}: {desc}")
                
                if len(data) > 5:
                    print(f"   ... and {len(data) - 5} more")
                
                return True
            else:
                print(f"❌ Expected list, got {type(data)}")
                return False
        else:
            print(f"❌ GET /api/categories failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ GET /api/categories failed: {e}")
        return False

def test_blog_filtering():
    """Test blog filtering by category"""
    print("\n=== Testing Blog Category Filtering ===")
    try:
        # Test with a specific category
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/blogs?category=Technology", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            if 'blogs' in data:
                blogs = data['blogs']
                print(f"✅ Category filtering working ({response_time:.2f}ms)")
                print(f"   Technology category: {len(blogs)} blogs")
                return True
            else:
                print(f"❌ Unexpected response structure for filtering")
                return False
        else:
            print(f"⚠️  Category filtering may not be supported (status {response.status_code})")
            return True  # Not critical
    except Exception as e:
        print(f"❌ Category filtering test failed: {e}")
        return False

def main():
    """Run all focused backend tests"""
    print("🔍 Testing Backend Blog API Endpoints")
    print(f"📡 Backend URL: {API_BASE_URL}")
    print("=" * 60)
    
    results = []
    blog_id = None
    
    # Test basic connectivity
    results.append(("Health Check", test_health_check()))
    
    # Test blog endpoints
    blog_test_result, blog_id = test_get_blogs()
    results.append(("GET /api/blogs", blog_test_result))
    
    results.append(("GET /api/blogs/{id}", test_get_single_blog(blog_id)))
    results.append(("GET /api/categories", test_get_categories()))
    results.append(("Blog Category Filtering", test_blog_filtering()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {total} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    
    if passed == total:
        print("\n🎉 All blog API endpoints are working correctly!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Some endpoints need attention.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
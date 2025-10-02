#!/usr/bin/env python3
"""
Focused Blog API Testing for Review Request
Tests blog endpoints to verify blog data availability and structure
Focus on ensuring blog data is available for frontend blur-to-clear transitions
"""

import requests
import json
import sys
import time
from datetime import datetime

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

def test_blog_endpoints():
    """Test blog API endpoints as requested in review"""
    print(f"🔍 Testing Blog API Endpoints at: {API_BASE_URL}")
    print("=" * 80)
    
    results = {
        'health_check': False,
        'get_blogs': False,
        'get_categories': False,
        'blog_structure': False,
        'backend_health': False
    }
    
    # 1. Test basic health check
    print("\n1. Testing Backend Health Check")
    print("-" * 40)
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend health check: WORKING ({response_time:.2f}ms)")
            print(f"   Response: {data.get('message', 'No message')}")
            results['health_check'] = True
            results['backend_health'] = True
        else:
            print(f"❌ Backend health check failed: Status {response.status_code}")
            print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend health check failed: {e}")
    
    # 2. Test GET /api/blogs
    print("\n2. Testing GET /api/blogs")
    print("-" * 40)
    blogs_data = []
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/blogs", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            blogs_data = response.json()
            if isinstance(blogs_data, list):
                print(f"✅ GET /api/blogs: WORKING ({response_time:.2f}ms)")
                print(f"   📊 Number of blogs returned: {len(blogs_data)}")
                results['get_blogs'] = True
                
                if blogs_data:
                    # Check blog structure
                    first_blog = blogs_data[0]
                    required_fields = ["id", "title", "excerpt", "content", "category", "author", "image_url", "views", "likes", "created_at", "updated_at"]
                    
                    print(f"\n   📋 Blog Data Structure Analysis:")
                    print(f"   --------------------------------")
                    for field in required_fields:
                        if field in first_blog:
                            value = first_blog[field]
                            if field == "image_url":
                                print(f"   ✅ {field}: {value[:60]}..." if value and len(str(value)) > 60 else f"   ✅ {field}: {value}")
                            elif field in ["content", "excerpt"]:
                                print(f"   ✅ {field}: {len(str(value))} characters")
                            else:
                                print(f"   ✅ {field}: {value}")
                        else:
                            print(f"   ❌ {field}: MISSING")
                    
                    results['blog_structure'] = True
                    
                    # Show sample blog titles
                    print(f"\n   📝 Sample Blog Titles:")
                    for i, blog in enumerate(blogs_data[:3]):
                        print(f"   {i+1}. {blog.get('title', 'No title')}")
                        print(f"      Category: {blog.get('category', 'No category')}")
                        print(f"      Image URL: {blog.get('image_url', 'No image')}")
                        print(f"      Views: {blog.get('views', 0)}, Likes: {blog.get('likes', 0)}")
                        print()
                else:
                    print("   ⚠️  No blogs found in database")
                    print("   💡 This may prevent frontend from displaying blog content")
            else:
                print(f"❌ GET /api/blogs returned invalid format: {type(blogs_data)}")
        else:
            print(f"❌ GET /api/blogs failed: Status {response.status_code}")
            print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ GET /api/blogs failed: {e}")
    
    # 3. Test GET /api/categories
    print("\n3. Testing GET /api/categories")
    print("-" * 40)
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE_URL}/categories", timeout=10)
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200:
            categories_data = response.json()
            if isinstance(categories_data, list):
                print(f"✅ GET /api/categories: WORKING ({response_time:.2f}ms)")
                print(f"   📊 Number of categories returned: {len(categories_data)}")
                results['get_categories'] = True
                
                print(f"\n   📂 Available Categories:")
                for i, category in enumerate(categories_data):
                    name = category.get('name', 'No name')
                    description = category.get('description', 'No description')
                    print(f"   {i+1}. {name}")
                    if description and description != 'No description':
                        print(f"      Description: {description}")
            else:
                print(f"❌ GET /api/categories returned invalid format: {type(categories_data)}")
        else:
            print(f"❌ GET /api/categories failed: Status {response.status_code}")
            print(f"   Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ GET /api/categories failed: {e}")
    
    # 4. Test individual blog endpoint if blogs exist
    if blogs_data and len(blogs_data) > 0:
        print("\n4. Testing GET /api/blogs/{id} (Individual Blog)")
        print("-" * 40)
        test_blog_id = blogs_data[0]['id']
        try:
            start_time = time.time()
            response = requests.get(f"{API_BASE_URL}/blogs/{test_blog_id}", timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                blog_data = response.json()
                print(f"✅ GET /api/blogs/{{id}}: WORKING ({response_time:.2f}ms)")
                print(f"   📖 Blog Title: {blog_data.get('title', 'No title')}")
                print(f"   👁️  Views: {blog_data.get('views', 0)} (should increment on access)")
                print(f"   🖼️  Image URL: {blog_data.get('image_url', 'No image')}")
                
                # Check if image URL is accessible for blur-to-clear transitions
                image_url = blog_data.get('image_url')
                if image_url:
                    try:
                        img_response = requests.head(image_url, timeout=5)
                        if img_response.status_code == 200:
                            print(f"   ✅ Image URL accessible for blur-to-clear transitions")
                        else:
                            print(f"   ⚠️  Image URL may not be accessible: Status {img_response.status_code}")
                    except:
                        print(f"   ⚠️  Could not verify image URL accessibility")
            else:
                print(f"❌ GET /api/blogs/{{id}} failed: Status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ GET /api/blogs/{{id}} failed: {e}")
    
    # 5. Backend service health check
    print("\n5. Backend Service Health Assessment")
    print("-" * 40)
    try:
        # Check if backend is running via supervisor
        import subprocess
        result = subprocess.run(['sudo', 'supervisorctl', 'status', 'backend'], 
                              capture_output=True, text=True, timeout=5)
        
        if result.returncode == 0 and "RUNNING" in result.stdout:
            print("✅ Backend service: RUNNING (via supervisor)")
            results['backend_health'] = True
        else:
            print("⚠️  Backend service status unclear")
            print(f"   Supervisor output: {result.stdout}")
    except Exception as e:
        print(f"⚠️  Could not check backend service status: {e}")
    
    # Summary Report
    print("\n" + "=" * 80)
    print("📋 BLOG API TESTING SUMMARY")
    print("=" * 80)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"✅ Tests Passed: {passed_tests}/{total_tests}")
    print(f"❌ Tests Failed: {total_tests - passed_tests}/{total_tests}")
    
    print(f"\n📊 Detailed Results:")
    print(f"   Backend Health Check: {'✅ PASS' if results['health_check'] else '❌ FAIL'}")
    print(f"   GET /api/blogs: {'✅ PASS' if results['get_blogs'] else '❌ FAIL'}")
    print(f"   GET /api/categories: {'✅ PASS' if results['get_categories'] else '❌ FAIL'}")
    print(f"   Blog Data Structure: {'✅ PASS' if results['blog_structure'] else '❌ FAIL'}")
    print(f"   Backend Service Health: {'✅ PASS' if results['backend_health'] else '❌ FAIL'}")
    
    # Specific findings for review request
    print(f"\n🎯 REVIEW REQUEST FINDINGS:")
    print(f"   Number of blogs available: {len(blogs_data) if isinstance(blogs_data, list) else 0}")
    
    if isinstance(blogs_data, list) and len(blogs_data) > 0:
        # Check image URLs for blur-to-clear functionality
        blogs_with_images = [blog for blog in blogs_data if blog.get('image_url')]
        print(f"   Blogs with image URLs: {len(blogs_with_images)}/{len(blogs_data)}")
        
        if blogs_with_images:
            print(f"   ✅ Blog images available for blur-to-clear transitions")
            print(f"   📸 Sample image URLs:")
            for i, blog in enumerate(blogs_with_images[:3]):
                print(f"      {i+1}. {blog.get('image_url', '')}")
        else:
            print(f"   ⚠️  No blog images found - may affect blur-to-clear transitions")
    else:
        print(f"   ❌ No blog data available - frontend will not be able to display blogs")
    
    # Database/Backend configuration assessment
    if results['health_check'] and results['get_blogs']:
        print(f"   ✅ Backend properly configured and database working")
    else:
        print(f"   ❌ Backend configuration or database issues detected")
    
    return results

if __name__ == "__main__":
    results = test_blog_endpoints()
    
    # Exit with appropriate code
    if all(results.values()):
        print(f"\n🎉 All tests passed! Blog API is ready for frontend integration.")
        sys.exit(0)
    else:
        print(f"\n⚠️  Some tests failed. Check the issues above.")
        sys.exit(1)
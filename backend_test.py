#!/usr/bin/env python3
"""
Backend API Testing Suite for Julian D'Rozario Portfolio
Tests FastAPI server endpoints and functionality
"""

import requests
import json
import os
from datetime import datetime
import sys

# Get backend URL from frontend .env
BACKEND_URL = "https://code-catalog-5.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {message}")
        
    def test_server_health(self):
        """Test if server is running and healthy"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Server Health Check", True, 
                            f"Server is healthy. Database: {data.get('database', 'Unknown')}", data)
                return True
            else:
                self.log_test("Server Health Check", False, 
                            f"Health check failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Server Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = self.session.get(f"{self.base_url.replace('/api', '')}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Root Endpoint", True, 
                            f"Root endpoint accessible. Version: {data.get('version', 'Unknown')}", data)
                return True
            else:
                self.log_test("Root Endpoint", False, 
                            f"Root endpoint failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_blogs_api(self):
        """Test blogs API endpoints"""
        try:
            # Test GET /api/blogs
            response = self.session.get(f"{self.base_url}/blogs", timeout=10)
            if response.status_code == 200:
                data = response.json()
                blogs = data.get('blogs', [])
                self.log_test("Get Blogs API", True, 
                            f"Retrieved {len(blogs)} blogs successfully", 
                            {"blog_count": len(blogs), "sample_blog": blogs[0] if blogs else None})
                
                # Test individual blog if blogs exist
                if blogs:
                    blog_id = blogs[0].get('id')
                    if blog_id:
                        blog_response = self.session.get(f"{self.base_url}/blogs/{blog_id}", timeout=10)
                        if blog_response.status_code == 200:
                            blog_data = blog_response.json()
                            self.log_test("Get Single Blog API", True, 
                                        f"Retrieved blog ID {blog_id}: {blog_data.get('title', 'No title')}")
                        else:
                            self.log_test("Get Single Blog API", False, 
                                        f"Failed to get blog {blog_id}, status: {blog_response.status_code}")
                
                return True
            else:
                self.log_test("Get Blogs API", False, 
                            f"Blogs API failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Get Blogs API", False, f"Connection error: {str(e)}")
            return False
    
    def test_categories_api(self):
        """Test categories API"""
        try:
            response = self.session.get(f"{self.base_url}/categories", timeout=10)
            if response.status_code == 200:
                categories = response.json()
                self.log_test("Categories API", True, 
                            f"Retrieved {len(categories)} categories: {', '.join(categories[:3])}", 
                            {"categories": categories})
                return True
            else:
                self.log_test("Categories API", False, 
                            f"Categories API failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Categories API", False, f"Connection error: {str(e)}")
            return False
    
    def test_contact_info_api(self):
        """Test contact info API"""
        try:
            response = self.session.get(f"{self.base_url}/contact-info", timeout=10)
            if response.status_code == 200:
                contacts = response.json()
                self.log_test("Contact Info API", True, 
                            f"Retrieved {len(contacts)} contact entries", 
                            {"contact_count": len(contacts)})
                return True
            else:
                self.log_test("Contact Info API", False, 
                            f"Contact info API failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Contact Info API", False, f"Connection error: {str(e)}")
            return False
    
    def test_seo_endpoints(self):
        """Test SEO endpoints"""
        try:
            # Test sitemap
            sitemap_response = self.session.get(f"{self.base_url.replace('/api', '')}/sitemap.xml", timeout=10)
            if sitemap_response.status_code == 200:
                self.log_test("Sitemap XML", True, "Sitemap generated successfully")
            else:
                self.log_test("Sitemap XML", False, f"Sitemap failed with status {sitemap_response.status_code}")
            
            # Test robots.txt
            robots_response = self.session.get(f"{self.base_url.replace('/api', '')}/robots.txt", timeout=10)
            if robots_response.status_code == 200:
                self.log_test("Robots.txt", True, "Robots.txt accessible")
            else:
                self.log_test("Robots.txt", False, f"Robots.txt failed with status {robots_response.status_code}")
                
        except requests.exceptions.RequestException as e:
            self.log_test("SEO Endpoints", False, f"Connection error: {str(e)}")
    
    def test_database_connectivity(self):
        """Test database connectivity by checking if data is returned"""
        try:
            # Test by getting blogs (requires DB connection)
            response = self.session.get(f"{self.base_url}/blogs?limit=1", timeout=10)
            if response.status_code == 200:
                data = response.json()
                blogs = data.get('blogs', [])
                if blogs:
                    self.log_test("Database Connectivity", True, 
                                "Database connection working - sample data retrieved")
                else:
                    self.log_test("Database Connectivity", True, 
                                "Database connection working - no data found (empty DB)")
                return True
            else:
                self.log_test("Database Connectivity", False, 
                            f"Database test failed with status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_test("Database Connectivity", False, f"Database connection error: {str(e)}")
            return False
    
    def test_authentication_endpoints(self):
        """Test authentication endpoints (without actual login)"""
        try:
            # Test Firebase login endpoint (should fail without proper data, but endpoint should exist)
            test_payload = {
                "firebase_token": "test_token",
                "user_data": {"uid": "test", "email": "test@example.com"}
            }
            
            response = self.session.post(f"{self.base_url}/auth/firebase-user-login", 
                                       json=test_payload, timeout=10)
            
            # We expect this to fail (400/401/500) but not 404 (endpoint not found)
            if response.status_code != 404:
                self.log_test("Authentication Endpoints", True, 
                            f"Auth endpoints accessible (status: {response.status_code})")
            else:
                self.log_test("Authentication Endpoints", False, 
                            "Auth endpoints not found (404)")
                
        except requests.exceptions.RequestException as e:
            self.log_test("Authentication Endpoints", False, f"Auth endpoint error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests...")
        print(f"📍 Testing backend at: {self.base_url}")
        print("=" * 60)
        
        # Core functionality tests
        self.test_server_health()
        self.test_root_endpoint()
        self.test_database_connectivity()
        
        # API endpoint tests
        self.test_blogs_api()
        self.test_categories_api()
        self.test_contact_info_api()
        self.test_seo_endpoints()
        self.test_authentication_endpoints()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        print(f"\n🎯 Overall Status: {'HEALTHY' if passed >= total * 0.8 else 'ISSUES DETECTED'}")
        
        return passed, total

def main():
    """Main test execution"""
    tester = BackendTester()
    passed, total = tester.run_all_tests()
    
    # Exit with appropriate code
    if passed >= total * 0.8:  # 80% pass rate
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
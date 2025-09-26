#!/usr/bin/env python3
"""
Simple backend test
"""

import requests
import json
import time

def test_backend():
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print("✅ Backend test successful!")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing backend...")
    test_backend()
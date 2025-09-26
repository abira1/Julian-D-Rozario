#!/usr/bin/env python3
"""
Hostinger-optimized backend with Google Auth + MySQL
This is your production-ready backend for Railway/Hostinger deployment
"""

import os
import json
import jwt
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path

import mysql.connector
from mysql.connector import Error
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configuration for production
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DATABASE'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'autocommit': True
}

# Security
security = HTTPBearer()
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'your-super-secret-jwt-key-2024')
JWT_ALGORITHM = "HS256"

# FastAPI app
app = FastAPI(title="Julian Portfolio API - Hostinger Production")

# CORS - Update with your Hostinger domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-hostinger-domain.com",  # Replace with your domain
        "https://www.your-hostinger-domain.com",
        "http://localhost:3000"  # For development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authorized admin emails
AUTHORIZED_ADMIN_EMAILS = [
    "juliandrozario@gmail.com",
    "abirsabirhossain@gmail.com"
]

# Database connection
def get_db_connection():
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        return connection
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

# Models
class GoogleAuthRequest(BaseModel):
    firebase_token: str

class BlogCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    read_time: str = "5 min read"
    image_url: Optional[str] = None
    featured: bool = False
    tags: Optional[list] = []

# Google token verification
async def verify_google_token(token: str) -> dict:
    """Verify Google/Firebase token using Google API"""
    try:
        # Verify token with Google API
        google_api_url = f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}"
        
        response = requests.get(google_api_url, timeout=10)
        
        if response.status_code != 200:
            # Try Firebase ID token verification
            firebase_url = f"https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=AIzaSyCfY6LTtYomc_mTs8yu25g7dryXFsPpaAE"
            firebase_response = requests.post(
                firebase_url,
                json={"idToken": token},
                timeout=10
            )
            
            if firebase_response.status_code == 200:
                firebase_data = firebase_response.json()
                user_info = firebase_data.get("users", [{}])[0]
                
                return {
                    "email": user_info.get("email"),
                    "name": user_info.get("displayName", ""),
                    "uid": user_info.get("localId")
                }
            else:
                raise HTTPException(status_code=401, detail="Invalid Firebase token")
        
        token_data = response.json()
        return {
            "email": token_data.get("email"),
            "name": token_data.get("name", ""),
            "uid": token_data.get("user_id")
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")

# Authentication endpoints
@app.post("/api/auth/google-login")
async def google_login(request: GoogleAuthRequest):
    """Google/Firebase authentication"""
    try:
        # Verify Google token
        user_data = await verify_google_token(request.firebase_token)
        
        # Check if user is admin
        if user_data["email"] not in AUTHORIZED_ADMIN_EMAILS:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Store/update user in database
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO admin_users (username, email, firebase_uid, last_login) 
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
            last_login = VALUES(last_login), firebase_uid = VALUES(firebase_uid)
        """, (
            user_data["email"].split("@")[0],
            user_data["email"], 
            user_data["uid"],
            datetime.now()
        ))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        # Create JWT token
        payload = {
            "email": user_data["email"],
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        access_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Blog endpoints
@app.get("/api/blogs")
async def get_blogs():
    """Get all blogs"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    
    cursor.execute("""
        SELECT id, title, excerpt, content, date, read_time, category, 
               author, image_url, featured, tags, views, likes, created_at
        FROM blogs 
        ORDER BY created_at DESC
    """)
    
    blogs = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return {"blogs": blogs}

@app.post("/api/admin/blogs")
async def create_blog(blog: BlogCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Create new blog (admin only)"""
    try:
        # Verify JWT token
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload["email"] not in AUTHORIZED_ADMIN_EMAILS:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO blogs (title, excerpt, content, date, read_time, category, 
                             image_url, featured, tags)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            blog.title, blog.excerpt, blog.content, datetime.now().date(),
            blog.read_time, blog.category, blog.image_url, blog.featured,
            json.dumps(blog.tags)
        ))
        
        blog_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        connection.close()
        
        return {"message": "Blog created successfully", "blog_id": blog_id}
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    return {"message": "Julian Portfolio API - Running on Hostinger!", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
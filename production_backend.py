#!/usr/bin/env python3
"""
Production-Ready Backend for Railway + Hostinger MySQL
Includes proper error handling and environment configuration
"""

import os
import json
import jwt
from datetime import datetime, timedelta
from typing import Optional, List
from pathlib import Path

import mysql.connector
from mysql.connector import Error
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import requests
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env.hostinger')
load_dotenv()  # Fallback to .env

# Configuration for production
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'julian_portfolio'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'autocommit': True,
    'connect_timeout': 10,
    'buffered': True
}

# Security
security = HTTPBearer()
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'julian-portfolio-super-secret-jwt-key-2024')
JWT_ALGORITHM = "HS256"

# FastAPI app
app = FastAPI(
    title="Julian Portfolio API - Production",
    description="Production backend for Julian D'Rozario's portfolio",
    version="1.0.0"
)

# CORS - Update with your actual domains
ALLOWED_ORIGINS = [
    "https://*.hostinger.com",
    "https://*.000webhost.com", 
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Get frontend URL from environment
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
if FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authorized admin emails
AUTHORIZED_ADMIN_EMAILS = [
    "juliandrozario@gmail.com",
    "abirsabirhossain@gmail.com"
]

# Database connection with retry logic
def get_db_connection():
    """Get database connection with retry logic"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            connection = mysql.connector.connect(**MYSQL_CONFIG)
            logger.info("Database connection successful")
            return connection
        except Error as e:
            logger.error(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Database connection failed after {max_retries} attempts"
                )

# Models
class GoogleAuthRequest(BaseModel):
    firebase_token: str

class BlogCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    excerpt: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    read_time: str = Field(default="5 min read", max_length=20)
    image_url: Optional[str] = None
    featured: bool = False
    tags: Optional[List[str]] = []

class BlogResponse(BaseModel):
    id: int
    title: str
    excerpt: str
    content: str
    date: str
    read_time: str
    category: str
    author: str
    image_url: Optional[str]
    featured: bool
    tags: List[str]
    views: int
    likes: int
    created_at: str

# Google token verification with fallback
async def verify_google_token(token: str) -> dict:
    """Verify Google/Firebase token with multiple methods"""
    try:
        # Method 1: Try Firebase ID token verification
        firebase_url = f"https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=AIzaSyCfY6LTtYomc_mTs8yu25g7dryXFsPpaAE"
        
        response = requests.post(
            firebase_url,
            json={"idToken": token},
            timeout=10
        )
        
        if response.status_code == 200:
            firebase_data = response.json()
            user_info = firebase_data.get("users", [{}])[0]
            
            email = user_info.get("email")
            if not email:
                raise HTTPException(status_code=401, detail="No email in token")
            
            return {
                "email": email,
                "name": user_info.get("displayName", email.split("@")[0]),
                "uid": user_info.get("localId", "unknown")
            }
        
        # Method 2: Try Google OAuth2 API
        google_api_url = f"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}"
        response = requests.get(google_api_url, timeout=10)
        
        if response.status_code == 200:
            token_data = response.json()
            return {
                "email": token_data.get("email"),
                "name": token_data.get("name", token_data.get("email", "").split("@")[0]),
                "uid": token_data.get("user_id", "unknown")
            }
        
        raise HTTPException(status_code=401, detail="Invalid token")
        
    except requests.RequestException as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")

# Health check
@app.get("/")
async def root():
    """Health check endpoint"""
    try:
        # Test database connection
        connection = get_db_connection()
        connection.close()
        db_status = "connected"
    except:
        db_status = "disconnected"
    
    return {
        "message": "Julian Portfolio API - Running on Railway!",
        "status": "active",
        "database": db_status,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "development")
    }

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
        try:
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
            
        except Error as e:
            logger.error(f"Database error during login: {e}")
            # Continue with login even if database update fails
        
        # Create JWT token
        payload = {
            "email": user_data["email"],
            "name": user_data["name"],
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        access_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_data,
            "expires_in": 86400  # 24 hours
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")

# Blog endpoints
@app.get("/api/blogs", response_model=dict)
async def get_blogs():
    """Get all blogs"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, title, excerpt, content, date, read_time, category, 
                   author, image_url, featured, tags, views, likes, created_at
            FROM blogs 
            ORDER BY created_at DESC
        """)
        
        blogs = cursor.fetchall()
        
        # Parse JSON tags and format dates
        for blog in blogs:
            if blog['tags']:
                try:
                    blog['tags'] = json.loads(blog['tags']) if isinstance(blog['tags'], str) else blog['tags']
                except:
                    blog['tags'] = []
            else:
                blog['tags'] = []
            
            # Format dates
            if blog['date']:
                blog['date'] = blog['date'].strftime('%Y-%m-%d')
            if blog['created_at']:
                blog['created_at'] = blog['created_at'].isoformat()
        
        cursor.close()
        connection.close()
        
        return {"blogs": blogs, "total": len(blogs)}
        
    except Error as e:
        logger.error(f"Database error in get_blogs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blogs")

@app.post("/api/admin/blogs")
async def create_blog(
    blog: BlogCreate, 
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
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
            blog.title, 
            blog.excerpt, 
            blog.content, 
            datetime.now().date(),
            blog.read_time, 
            blog.category, 
            blog.image_url, 
            blog.featured,
            json.dumps(blog.tags) if blog.tags else json.dumps([])
        ))
        
        blog_id = cursor.lastrowid
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"Blog created successfully with ID: {blog_id}")
        return {
            "message": "Blog created successfully", 
            "blog_id": blog_id,
            "title": blog.title
        }
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Error as e:
        logger.error(f"Database error in create_blog: {e}")
        raise HTTPException(status_code=500, detail="Failed to create blog")

# Error handlers
@app.exception_handler(500)
async def internal_server_error(request, exc):
    return {"error": "Internal server error", "detail": str(exc)}

@app.exception_handler(404)
async def not_found(request, exc):
    return {"error": "Not found", "path": str(request.url)}

if __name__ == "__main__":
    import uvicorn
    # Railway provides PORT environment variable
    port = int(os.getenv("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"🚀 Starting Julian Portfolio API on {host}:{port}")
    print(f"🌍 Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'development')}")
    
    uvicorn.run(
        app, 
        host=host, 
        port=port,
        log_level="info",
        access_log=True
    )
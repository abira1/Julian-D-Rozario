#!/usr/bin/env python3
"""
Julian Portfolio - MySQL Backend Server
Complete admin panel backend with MySQL database integration
"""

import os
import json
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path

import mysql.connector
from mysql.connector import Error
import jwt
from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv('.env.mysql')

# Configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'u691568332_julian_admin'),
    'password': os.getenv('MYSQL_PASSWORD', 'JulianDB2024!@#'),
    'database': os.getenv('MYSQL_DATABASE', 'u691568332_julian_portfol'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'autocommit': True
}

# Security configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'julian_portfolio_secret_key_2024')
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')

# File upload configuration
UPLOAD_FOLDER = Path(os.getenv('UPLOAD_FOLDER', './uploads'))
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 10485760))  # 10MB
ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,gif,webp').split(',')

# FastAPI app
app = FastAPI(
    title="Julian Portfolio Admin API",
    description="Admin panel backend for Julian D'Rozario's portfolio with MySQL integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL', 'http://localhost:3000'), "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_FOLDER)), name="uploads")

# Pydantic Models
class BlogCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    read_time: str = "5 min read"
    featured: bool = False
    tags: List[str] = []
    image_url: Optional[str] = None

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    read_time: Optional[str] = None
    featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

class ContactUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    availability: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class CategoryCreate(BaseModel):
    name: str

# Database connection pool
class DatabaseManager:
    def __init__(self):
        self.config = MYSQL_CONFIG
        
    def get_connection(self):
        try:
            connection = mysql.connector.connect(**self.config)
            return connection
        except Error as e:
            print(f"Database connection error: {e}")
            raise HTTPException(status_code=500, detail="Database connection failed")
    
    def execute_query(self, query: str, params: tuple = None, fetch: bool = False):
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                if query.strip().lower().startswith('select'):
                    return cursor.fetchall()
                else:
                    return cursor.fetchone()
            else:
                connection.commit()
                return cursor.lastrowid
                
        except Error as e:
            print(f"Database query error: {e}")
            if connection:
                connection.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

db_manager = DatabaseManager()

# Authentication functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=int(os.getenv('JWT_EXPIRATION_HOURS', 24)))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# File upload helper
def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file: UploadFile) -> str:
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")
    
    # Generate unique filename
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_FOLDER / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        buffer.write(content)
    
    return f"/uploads/{unique_filename}"

# API Endpoints

@app.get("/api/")
async def root():
    return {"message": "Julian Portfolio Admin API", "version": "1.0.0", "database": "MySQL"}

@app.get("/api/health")
async def health_check():
    try:
        # Test database connection
        db_manager.execute_query("SELECT 1", fetch=True)
        return {"status": "healthy", "database": "connected", "timestamp": datetime.utcnow()}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin):
    # Get admin user from database
    query = "SELECT username, password_hash FROM admin_users WHERE username = %s"
    result = db_manager.execute_query(query, (login_data.username,), fetch=True)
    
    if not result or not verify_password(login_data.password, result[0]['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Update last login
    update_query = "UPDATE admin_users SET last_login = %s WHERE username = %s"
    db_manager.execute_query(update_query, (datetime.utcnow(), login_data.username))
    
    # Create access token
    access_token = create_access_token(data={"sub": login_data.username})
    
    return {"access_token": access_token, "token_type": "bearer", "username": login_data.username}

@app.get("/api/admin/verify")
async def verify_admin_token(current_user: str = Depends(verify_token)):
    return {"valid": True, "username": current_user}

# Blog endpoints
@app.get("/api/blogs")
async def get_blogs():
    query = """
    SELECT id, title, excerpt, content, date, read_time, category, author, 
           image_url, featured, tags, views, likes, created_at, updated_at
    FROM blogs 
    ORDER BY created_at DESC
    """
    blogs = db_manager.execute_query(query, fetch=True)
    
    # Parse JSON tags
    for blog in blogs:
        if blog['tags']:
            try:
                blog['tags'] = json.loads(blog['tags'])
            except json.JSONDecodeError:
                blog['tags'] = []
        else:
            blog['tags'] = []
    
    return blogs

@app.get("/api/blogs/{blog_id}")
async def get_blog(blog_id: int):
    query = """
    SELECT id, title, excerpt, content, date, read_time, category, author, 
           image_url, featured, tags, views, likes, created_at, updated_at
    FROM blogs 
    WHERE id = %s
    """
    result = db_manager.execute_query(query, (blog_id,), fetch=True)
    
    if not result:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    blog = result[0]
    if blog['tags']:
        try:
            blog['tags'] = json.loads(blog['tags'])
        except json.JSONDecodeError:
            blog['tags'] = []
    else:
        blog['tags'] = []
    
    # Increment views
    update_query = "UPDATE blogs SET views = views + 1 WHERE id = %s"
    db_manager.execute_query(update_query, (blog_id,))
    
    return blog

@app.post("/api/blogs")
async def create_blog(blog: BlogCreate, current_user: str = Depends(verify_token)):
    query = """
    INSERT INTO blogs (title, excerpt, content, date, read_time, category, author, 
                      image_url, featured, tags, views, likes)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0)
    """
    
    tags_json = json.dumps(blog.tags) if blog.tags else "[]"
    current_date = datetime.now().date()
    
    blog_id = db_manager.execute_query(query, (
        blog.title, blog.excerpt, blog.content, current_date,
        blog.read_time, blog.category, "Julian D'Rozario",
        blog.image_url, blog.featured, tags_json
    ))
    
    return {"id": blog_id, "message": "Blog created successfully"}

@app.put("/api/blogs/{blog_id}")
async def update_blog(blog_id: int, blog: BlogUpdate, current_user: str = Depends(verify_token)):
    # Check if blog exists
    check_query = "SELECT id FROM blogs WHERE id = %s"
    existing = db_manager.execute_query(check_query, (blog_id,), fetch=True)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Build dynamic update query
    update_fields = []
    params = []
    
    if blog.title is not None:
        update_fields.append("title = %s")
        params.append(blog.title)
    if blog.excerpt is not None:
        update_fields.append("excerpt = %s")
        params.append(blog.excerpt)
    if blog.content is not None:
        update_fields.append("content = %s")
        params.append(blog.content)
    if blog.category is not None:
        update_fields.append("category = %s")
        params.append(blog.category)
    if blog.read_time is not None:
        update_fields.append("read_time = %s")
        params.append(blog.read_time)
    if blog.featured is not None:
        update_fields.append("featured = %s")
        params.append(blog.featured)
    if blog.tags is not None:
        update_fields.append("tags = %s")
        params.append(json.dumps(blog.tags))
    if blog.image_url is not None:
        update_fields.append("image_url = %s")
        params.append(blog.image_url)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields.append("updated_at = %s")
    params.append(datetime.utcnow())
    params.append(blog_id)
    
    query = f"UPDATE blogs SET {', '.join(update_fields)} WHERE id = %s"
    db_manager.execute_query(query, tuple(params))
    
    return {"message": "Blog updated successfully"}

@app.delete("/api/blogs/{blog_id}")
async def delete_blog(blog_id: int, current_user: str = Depends(verify_token)):
    # Check if blog exists
    check_query = "SELECT id, image_url FROM blogs WHERE id = %s"
    existing = db_manager.execute_query(check_query, (blog_id,), fetch=True)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Delete associated image file if exists
    blog = existing[0]
    if blog['image_url'] and blog['image_url'].startswith('/uploads/'):
        file_path = UPLOAD_FOLDER / blog['image_url'].replace('/uploads/', '')
        if file_path.exists():
            file_path.unlink()
    
    # Delete blog
    delete_query = "DELETE FROM blogs WHERE id = %s"
    db_manager.execute_query(delete_query, (blog_id,))
    
    return {"message": "Blog deleted successfully"}

# Contact endpoints
@app.get("/api/contact")
async def get_contact_info():
    query = "SELECT email, phone, linkedin, availability FROM contact_info ORDER BY id DESC LIMIT 1"
    result = db_manager.execute_query(query, fetch=True)
    
    if not result:
        # Return default contact info if none exists
        return {
            "email": "julian@drozario.blog",
            "phone": "+971 55 386 8045", 
            "linkedin": "https://www.linkedin.com/in/julian-d-rozario",
            "availability": "Available for consultation"
        }
    
    return result[0]

@app.put("/api/contact")
async def update_contact_info(contact: ContactUpdate, current_user: str = Depends(verify_token)):
    # Build dynamic update query
    update_fields = []
    params = []
    
    if contact.email is not None:
        update_fields.append("email = %s")
        params.append(str(contact.email))
    if contact.phone is not None:
        update_fields.append("phone = %s")
        params.append(contact.phone)
    if contact.linkedin is not None:
        update_fields.append("linkedin = %s")
        params.append(contact.linkedin)
    if contact.availability is not None:
        update_fields.append("availability = %s")
        params.append(contact.availability)
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_fields.append("updated_at = %s")
    params.append(datetime.utcnow())
    
    # Check if contact info exists
    check_query = "SELECT id FROM contact_info LIMIT 1"
    existing = db_manager.execute_query(check_query, fetch=True)
    
    if existing:
        # Update existing
        query = f"UPDATE contact_info SET {', '.join(update_fields)} WHERE id = %s"
        params.append(existing[0]['id'])
        db_manager.execute_query(query, tuple(params))
    else:
        # Insert new
        insert_query = """
        INSERT INTO contact_info (email, phone, linkedin, availability) 
        VALUES (%s, %s, %s, %s)
        """
        db_manager.execute_query(insert_query, (
            str(contact.email) if contact.email else "julian@drozario.blog",
            contact.phone or "+971 55 386 8045",
            contact.linkedin or "https://www.linkedin.com/in/julian-d-rozario",
            contact.availability or "Available for consultation"
        ))
    
    return {"message": "Contact information updated successfully"}

# Categories endpoints
@app.get("/api/categories")
async def get_categories():
    query = "SELECT id, name, count FROM categories ORDER BY name"
    return db_manager.execute_query(query, fetch=True)

@app.post("/api/categories")
async def create_category(category: CategoryCreate, current_user: str = Depends(verify_token)):
    query = "INSERT INTO categories (name, count) VALUES (%s, 0)"
    try:
        category_id = db_manager.execute_query(query, (category.name,))
        return {"id": category_id, "message": "Category created successfully"}
    except Error as e:
        if "Duplicate entry" in str(e):
            raise HTTPException(status_code=400, detail="Category already exists")
        raise HTTPException(status_code=500, detail="Failed to create category")

# File upload endpoints
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: str = Depends(verify_token)):
    try:
        file_url = save_uploaded_file(file)
        return {"url": file_url, "filename": file.filename, "message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# Statistics endpoints
@app.get("/api/stats")
async def get_stats(current_user: str = Depends(verify_token)):
    stats_queries = {
        "total_blogs": "SELECT COUNT(*) as count FROM blogs",
        "featured_blogs": "SELECT COUNT(*) as count FROM blogs WHERE featured = 1",
        "total_views": "SELECT SUM(views) as count FROM blogs",
        "total_likes": "SELECT SUM(likes) as count FROM blogs",
        "categories": "SELECT COUNT(*) as count FROM categories WHERE name != 'All'"
    }
    
    stats = {}
    for key, query in stats_queries.items():
        result = db_manager.execute_query(query, fetch=True)
        stats[key] = result[0]['count'] if result and result[0]['count'] else 0
    
    return stats

if __name__ == "__main__":
    uvicorn.run("mysql_server:app", host="0.0.0.0", port=8001, reload=True)
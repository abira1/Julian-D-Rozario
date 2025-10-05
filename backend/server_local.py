"""
Julian D'Rozario Portfolio Backend - Local Development Version
Uses SQLite for quick local development without MySQL setup
"""

from fastapi import FastAPI, HTTPException, Depends, status, Request, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import sqlite3
import json
from contextlib import contextmanager
import time

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Configuration - SQLite for local development
DATABASE_PATH = ROOT_DIR / "julian_portfolio.db"

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'julian-drozario-local-dev-secret-key-2025')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_HOURS = int(os.environ.get('ACCESS_TOKEN_EXPIRE_HOURS', 24))

# Admin Configuration
AUTHORIZED_ADMIN_EMAILS = os.environ.get('AUTHORIZED_ADMIN_EMAILS', 'juliandrozario@gmail.com').split(',')

# Security
security = HTTPBearer()

# App initialization
app = FastAPI(
    title="Julian D'Rozario Portfolio API",
    description="Local Development API with SQLite",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Context Manager
@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    try:
        yield conn
    finally:
        conn.close()

# Pydantic Models
class BlogCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    excerpt: str = Field(..., min_length=1, max_length=1000)
    content: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)
    read_time: str = Field(default="5 min read", max_length=20)
    author: str = Field(default="Julian D'Rozario", max_length=100)
    tags: List[str] = Field(default=[])
    is_featured: bool = Field(default=False)
    status: str = Field(default="published")

class BlogUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    excerpt: Optional[str] = Field(None, min_length=1, max_length=1000)
    content: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    read_time: Optional[str] = Field(None, max_length=20)
    author: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    status: Optional[str] = None

class ContactInfoCreate(BaseModel):
    label: str = Field(..., min_length=1, max_length=100)
    value: str = Field(..., min_length=1, max_length=500)
    contact_type: str = Field(..., min_length=1, max_length=50)
    icon: str = Field(default="info", max_length=50)
    is_visible: bool = Field(default=True)
    display_order: int = Field(default=0)

class ContactInfoUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=100)
    value: Optional[str] = Field(None, min_length=1, max_length=500)
    contact_type: Optional[str] = Field(None, min_length=1, max_length=50)
    icon: Optional[str] = Field(None, max_length=50)
    is_visible: Optional[bool] = None
    display_order: Optional[int] = None

# Database initialization
def init_database():
    """Initialize SQLite database with tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Blogs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blogs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                excerpt TEXT NOT NULL,
                content TEXT NOT NULL,
                date DATE NOT NULL,
                read_time TEXT NOT NULL DEFAULT '5 min read',
                category TEXT NOT NULL,
                author TEXT NOT NULL DEFAULT 'Julian D''Rozario',
                tags TEXT DEFAULT '[]',
                views INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT FALSE,
                status TEXT DEFAULT 'published',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Contact info table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS contact_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                value TEXT NOT NULL,
                contact_type TEXT NOT NULL,
                icon TEXT DEFAULT 'info',
                is_visible BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert sample blog if none exists
        cursor.execute("SELECT COUNT(*) FROM blogs")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO blogs (title, excerpt, content, date, category, author)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                "Welcome to Julian D'Rozario's Portfolio",
                "This is a sample blog post to get you started with the admin dashboard.",
                "<h2>Welcome!</h2><p>This is your portfolio website. You can manage your blog posts and contact information through the admin dashboard.</p><p>Access the admin panel at <strong>/julian_portfolio</strong></p>",
                datetime.now().date().isoformat(),
                "General",
                "Julian D'Rozario"
            ))
        
        # Insert sample contact info if none exists
        cursor.execute("SELECT COUNT(*) FROM contact_info")
        if cursor.fetchone()[0] == 0:
            sample_contacts = [
                ("Email", "juliandrozario@gmail.com", "email", "mail", True, 1),
                ("Phone", "+1 (555) 123-4567", "phone", "phone", True, 2),
                ("LinkedIn", "linkedin.com/in/juliandrozario", "social", "linkedin", True, 3),
                ("Location", "New York, NY", "location", "map-pin", True, 4)
            ]
            for contact in sample_contacts:
                cursor.execute("""
                    INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, contact)
        
        conn.commit()
        logger.info("✅ Database initialized successfully")

# Authentication
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if email not in AUTHORIZED_ADMIN_EMAILS:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# Routes
@app.get("/")
async def root():
    return {"message": "Julian D'Rozario Portfolio API - Local Development", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "sqlite", "timestamp": datetime.now().isoformat()}

# Blog endpoints
@app.get("/api/blogs")
async def get_blogs(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(default=10, le=100),
    offset: int = Query(default=0, ge=0)
):
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = "SELECT * FROM blogs WHERE status = 'published'"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if featured is not None:
            query += " AND is_featured = ?"
            params.append(featured)
        
        query += " ORDER BY date DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        blogs = []
        for row in cursor.fetchall():
            blog = dict(row)
            blog['tags'] = json.loads(blog['tags']) if blog['tags'] else []
            blogs.append(blog)
        
        return {"blogs": blogs, "total": len(blogs)}

@app.get("/api/blogs/{blog_id}")
async def get_blog(blog_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM blogs WHERE id = ? AND status = 'published'", (blog_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        blog = dict(row)
        blog['tags'] = json.loads(blog['tags']) if blog['tags'] else []
        
        # Increment views
        cursor.execute("UPDATE blogs SET views = views + 1 WHERE id = ?", (blog_id,))
        conn.commit()
        
        return blog

@app.post("/api/blogs")
async def create_blog(blog: BlogCreate, admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO blogs (title, excerpt, content, date, read_time, category, author, tags, is_featured, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            blog.title,
            blog.excerpt,
            blog.content,
            datetime.now().date().isoformat(),
            blog.read_time,
            blog.category,
            blog.author,
            json.dumps(blog.tags),
            blog.is_featured,
            blog.status
        ))
        conn.commit()
        blog_id = cursor.lastrowid
        
        return {"id": blog_id, "message": "Blog created successfully"}

@app.put("/api/blogs/{blog_id}")
async def update_blog(blog_id: int, blog: BlogUpdate, admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if blog exists
        cursor.execute("SELECT id FROM blogs WHERE id = ?", (blog_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Build update query
        updates = []
        params = []
        
        for field, value in blog.dict(exclude_unset=True).items():
            if field == 'tags':
                updates.append("tags = ?")
                params.append(json.dumps(value))
            else:
                updates.append(f"{field} = ?")
                params.append(value)
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(blog_id)
            
            query = f"UPDATE blogs SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        return {"message": "Blog updated successfully"}

@app.delete("/api/blogs/{blog_id}")
async def delete_blog(blog_id: int, admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        conn.commit()
        return {"message": "Blog deleted successfully"}

# Contact info endpoints
@app.get("/api/contact-info")
async def get_contact_info():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contact_info WHERE is_visible = TRUE ORDER BY display_order ASC")
        contacts = [dict(row) for row in cursor.fetchall()]
        return contacts

@app.get("/api/admin/contact-info")
async def get_all_contact_info(admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contact_info ORDER BY display_order ASC")
        contacts = [dict(row) for row in cursor.fetchall()]
        return contacts

@app.post("/api/contact-info")
async def create_contact_info(contact: ContactInfoCreate, admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            contact.label,
            contact.value,
            contact.contact_type,
            contact.icon,
            contact.is_visible,
            contact.display_order
        ))
        conn.commit()
        contact_id = cursor.lastrowid
        
        return {"id": contact_id, "message": "Contact info created successfully"}

@app.put("/api/contact-info/{contact_id}")
async def update_contact_info(contact_id: int, contact: ContactInfoUpdate, admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if contact exists
        cursor.execute("SELECT id FROM contact_info WHERE id = ?", (contact_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Contact info not found")
        
        # Build update query
        updates = []
        params = []
        
        for field, value in contact.dict(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)
        
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(contact_id)
            
            query = f"UPDATE contact_info SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        return {"message": "Contact info updated successfully"}

@app.delete("/api/contact-info/{contact_id}")
async def delete_contact_info(contact_id: int, admin_email: str = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM contact_info WHERE id = ?", (contact_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Contact info not found")
        
        conn.commit()
        return {"message": "Contact info deleted successfully"}

# Simple admin login (for local development)
@app.post("/api/admin/login")
async def admin_login(email: str, password: str = "admin123"):
    """Simple admin login for local development"""
    if email in AUTHORIZED_ADMIN_EMAILS:
        token = jwt.encode({
            "email": email,
            "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
        }, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"email": email, "name": email.split('@')[0]}
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Categories endpoint
@app.get("/api/categories")
async def get_categories():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT category FROM blogs ORDER BY category")
        categories = [row[0] for row in cursor.fetchall()]
        return categories

# Startup event
@app.on_event("startup")
async def startup_event():
    init_database()
    logger.info("🚀 Julian D'Rozario Portfolio API started successfully!")
    logger.info(f"📍 Database: SQLite at {DATABASE_PATH}")
    logger.info("📍 Access admin panel at: http://localhost:3000/julian_portfolio")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Julian D'Rozario Portfolio API...")
    print("📍 Frontend: http://localhost:3000")
    print("📍 Backend API: http://localhost:8001")
    print("📍 API Docs: http://localhost:8001/docs")
    print("📍 Admin Panel: http://localhost:3000/julian_portfolio")
    print("📧 Admin Email: juliandrozario@gmail.com")
    print("🔑 Admin Password: admin123 (for local dev)")
    uvicorn.run(app, host="0.0.0.0", port=8001)
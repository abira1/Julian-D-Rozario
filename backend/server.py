"""
Julian D'Rozario Portfolio Backend
Supports both SQLite (local dev) and MySQL (production/Hostinger)
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
from datetime import datetime, timedelta
import jwt
import json
from contextlib import contextmanager

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database Configuration
DATABASE_TYPE = os.environ.get('DATABASE_TYPE', 'sqlite')
USE_MYSQL = DATABASE_TYPE == 'mysql'

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'julian-drozario-local-dev-secret-key-2025')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_HOURS = int(os.environ.get('ACCESS_TOKEN_EXPIRE_HOURS', 24))

# Admin Configuration
AUTHORIZED_ADMIN_EMAILS = os.environ.get('AUTHORIZED_ADMIN_EMAILS', 'juliandrozario@gmail.com,abirsabirhossain@gmail.com').split(',')

# Security
security = HTTPBearer()

# App initialization
app = FastAPI(
    title="Julian D'Rozario Portfolio API",
    description="Portfolio API with MySQL/SQLite Support",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection Management
if USE_MYSQL:
    import aiomysql
    from aiomysql.cursors import DictCursor
    
    # MySQL Connection Pool
    db_pool = None
    
    async def init_mysql_pool():
        global db_pool
        db_pool = await aiomysql.create_pool(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            db=os.environ.get('MYSQL_DATABASE', 'julian_portfolio'),
            autocommit=True,
            cursorclass=DictCursor,
            minsize=1,
            maxsize=10
        )
        logger.info("✅ MySQL connection pool initialized")
    
    @contextmanager
    async def get_db():
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                yield cursor
else:
    import sqlite3
    DATABASE_PATH = ROOT_DIR / "julian_portfolio.db"
    
    @contextmanager
    def get_db():
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

# =====================================================
# PYDANTIC MODELS
# =====================================================

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
    # SEO Fields
    slug: Optional[str] = Field(None, max_length=500)
    meta_title: Optional[str] = Field(None, max_length=60)
    meta_description: Optional[str] = Field(None, max_length=160)
    keywords: Optional[str] = Field(None, max_length=500)
    og_image: Optional[str] = Field(None, max_length=500)
    canonical_url: Optional[str] = Field(None, max_length=500)

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
    # SEO Fields
    slug: Optional[str] = Field(None, max_length=500)
    meta_title: Optional[str] = Field(None, max_length=60)
    meta_description: Optional[str] = Field(None, max_length=160)
    keywords: Optional[str] = Field(None, max_length=500)
    og_image: Optional[str] = Field(None, max_length=500)
    canonical_url: Optional[str] = Field(None, max_length=500)

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

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=255)
    photo_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None
    preferences: Optional[Dict] = None

class CommentCreate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=5000)
    parent_comment_id: Optional[int] = None

class CommentUpdate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=5000)

class FirebaseLoginRequest(BaseModel):
    firebase_token: str
    user_data: Dict

# =====================================================
# AUTHENTICATION HELPERS
# =====================================================

def create_jwt_token(email: str, firebase_uid: str, is_admin: bool = False):
    """Create JWT token for user"""
    payload = {
        "email": email,
        "firebase_uid": firebase_uid,
        "is_admin": is_admin,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def verify_admin(user_data: dict = Depends(verify_token)):
    """Verify user is admin"""
    if not user_data.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user_data

# =====================================================
# DATABASE INITIALIZATION (SQLite)
# =====================================================

def init_sqlite_database():
    """Initialize SQLite database with tables"""
    import sqlite3
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Blogs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            excerpt TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            featured_image TEXT,
            date DATE NOT NULL,
            read_time TEXT NOT NULL DEFAULT '5 min read',
            category TEXT NOT NULL,
            author TEXT NOT NULL DEFAULT 'Julian D''Rozario',
            tags TEXT DEFAULT '[]',
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            is_featured BOOLEAN DEFAULT FALSE,
            status TEXT DEFAULT 'published',
            slug TEXT UNIQUE,
            meta_title TEXT,
            meta_description TEXT,
            keywords TEXT,
            og_image TEXT,
            canonical_url TEXT,
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
    
    # User profiles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firebase_uid TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            display_name TEXT,
            photo_url TEXT,
            bio TEXT,
            is_admin BOOLEAN DEFAULT FALSE,
            preferences TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    """)
    
    # Blog likes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blog_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blog_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            firebase_uid TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(blog_id, user_id),
            FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
        )
    """)
    
    # Blog saves table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blog_saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blog_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            firebase_uid TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(blog_id, user_id),
            FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
        )
    """)
    
    # Blog comments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blog_comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blog_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            firebase_uid TEXT NOT NULL,
            parent_comment_id INTEGER,
            comment_text TEXT NOT NULL,
            is_edited BOOLEAN DEFAULT FALSE,
            is_deleted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_comment_id) REFERENCES blog_comments(id) ON DELETE CASCADE
        )
    """)
    
    # Insert sample data if none exists
    cursor.execute("SELECT COUNT(*) FROM blogs")
    if cursor.fetchone()[0] == 0:
        sample_blogs = [
            (
                "Complete Guide to Company Formation in Dubai Free Zones 2025",
                "Everything you need to know about setting up your business in Dubai Free Zones, including license types, costs, and step-by-step procedures.",
                "<h2>Introduction</h2><p>Dubai has emerged as one of the world's leading business hubs. In this comprehensive guide, we'll walk you through everything you need to know about company formation in Dubai Free Zones.</p>",
                "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
                "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
                datetime.now().date().isoformat(),
                "5 min read",
                "Company Formation",
                "Julian D'Rozario",
                True,
                "published",
                "complete-guide-company-formation-dubai-free-zones-2025"
            ),
            (
                "UAE Golden Visa: Complete Guide for Investors and Entrepreneurs",
                "Comprehensive guide to obtaining UAE Golden Visa, including eligibility criteria, benefits, application process, and investment requirements.",
                "<h2>What is the UAE Golden Visa?</h2><p>The UAE Golden Visa is a long-term residence visa that allows foreign nationals to live, work, and study in the UAE without the need for a national sponsor.</p>",
                "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&h=400&fit=crop",
                "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=800&h=400&fit=crop",
                (datetime.now() - timedelta(days=2)).date().isoformat(),
                "7 min read",
                "Immigration",
                "Julian D'Rozario",
                False,
                "published",
                "uae-golden-visa-complete-guide-investors-entrepreneurs"
            ),
            (
                "Meydan Free Zone vs Other Dubai Free Zones: Detailed Comparison",
                "In-depth comparison of Meydan Free Zone with other popular Dubai free zones including DMCC, JAFZA, and Dubai Silicon Oasis.",
                "<h2>Introduction</h2><p>Choosing the right free zone is crucial for your business success in Dubai. This article provides a comprehensive comparison.</p>",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
                (datetime.now() - timedelta(days=5)).date().isoformat(),
                "6 min read",
                "Company Formation",
                "Julian D'Rozario",
                False,
                "published",
                "meydan-free-zone-vs-other-dubai-free-zones-comparison"
            ),
            (
                "Top 10 Business Activities for Dubai Free Zone License in 2025",
                "Explore the most profitable and in-demand business activities for Dubai free zone licenses, with detailed requirements and market insights.",
                "<h2>Most Popular Business Activities</h2><p>Based on market trends and our experience with over 3,200 license formations, here are the top business activities for 2025.</p>",
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
                (datetime.now() - timedelta(days=7)).date().isoformat(),
                "8 min read",
                "Business Development",
                "Julian D'Rozario",
                False,
                "published",
                "top-10-business-activities-dubai-free-zone-license-2025"
            ),
            (
                "Complete Document Checklist for UAE Company Formation",
                "Comprehensive checklist of all documents required for company formation in UAE free zones, mainland, and offshore jurisdictions.",
                "<h2>Essential Documents Overview</h2><p>Proper documentation is crucial for smooth company formation. This guide covers all required documents for different jurisdiction types.</p>",
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
                (datetime.now() - timedelta(days=10)).date().isoformat(),
                "5 min read",
                "Compliance",
                "Julian D'Rozario",
                False,
                "published",
                "complete-document-checklist-uae-company-formation"
            ),
            (
                "Understanding UAE Corporate Tax: What Businesses Need to Know",
                "Comprehensive guide to UAE corporate tax implementation, exemptions, compliance requirements, and planning strategies for businesses.",
                "<h2>UAE Corporate Tax Overview</h2><p>From June 1, 2023, the UAE implemented a federal corporate tax at a rate of 9% on taxable income exceeding AED 375,000.</p>",
                "https://images.unsplash.com/photo-1554224311-beee04f8f935?w=800&h=400&fit=crop",
                "https://images.unsplash.com/photo-1554224311-beee04f8f935?w=800&h=400&fit=crop",
                (datetime.now() - timedelta(days=14)).date().isoformat(),
                "10 min read",
                "Compliance",
                "Julian D'Rozario",
                False,
                "published",
                "understanding-uae-corporate-tax-what-businesses-need-know"
            )
        ]
        
        for blog in sample_blogs:
            cursor.execute("""
                INSERT INTO blogs (title, excerpt, content, image_url, featured_image, date, read_time, category, author, is_featured, status, slug)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, blog)
    
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
    conn.close()
    logger.info("✅ SQLite database initialized")

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def generate_slug(title: str, blog_id: int = None) -> str:
    """Generate SEO-friendly slug from title"""
    import re
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = slug.strip('-')
    
    # Add ID suffix if provided to ensure uniqueness
    if blog_id:
        slug = f"{slug}-{blog_id}"
    
    return slug[:100]  # Limit length

def validate_slug(slug: str, current_blog_id: int = None) -> bool:
    """Check if slug is unique"""
    if USE_MYSQL:
        # MySQL validation would go here
        return True
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            if current_blog_id:
                cursor.execute("SELECT id FROM blogs WHERE slug = ? AND id != ?", (slug, current_blog_id))
            else:
                cursor.execute("SELECT id FROM blogs WHERE slug = ?", (slug,))
            return cursor.fetchone() is None

async def get_or_create_user(firebase_uid: str, email: str, display_name: str = None, photo_url: str = None):
    """Get or create user profile"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Check if user exists
                await cursor.execute(
                    "SELECT * FROM user_profiles WHERE firebase_uid = %s",
                    (firebase_uid,)
                )
                user = await cursor.fetchone()
                
                if user:
                    # Update last login
                    await cursor.execute(
                        "UPDATE user_profiles SET last_login = NOW() WHERE firebase_uid = %s",
                        (firebase_uid,)
                    )
                    await conn.commit()
                    return user
                else:
                    # Create new user
                    is_admin = email in AUTHORIZED_ADMIN_EMAILS
                    await cursor.execute("""
                        INSERT INTO user_profiles (firebase_uid, email, display_name, photo_url, is_admin, last_login)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                    """, (firebase_uid, email, display_name, photo_url, is_admin))
                    await conn.commit()
                    
                    await cursor.execute("SELECT * FROM user_profiles WHERE firebase_uid = %s", (firebase_uid,))
                    return await cursor.fetchone()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            
            if user:
                cursor.execute(
                    "UPDATE user_profiles SET last_login = CURRENT_TIMESTAMP WHERE firebase_uid = ?",
                    (firebase_uid,)
                )
                conn.commit()
                return dict(user)
            else:
                is_admin = email in AUTHORIZED_ADMIN_EMAILS
                cursor.execute("""
                    INSERT INTO user_profiles (firebase_uid, email, display_name, photo_url, is_admin, last_login)
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (firebase_uid, email, display_name, photo_url, is_admin))
                conn.commit()
                
                cursor.execute("SELECT * FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
                return dict(cursor.fetchone())

# =====================================================
# API ROUTES
# =====================================================

@app.get("/")
async def root():
    return {
        "message": "Julian D'Rozario Portfolio API",
        "status": "running",
        "database": "MySQL" if USE_MYSQL else "SQLite",
        "version": "2.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "MySQL" if USE_MYSQL else "SQLite",
        "timestamp": datetime.now().isoformat()
    }

# =====================================================
# SEO ROUTES
# =====================================================

@app.get("/sitemap.xml")
async def generate_sitemap():
    """Generate XML sitemap for SEO"""
    from fastapi.responses import Response
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, slug, title, updated_at FROM blogs WHERE status = 'published' ORDER BY updated_at DESC"
                )
                blogs = await cursor.fetchall()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, slug, title, updated_at FROM blogs WHERE status = 'published' ORDER BY updated_at DESC"
            )
            blogs = [dict(row) for row in cursor.fetchall()]
    
    # Build sitemap XML
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Homepage
    xml += '  <url>\n'
    xml += '    <loc>https://drozario.blog/</loc>\n'
    xml += f'    <lastmod>{datetime.now().date().isoformat()}</lastmod>\n'
    xml += '    <changefreq>weekly</changefreq>\n'
    xml += '    <priority>1.0</priority>\n'
    xml += '  </url>\n'
    
    # Blog listing page
    xml += '  <url>\n'
    xml += '    <loc>https://drozario.blog/blog</loc>\n'
    xml += f'    <lastmod>{datetime.now().date().isoformat()}</lastmod>\n'
    xml += '    <changefreq>daily</changefreq>\n'
    xml += '    <priority>0.9</priority>\n'
    xml += '  </url>\n'
    
    # Individual blog posts
    for blog in blogs:
        blog_url = f"https://drozario.blog/blog/{blog.get('slug') or blog.get('id')}"
        updated = blog.get('updated_at', datetime.now().isoformat())
        if isinstance(updated, str):
            try:
                updated = datetime.fromisoformat(updated.replace('Z', '+00:00')).date().isoformat()
            except:
                updated = datetime.now().date().isoformat()
        
        xml += '  <url>\n'
        xml += f'    <loc>{blog_url}</loc>\n'
        xml += f'    <lastmod>{updated}</lastmod>\n'
        xml += '    <changefreq>monthly</changefreq>\n'
        xml += '    <priority>0.8</priority>\n'
        xml += '  </url>\n'
    
    xml += '</urlset>'
    
    return Response(content=xml, media_type="application/xml")

@app.get("/robots.txt")
async def robots_txt():
    """Generate robots.txt for SEO"""
    from fastapi.responses import Response
    
    robots = """User-agent: *
Allow: /
Disallow: /julian_portfolio/
Disallow: /api/

Sitemap: https://drozario.blog/sitemap.xml
"""
    
    return Response(content=robots, media_type="text/plain")

# =====================================================
# AUTHENTICATION ROUTES
# =====================================================

@app.post("/api/auth/firebase-user-login")
async def firebase_user_login(request: FirebaseLoginRequest):
    """Login/register user via Firebase"""
    try:
        user_data = request.user_data
        firebase_uid = user_data.get('uid')
        email = user_data.get('email')
        display_name = user_data.get('name')
        photo_url = user_data.get('picture')
        
        # Get or create user
        user = await get_or_create_user(firebase_uid, email, display_name, photo_url)
        
        # Create JWT token
        is_admin = email in AUTHORIZED_ADMIN_EMAILS
        token = create_jwt_token(email, firebase_uid, is_admin)
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.get('id') if USE_MYSQL else user['id'],
                "email": email,
                "display_name": display_name,
                "photo_url": photo_url,
                "is_admin": is_admin
            }
        }
    except Exception as e:
        logger.error(f"Firebase login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/firebase-admin-login")
async def firebase_admin_login(request: FirebaseLoginRequest):
    """Admin login via Firebase"""
    user_data = request.user_data
    email = user_data.get('email')
    
    if email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Access denied - Not an admin")
    
    return await firebase_user_login(request)

# =====================================================
# USER PROFILE ROUTES
# =====================================================

@app.get("/api/user/profile")
async def get_user_profile(user_data: dict = Depends(verify_token)):
    """Get current user's profile"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT * FROM user_profiles WHERE firebase_uid = %s",
                    (firebase_uid,)
                )
                user = await cursor.fetchone()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            if user:
                user = dict(user)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Parse preferences if stored as JSON string (SQLite)
    if not USE_MYSQL and isinstance(user.get('preferences'), str):
        user['preferences'] = json.loads(user.get('preferences', '{}'))
    
    return user

@app.put("/api/user/profile")
async def update_user_profile(profile_data: UserProfileUpdate, user_data: dict = Depends(verify_token)):
    """Update current user's profile"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                updates = []
                params = []
                
                for field, value in profile_data.dict(exclude_unset=True).items():
                    if field == 'preferences':
                        updates.append(f"{field} = %s")
                        params.append(json.dumps(value))
                    else:
                        updates.append(f"{field} = %s")
                        params.append(value)
                
                if updates:
                    params.append(firebase_uid)
                    query = f"UPDATE user_profiles SET {', '.join(updates)} WHERE firebase_uid = %s"
                    await cursor.execute(query, params)
                    await conn.commit()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            updates = []
            params = []
            
            for field, value in profile_data.dict(exclude_unset=True).items():
                if field == 'preferences':
                    updates.append(f"{field} = ?")
                    params.append(json.dumps(value))
                else:
                    updates.append(f"{field} = ?")
                    params.append(value)
            
            if updates:
                updates.append("updated_at = CURRENT_TIMESTAMP")
                params.append(firebase_uid)
                query = f"UPDATE user_profiles SET {', '.join(updates)} WHERE firebase_uid = ?"
                cursor.execute(query, params)
                conn.commit()
    
    return {"message": "Profile updated successfully"}

# =====================================================
# BLOG ROUTES (Existing + Enhanced)
# =====================================================

@app.get("/api/blogs")
async def get_blogs(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = Query(default=10, le=100),
    offset: int = Query(default=0, ge=0)
):
    """Get all blogs - public endpoint"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                query = "SELECT * FROM blogs WHERE status = 'published'"
                params = []
                
                if category:
                    query += " AND category = %s"
                    params.append(category)
                
                if featured is not None:
                    query += " AND is_featured = %s"
                    params.append(featured)
                
                query += " ORDER BY date DESC LIMIT %s OFFSET %s"
                params.extend([limit, offset])
                
                await cursor.execute(query, params)
                blogs = await cursor.fetchall()
                
                # Parse tags
                for blog in blogs:
                    if blog.get('tags'):
                        blog['tags'] = json.loads(blog['tags']) if isinstance(blog['tags'], str) else blog['tags']
                    else:
                        blog['tags'] = []
    else:
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
            blogs = [dict(row) for row in cursor.fetchall()]
            
            for blog in blogs:
                blog['tags'] = json.loads(blog['tags']) if blog.get('tags') else []
    
    return {"blogs": blogs, "total": len(blogs)}

@app.get("/api/blogs/{blog_id}")
async def get_blog(blog_id: int):
    """Get single blog by ID"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT * FROM blogs WHERE id = %s AND status = 'published'",
                    (blog_id,)
                )
                blog = await cursor.fetchone()
                
                if not blog:
                    raise HTTPException(status_code=404, detail="Blog not found")
                
                # Parse tags
                if blog.get('tags'):
                    blog['tags'] = json.loads(blog['tags']) if isinstance(blog['tags'], str) else blog['tags']
                else:
                    blog['tags'] = []
                
                # Increment views
                await cursor.execute("UPDATE blogs SET views = views + 1 WHERE id = %s", (blog_id,))
                await conn.commit()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM blogs WHERE id = ? AND status = 'published'", (blog_id,))
            row = cursor.fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Blog not found")
            
            blog = dict(row)
            blog['tags'] = json.loads(blog['tags']) if blog.get('tags') else []
            
            # Increment views
            cursor.execute("UPDATE blogs SET views = views + 1 WHERE id = ?", (blog_id,))
            conn.commit()
    
    return blog

@app.post("/api/blogs")
async def create_blog(blog: BlogCreate, user_data: dict = Depends(verify_admin)):
    """Create new blog (Admin only)"""
    # Generate slug if not provided
    slug = blog.slug if blog.slug else generate_slug(blog.title)
    
    # Ensure slug is unique
    if not validate_slug(slug):
        slug = generate_slug(blog.title, int(datetime.now().timestamp()))
    
    # Auto-generate meta fields if not provided
    meta_title = blog.meta_title or blog.title[:60]
    meta_description = blog.meta_description or blog.excerpt[:160]
    keywords = blog.keywords or blog.category
    og_image = blog.og_image or ""
    canonical_url = blog.canonical_url or f"/blog/{slug}"
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    INSERT INTO blogs (
                        title, excerpt, content, date, read_time, category, author, tags, is_featured, status,
                        slug, meta_title, meta_description, keywords, og_image, canonical_url
                    )
                    VALUES (%s, %s, %s, CURDATE(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    blog.title, blog.excerpt, blog.content, blog.read_time,
                    blog.category, blog.author, json.dumps(blog.tags),
                    blog.is_featured, blog.status,
                    slug, meta_title, meta_description, keywords, og_image, canonical_url
                ))
                await conn.commit()
                blog_id = cursor.lastrowid
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO blogs (
                    title, excerpt, content, date, read_time, category, author, tags, is_featured, status,
                    slug, meta_title, meta_description, keywords, og_image, canonical_url
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                blog.title, blog.excerpt, blog.content,
                datetime.now().date().isoformat(),
                blog.read_time, blog.category, blog.author,
                json.dumps(blog.tags), blog.is_featured, blog.status,
                slug, meta_title, meta_description, keywords, og_image, canonical_url
            ))
            conn.commit()
            blog_id = cursor.lastrowid
    
    return {"id": blog_id, "slug": slug, "message": "Blog created successfully"}

@app.put("/api/blogs/{blog_id}")
async def update_blog(blog_id: int, blog: BlogUpdate, user_data: dict = Depends(verify_admin)):
    """Update blog (Admin only)"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM blogs WHERE id = %s", (blog_id,))
                if not await cursor.fetchone():
                    raise HTTPException(status_code=404, detail="Blog not found")
                
                updates = []
                params = []
                
                for field, value in blog.dict(exclude_unset=True).items():
                    if field == 'tags':
                        updates.append("tags = %s")
                        params.append(json.dumps(value))
                    else:
                        updates.append(f"{field} = %s")
                        params.append(value)
                
                if updates:
                    params.append(blog_id)
                    query = f"UPDATE blogs SET {', '.join(updates)} WHERE id = %s"
                    await cursor.execute(query, params)
                    await conn.commit()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM blogs WHERE id = ?", (blog_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Blog not found")
            
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
async def delete_blog(blog_id: int, user_data: dict = Depends(verify_admin)):
    """Delete blog (Admin only)"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM blogs WHERE id = %s", (blog_id,))
                await conn.commit()
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Blog not found")
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM blogs WHERE id = ?", (blog_id,))
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Blog not found")
    
    return {"message": "Blog deleted successfully"}

@app.get("/api/categories")
async def get_categories():
    """Get all blog categories"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT DISTINCT category FROM blogs ORDER BY category")
                categories = [row['category'] for row in await cursor.fetchall()]
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT DISTINCT category FROM blogs ORDER BY category")
            categories = [row[0] for row in cursor.fetchall()]
    
    return categories

# =====================================================
# BLOG INTERACTIONS - LIKES
# =====================================================

@app.post("/api/blogs/{blog_id}/like")
async def like_blog(blog_id: int, user_data: dict = Depends(verify_token)):
    """Like a blog post"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Get user_id
                await cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = %s", (firebase_uid,))
                user = await cursor.fetchone()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")
                user_id = user['id']
                
                # Check if already liked
                await cursor.execute(
                    "SELECT id FROM blog_likes WHERE blog_id = %s AND user_id = %s",
                    (blog_id, user_id)
                )
                existing = await cursor.fetchone()
                
                if existing:
                    # Unlike
                    await cursor.execute(
                        "DELETE FROM blog_likes WHERE blog_id = %s AND user_id = %s",
                        (blog_id, user_id)
                    )
                    await cursor.execute("UPDATE blogs SET likes = likes - 1 WHERE id = %s", (blog_id,))
                    await conn.commit()
                    return {"liked": False, "message": "Blog unliked"}
                else:
                    # Like
                    await cursor.execute(
                        "INSERT INTO blog_likes (blog_id, user_id, firebase_uid) VALUES (%s, %s, %s)",
                        (blog_id, user_id, firebase_uid)
                    )
                    await cursor.execute("UPDATE blogs SET likes = likes + 1 WHERE id = %s", (blog_id,))
                    await conn.commit()
                    return {"liked": True, "message": "Blog liked"}
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            user_id = user['id']
            
            cursor.execute(
                "SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?",
                (blog_id, user_id)
            )
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute(
                    "DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?",
                    (blog_id, user_id)
                )
                cursor.execute("UPDATE blogs SET likes = likes - 1 WHERE id = ?", (blog_id,))
                conn.commit()
                return {"liked": False, "message": "Blog unliked"}
            else:
                cursor.execute(
                    "INSERT INTO blog_likes (blog_id, user_id, firebase_uid) VALUES (?, ?, ?)",
                    (blog_id, user_id, firebase_uid)
                )
                cursor.execute("UPDATE blogs SET likes = likes + 1 WHERE id = ?", (blog_id,))
                conn.commit()
                return {"liked": True, "message": "Blog liked"}

@app.get("/api/blogs/{blog_id}/user-like-status")
async def get_like_status(blog_id: int, user_data: dict = Depends(verify_token)):
    """Check if user has liked a blog"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = %s", (firebase_uid,))
                user = await cursor.fetchone()
                if not user:
                    return {"liked": False}
                
                await cursor.execute(
                    "SELECT id FROM blog_likes WHERE blog_id = %s AND user_id = %s",
                    (blog_id, user['id'])
                )
                liked = await cursor.fetchone() is not None
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            if not user:
                return {"liked": False}
            
            cursor.execute(
                "SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?",
                (blog_id, user['id'])
            )
            liked = cursor.fetchone() is not None
    
    return {"liked": liked}

@app.get("/api/user/liked-blogs")
async def get_user_liked_blogs(user_data: dict = Depends(verify_token)):
    """Get all blogs liked by user"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT b.* FROM blogs b
                    INNER JOIN blog_likes bl ON b.id = bl.blog_id
                    INNER JOIN user_profiles u ON bl.user_id = u.id
                    WHERE u.firebase_uid = %s AND b.status = 'published'
                    ORDER BY bl.created_at DESC
                """, (firebase_uid,))
                blogs = await cursor.fetchall()
                
                for blog in blogs:
                    if blog.get('tags'):
                        blog['tags'] = json.loads(blog['tags']) if isinstance(blog['tags'], str) else blog['tags']
                    else:
                        blog['tags'] = []
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT b.* FROM blogs b
                INNER JOIN blog_likes bl ON b.id = bl.blog_id
                INNER JOIN user_profiles u ON bl.user_id = u.id
                WHERE u.firebase_uid = ? AND b.status = 'published'
                ORDER BY bl.created_at DESC
            """, (firebase_uid,))
            blogs = [dict(row) for row in cursor.fetchall()]
            
            for blog in blogs:
                blog['tags'] = json.loads(blog['tags']) if blog.get('tags') else []
    
    return {"blogs": blogs}

# =====================================================
# BLOG INTERACTIONS - SAVES
# =====================================================

@app.post("/api/blogs/{blog_id}/save")
async def save_blog(blog_id: int, user_data: dict = Depends(verify_token)):
    """Save a blog post"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = %s", (firebase_uid,))
                user = await cursor.fetchone()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")
                user_id = user['id']
                
                await cursor.execute(
                    "SELECT id FROM blog_saves WHERE blog_id = %s AND user_id = %s",
                    (blog_id, user_id)
                )
                existing = await cursor.fetchone()
                
                if existing:
                    await cursor.execute(
                        "DELETE FROM blog_saves WHERE blog_id = %s AND user_id = %s",
                        (blog_id, user_id)
                    )
                    await conn.commit()
                    return {"saved": False, "message": "Blog unsaved"}
                else:
                    await cursor.execute(
                        "INSERT INTO blog_saves (blog_id, user_id, firebase_uid) VALUES (%s, %s, %s)",
                        (blog_id, user_id, firebase_uid)
                    )
                    await conn.commit()
                    return {"saved": True, "message": "Blog saved"}
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            user_id = user['id']
            
            cursor.execute(
                "SELECT id FROM blog_saves WHERE blog_id = ? AND user_id = ?",
                (blog_id, user_id)
            )
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute(
                    "DELETE FROM blog_saves WHERE blog_id = ? AND user_id = ?",
                    (blog_id, user_id)
                )
                conn.commit()
                return {"saved": False, "message": "Blog unsaved"}
            else:
                cursor.execute(
                    "INSERT INTO blog_saves (blog_id, user_id, firebase_uid) VALUES (?, ?, ?)",
                    (blog_id, user_id, firebase_uid)
                )
                conn.commit()
                return {"saved": True, "message": "Blog saved"}

@app.get("/api/blogs/{blog_id}/user-save-status")
async def get_save_status(blog_id: int, user_data: dict = Depends(verify_token)):
    """Check if user has saved a blog"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = %s", (firebase_uid,))
                user = await cursor.fetchone()
                if not user:
                    return {"saved": False}
                
                await cursor.execute(
                    "SELECT id FROM blog_saves WHERE blog_id = %s AND user_id = %s",
                    (blog_id, user['id'])
                )
                saved = await cursor.fetchone() is not None
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            if not user:
                return {"saved": False}
            
            cursor.execute(
                "SELECT id FROM blog_saves WHERE blog_id = ? AND user_id = ?",
                (blog_id, user['id'])
            )
            saved = cursor.fetchone() is not None
    
    return {"saved": saved}

@app.get("/api/user/saved-blogs")
async def get_user_saved_blogs(user_data: dict = Depends(verify_token)):
    """Get all blogs saved by user"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT b.* FROM blogs b
                    INNER JOIN blog_saves bs ON b.id = bs.blog_id
                    INNER JOIN user_profiles u ON bs.user_id = u.id
                    WHERE u.firebase_uid = %s AND b.status = 'published'
                    ORDER BY bs.created_at DESC
                """, (firebase_uid,))
                blogs = await cursor.fetchall()
                
                for blog in blogs:
                    if blog.get('tags'):
                        blog['tags'] = json.loads(blog['tags']) if isinstance(blog['tags'], str) else blog['tags']
                    else:
                        blog['tags'] = []
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT b.* FROM blogs b
                INNER JOIN blog_saves bs ON b.id = bs.blog_id
                INNER JOIN user_profiles u ON bs.user_id = u.id
                WHERE u.firebase_uid = ? AND b.status = 'published'
                ORDER BY bs.created_at DESC
            """, (firebase_uid,))
            blogs = [dict(row) for row in cursor.fetchall()]
            
            for blog in blogs:
                blog['tags'] = json.loads(blog['tags']) if blog.get('tags') else []
    
    return {"blogs": blogs}

# =====================================================
# BLOG INTERACTIONS - COMMENTS
# =====================================================

@app.post("/api/blogs/{blog_id}/comments")
async def create_comment(blog_id: int, comment: CommentCreate, user_data: dict = Depends(verify_token)):
    """Create a comment on a blog"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = %s", (firebase_uid,))
                user = await cursor.fetchone()
                if not user:
                    raise HTTPException(status_code=404, detail="User not found")
                user_id = user['id']
                
                await cursor.execute("""
                    INSERT INTO blog_comments (blog_id, user_id, firebase_uid, parent_comment_id, comment_text)
                    VALUES (%s, %s, %s, %s, %s)
                """, (blog_id, user_id, firebase_uid, comment.parent_comment_id, comment.comment_text))
                await conn.commit()
                comment_id = cursor.lastrowid
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM user_profiles WHERE firebase_uid = ?", (firebase_uid,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            user_id = user['id']
            
            cursor.execute("""
                INSERT INTO blog_comments (blog_id, user_id, firebase_uid, parent_comment_id, comment_text)
                VALUES (?, ?, ?, ?, ?)
            """, (blog_id, user_id, firebase_uid, comment.parent_comment_id, comment.comment_text))
            conn.commit()
            comment_id = cursor.lastrowid
    
    return {"id": comment_id, "message": "Comment created successfully"}

@app.get("/api/blogs/{blog_id}/comments")
async def get_blog_comments(blog_id: int):
    """Get all comments for a blog"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT 
                        c.id, c.blog_id, c.parent_comment_id, c.comment_text,
                        c.is_edited, c.is_deleted, c.created_at, c.updated_at,
                        u.display_name, u.email, u.photo_url
                    FROM blog_comments c
                    INNER JOIN user_profiles u ON c.user_id = u.id
                    WHERE c.blog_id = %s AND c.is_deleted = FALSE
                    ORDER BY c.created_at ASC
                """, (blog_id,))
                comments = await cursor.fetchall()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    c.id, c.blog_id, c.parent_comment_id, c.comment_text,
                    c.is_edited, c.is_deleted, c.created_at, c.updated_at,
                    u.display_name, u.email, u.photo_url
                FROM blog_comments c
                INNER JOIN user_profiles u ON c.user_id = u.id
                WHERE c.blog_id = ? AND c.is_deleted = 0
                ORDER BY c.created_at ASC
            """, (blog_id,))
            comments = [dict(row) for row in cursor.fetchall()]
    
    return {"comments": comments}

@app.get("/api/user/comments")
async def get_user_comments(user_data: dict = Depends(verify_token)):
    """Get all comments by user"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    SELECT 
                        c.id, c.blog_id, c.comment_text, c.is_edited,
                        c.created_at, c.updated_at,
                        b.title as blog_title, b.excerpt as blog_excerpt
                    FROM blog_comments c
                    INNER JOIN user_profiles u ON c.user_id = u.id
                    INNER JOIN blogs b ON c.blog_id = b.id
                    WHERE u.firebase_uid = %s AND c.is_deleted = FALSE
                    ORDER BY c.created_at DESC
                """, (firebase_uid,))
                comments = await cursor.fetchall()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    c.id, c.blog_id, c.comment_text, c.is_edited,
                    c.created_at, c.updated_at,
                    b.title as blog_title, b.excerpt as blog_excerpt
                FROM blog_comments c
                INNER JOIN user_profiles u ON c.user_id = u.id
                INNER JOIN blogs b ON c.blog_id = b.id
                WHERE u.firebase_uid = ? AND c.is_deleted = 0
                ORDER BY c.created_at DESC
            """, (firebase_uid,))
            comments = [dict(row) for row in cursor.fetchall()]
    
    return {"comments": comments}

@app.put("/api/comments/{comment_id}")
async def update_comment(comment_id: int, comment: CommentUpdate, user_data: dict = Depends(verify_token)):
    """Update a comment"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Verify comment ownership
                await cursor.execute(
                    "SELECT id FROM blog_comments WHERE id = %s AND firebase_uid = %s",
                    (comment_id, firebase_uid)
                )
                if not await cursor.fetchone():
                    raise HTTPException(status_code=403, detail="Not authorized to update this comment")
                
                await cursor.execute("""
                    UPDATE blog_comments 
                    SET comment_text = %s, is_edited = TRUE, updated_at = NOW()
                    WHERE id = %s
                """, (comment.comment_text, comment_id))
                await conn.commit()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM blog_comments WHERE id = ? AND firebase_uid = ?",
                (comment_id, firebase_uid)
            )
            if not cursor.fetchone():
                raise HTTPException(status_code=403, detail="Not authorized to update this comment")
            
            cursor.execute("""
                UPDATE blog_comments 
                SET comment_text = ?, is_edited = 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (comment.comment_text, comment_id))
            conn.commit()
    
    return {"message": "Comment updated successfully"}

@app.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: int, user_data: dict = Depends(verify_token)):
    """Delete a comment (soft delete)"""
    firebase_uid = user_data.get('firebase_uid')
    
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT id FROM blog_comments WHERE id = %s AND firebase_uid = %s",
                    (comment_id, firebase_uid)
                )
                if not await cursor.fetchone():
                    raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
                
                await cursor.execute(
                    "UPDATE blog_comments SET is_deleted = TRUE WHERE id = %s",
                    (comment_id,)
                )
                await conn.commit()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id FROM blog_comments WHERE id = ? AND firebase_uid = ?",
                (comment_id, firebase_uid)
            )
            if not cursor.fetchone():
                raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
            
            cursor.execute(
                "UPDATE blog_comments SET is_deleted = 1 WHERE id = ?",
                (comment_id,)
            )
            conn.commit()
    
    return {"message": "Comment deleted successfully"}

# =====================================================
# CONTACT INFO ROUTES
# =====================================================

@app.get("/api/contact-info")
async def get_contact_info():
    """Get visible contact information"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT * FROM contact_info WHERE is_visible = TRUE ORDER BY display_order ASC"
                )
                contacts = await cursor.fetchall()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM contact_info WHERE is_visible = 1 ORDER BY display_order ASC"
            )
            contacts = [dict(row) for row in cursor.fetchall()]
    
    return contacts

@app.get("/api/admin/contact-info")
async def get_all_contact_info(user_data: dict = Depends(verify_admin)):
    """Get all contact information (Admin only)"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT * FROM contact_info ORDER BY display_order ASC")
                contacts = await cursor.fetchall()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM contact_info ORDER BY display_order ASC")
            contacts = [dict(row) for row in cursor.fetchall()]
    
    return contacts

@app.post("/api/contact-info")
async def create_contact_info(contact: ContactInfoCreate, user_data: dict = Depends(verify_admin)):
    """Create contact information (Admin only)"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("""
                    INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (contact.label, contact.value, contact.contact_type, contact.icon, contact.is_visible, contact.display_order))
                await conn.commit()
                contact_id = cursor.lastrowid
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (contact.label, contact.value, contact.contact_type, contact.icon, contact.is_visible, contact.display_order))
            conn.commit()
            contact_id = cursor.lastrowid
    
    return {"id": contact_id, "message": "Contact info created successfully"}

@app.put("/api/contact-info/{contact_id}")
async def update_contact_info(contact_id: int, contact: ContactInfoUpdate, user_data: dict = Depends(verify_admin)):
    """Update contact information (Admin only)"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT id FROM contact_info WHERE id = %s", (contact_id,))
                if not await cursor.fetchone():
                    raise HTTPException(status_code=404, detail="Contact info not found")
                
                updates = []
                params = []
                
                for field, value in contact.dict(exclude_unset=True).items():
                    updates.append(f"{field} = %s")
                    params.append(value)
                
                if updates:
                    params.append(contact_id)
                    query = f"UPDATE contact_info SET {', '.join(updates)} WHERE id = %s"
                    await cursor.execute(query, params)
                    await conn.commit()
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM contact_info WHERE id = ?", (contact_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Contact info not found")
            
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
async def delete_contact_info(contact_id: int, user_data: dict = Depends(verify_admin)):
    """Delete contact information (Admin only)"""
    if USE_MYSQL:
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM contact_info WHERE id = %s", (contact_id,))
                await conn.commit()
                if cursor.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Contact info not found")
    else:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM contact_info WHERE id = ?", (contact_id,))
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Contact info not found")
    
    return {"message": "Contact info deleted successfully"}

# =====================================================
# SIMPLE ADMIN LOGIN (Fallback for SQLite dev)
# =====================================================

@app.post("/api/admin/login")
async def admin_login(email: str, password: str = "admin123"):
    """Simple admin login for local development"""
    if email in AUTHORIZED_ADMIN_EMAILS:
        token = create_jwt_token(email, "local-admin-uid", is_admin=True)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {"email": email, "name": email.split('@')[0]}
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# =====================================================
# STARTUP/SHUTDOWN EVENTS
# =====================================================

@app.on_event("startup")
async def startup_event():
    if USE_MYSQL:
        await init_mysql_pool()
        logger.info("🚀 Portfolio API started with MySQL!")
    else:
        init_sqlite_database()
        logger.info("🚀 Portfolio API started with SQLite!")
    
    logger.info("📍 Access admin panel at: http://localhost:3000/julian_portfolio")

@app.on_event("shutdown")
async def shutdown_event():
    if USE_MYSQL and db_pool:
        db_pool.close()
        await db_pool.wait_closed()
        logger.info("✅ MySQL connection pool closed")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Julian D'Rozario Portfolio API...")
    print(f"📍 Database: {'MySQL' if USE_MYSQL else 'SQLite'}")
    print("📍 Frontend: http://localhost:3000")
    print("📍 Backend API: http://localhost:8001")
    print("📍 API Docs: http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)
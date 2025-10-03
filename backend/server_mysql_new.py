"""
Julian D'Rozario Portfolio Backend - MySQL Production Version
Complete rewrite with MySQL database on Hostinger
No Firebase dependencies - Production ready
"""

from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import aiomysql
import json
from collections import defaultdict
import time
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MySQL Configuration
MYSQL_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'port': int(os.environ.get('MYSQL_PORT', 3306)),
    'user': os.environ.get('MYSQL_USER'),
    'password': os.environ.get('MYSQL_PASSWORD'),
    'db': os.environ.get('MYSQL_DATABASE'),
    'charset': 'utf8mb4',
    'autocommit': True
}

# Global connection pool
db_pool = None

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'julian-drozario-admin-panel-super-secret-jwt-key-2025')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_HOURS = int(os.environ.get('ACCESS_TOKEN_EXPIRE_HOURS', 24))

# Authorized admin emails (whitelist)
AUTHORIZED_ADMIN_EMAILS = os.environ.get(
    'AUTHORIZED_ADMIN_EMAILS',
    'juliandrozario@gmail.com,abirsabirhossain@gmail.com'
).split(',')

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

# Memory-based rate limiting
rate_limit_store = defaultdict(list)
RATE_LIMIT_PER_MINUTE = int(os.environ.get('RATE_LIMIT_PER_MINUTE', 60))


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class TokenResponse(BaseModel):
    access_token: str
    username: str
    is_admin: bool

class GoogleTokenRequest(BaseModel):
    google_token: str

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Blog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str
    category: str
    author: str = "Julian D'Rozario"
    read_time: int = 5
    featured: bool = False
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    views: int = 0
    likes: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BlogCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    read_time: int = 5
    featured: bool = False
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None

class BlogUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    read_time: Optional[int] = None
    featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None

class ContactInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str
    value: str
    contact_type: str
    icon: Optional[str] = None
    display_order: int = 0
    is_visible: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContactInfoCreate(BaseModel):
    label: str
    value: str
    contact_type: str
    icon: Optional[str] = None
    display_order: int = 0

class ContactInfoUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    contact_type: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None

class BlogComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    blog_id: str
    user_id: str
    user_name: str
    user_email: str
    comment_text: str
    likes: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class BlogCommentCreate(BaseModel):
    blog_id: str
    comment_text: str

class BlogLike(BaseModel):
    blog_id: str
    user_id: str
    user_email: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# DATABASE CONNECTION POOL
# ============================================================================

async def init_db_pool():
    """Initialize MySQL connection pool"""
    global db_pool
    try:
        db_pool = await aiomysql.create_pool(
            **MYSQL_CONFIG,
            minsize=5,
            maxsize=20,
            echo=False
        )
        logger.info("✅ MySQL connection pool initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize MySQL pool: {str(e)}")
        raise

async def close_db_pool():
    """Close MySQL connection pool"""
    global db_pool
    if db_pool:
        db_pool.close()
        await db_pool.wait_closed()
        logger.info("MySQL connection pool closed")


# ============================================================================
# DATABASE HELPER FUNCTIONS
# ============================================================================

async def execute_query(query: str, params: tuple = None, fetch_one: bool = False, fetch_all: bool = False):
    """Execute a query and return results"""
    async with db_pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute(query, params or ())
            
            if fetch_one:
                return await cursor.fetchone()
            elif fetch_all:
                return await cursor.fetchall()
            else:
                await conn.commit()
                return cursor.lastrowid

async def get_blogs_from_db(category: Optional[str] = None, limit: int = 100):
    """Get blogs from MySQL database"""
    query = """
        SELECT id, title, excerpt, content, category, author, read_time, 
               featured, tags, image_url, views, likes, is_published,
               created_at, updated_at
        FROM blogs 
        WHERE is_published = TRUE
    """
    params = []
    
    if category and category.lower() != 'all':
        query += " AND category = %s"
        params.append(category)
    
    query += " ORDER BY created_at DESC LIMIT %s"
    params.append(limit)
    
    results = await execute_query(query, tuple(params), fetch_all=True)
    
    # Parse JSON tags
    for blog in results:
        if blog.get('tags'):
            try:
                blog['tags'] = json.loads(blog['tags']) if isinstance(blog['tags'], str) else blog['tags']
            except:
                blog['tags'] = []
        else:
            blog['tags'] = []
    
    return results

async def get_blog_by_id(blog_id: str):
    """Get single blog by ID"""
    query = """
        SELECT id, title, excerpt, content, category, author, read_time,
               featured, tags, image_url, views, likes, is_published,
               created_at, updated_at
        FROM blogs 
        WHERE id = %s
    """
    result = await execute_query(query, (blog_id,), fetch_one=True)
    
    if result and result.get('tags'):
        try:
            result['tags'] = json.loads(result['tags']) if isinstance(result['tags'], str) else result['tags']
        except:
            result['tags'] = []
    
    return result

async def increment_blog_views(blog_id: str):
    """Increment blog view count"""
    query = "UPDATE blogs SET views = views + 1 WHERE id = %s"
    await execute_query(query, (blog_id,))

async def get_categories_from_db():
    """Get all categories"""
    query = """
        SELECT id, name, slug, description, display_order, is_active, created_at, updated_at
        FROM categories 
        WHERE is_active = TRUE
        ORDER BY display_order ASC
    """
    return await execute_query(query, fetch_all=True)

async def get_contact_info_from_db():
    """Get all contact information"""
    query = """
        SELECT id, label, value, contact_type, icon, display_order, is_visible, created_at, updated_at
        FROM contact_info
        WHERE is_visible = TRUE
        ORDER BY display_order ASC
    """
    return await execute_query(query, fetch_all=True)


# ============================================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================================

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return email"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise HTTPException(status_code=403, detail="Invalid authentication credentials")
        
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=403, detail="Invalid token")

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify admin user"""
    email = verify_token(credentials)
    
    if email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return email

async def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token"""
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Token is valid
        return {
            'email': idinfo.get('email'),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'uid': idinfo.get('sub')
        }
    except Exception as e:
        logger.error(f"Google token verification failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")


# ============================================================================
# RATE LIMITING MIDDLEWARE
# ============================================================================

async def rate_limit_check(request: Request):
    """Memory-based rate limiting"""
    client_ip = request.client.host
    current_time = time.time()
    
    # Clean old entries
    rate_limit_store[client_ip] = [
        timestamp for timestamp in rate_limit_store[client_ip]
        if current_time - timestamp < 60
    ]
    
    # Check rate limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_PER_MINUTE:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )
    
    # Add current request
    rate_limit_store[client_ip].append(current_time)


# ============================================================================
# FASTAPI APPLICATION SETUP
# ============================================================================

app = FastAPI(title="Julian D'Rozario Portfolio API - MySQL Production")
api_router = APIRouter(prefix="/api")

# CORS Configuration
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database pool on startup"""
    await init_db_pool()
    logger.info("🚀 Application started - MySQL Production Mode")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database pool on shutdown"""
    await close_db_pool()
    logger.info("Application shutdown")


# ============================================================================
# API ENDPOINTS
# ============================================================================

@api_router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Julian Portfolio API - MySQL Production",
        "status": "active",
        "database": "MySQL (Hostinger)",
        "version": "2.0"
    }

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/google-login", response_model=TokenResponse)
async def google_login(token_request: GoogleTokenRequest):
    """
    Google OAuth login - Verifies Google token and checks email whitelist
    """
    try:
        # Verify Google token
        user_info = await verify_google_token(token_request.google_token)
        
        user_email = user_info.get('email')
        user_name = user_info.get('name', 'Unknown User')
        user_uid = user_info.get('uid')
        
        # Check if user is in admin whitelist
        is_admin = user_email in AUTHORIZED_ADMIN_EMAILS
        
        if not is_admin:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Only authorized admin emails can access the admin panel."
            )
        
        # Update/create admin user record in database
        async with db_pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Check if admin exists
                await cursor.execute(
                    "SELECT id FROM admin_users WHERE email = %s",
                    (user_email,)
                )
                existing_admin = await cursor.fetchone()
                
                if existing_admin:
                    # Update last login
                    await cursor.execute(
                        "UPDATE admin_users SET last_login = NOW() WHERE email = %s",
                        (user_email,)
                    )
                else:
                    # Create new admin record
                    admin_id = str(uuid.uuid4())
                    await cursor.execute(
                        """INSERT INTO admin_users (id, email, name, google_id)
                           VALUES (%s, %s, %s, %s)""",
                        (admin_id, user_email, user_name, user_uid)
                    )
                
                await conn.commit()
        
        # Create JWT token
        access_token = create_access_token(data={
            "sub": user_email,
            "uid": user_uid,
            "is_admin": is_admin
        })
        
        return TokenResponse(
            access_token=access_token,
            username=user_name,
            is_admin=is_admin
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@api_router.get("/auth/verify")
async def verify_user_token(current_user_email: str = Depends(verify_token)):
    """Verify JWT token and return user info"""
    try:
        # Get admin info from database
        query = "SELECT name, email FROM admin_users WHERE email = %s"
        admin = await execute_query(query, (current_user_email,), fetch_one=True)
        
        is_admin = current_user_email in AUTHORIZED_ADMIN_EMAILS
        
        return {
            "username": admin['name'] if admin else current_user_email,
            "email": current_user_email,
            "is_admin": is_admin
        }
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=400, detail="Token verification failed")


# ============================================================================
# BLOG ENDPOINTS
# ============================================================================

@api_router.get("/blogs")
async def get_blogs(category: Optional[str] = None):
    """Get all published blogs, optionally filtered by category"""
    try:
        blogs = await get_blogs_from_db(category)
        return blogs
    except Exception as e:
        logger.error(f"Error fetching blogs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch blogs")

@api_router.get("/blogs/{blog_id}")
async def get_blog(blog_id: str):
    """Get single blog by ID and increment view count"""
    try:
        blog = await get_blog_by_id(blog_id)
        
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Increment view count
        await increment_blog_views(blog_id)
        
        return blog
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog")

@api_router.post("/blogs", dependencies=[Depends(rate_limit_check)])
async def create_blog(blog: BlogCreate, admin_email: str = Depends(verify_admin)):
    """Create new blog post (admin only)"""
    try:
        blog_id = str(uuid.uuid4())
        tags_json = json.dumps(blog.tags)
        
        query = """
            INSERT INTO blogs 
            (id, title, excerpt, content, category, read_time, featured, tags, image_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        await execute_query(query, (
            blog_id, blog.title, blog.excerpt, blog.content, blog.category,
            blog.read_time, blog.featured, tags_json, blog.image_url
        ))
        
        # Return the created blog
        created_blog = await get_blog_by_id(blog_id)
        return created_blog
        
    except Exception as e:
        logger.error(f"Error creating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create blog")

@api_router.put("/blogs/{blog_id}")
async def update_blog(
    blog_id: str,
    blog_update: BlogUpdate,
    admin_email: str = Depends(verify_admin)
):
    """Update existing blog post (admin only)"""
    try:
        # Check if blog exists
        existing_blog = await get_blog_by_id(blog_id)
        if not existing_blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Build dynamic update query
        update_fields = []
        params = []
        
        if blog_update.title is not None:
            update_fields.append("title = %s")
            params.append(blog_update.title)
        if blog_update.excerpt is not None:
            update_fields.append("excerpt = %s")
            params.append(blog_update.excerpt)
        if blog_update.content is not None:
            update_fields.append("content = %s")
            params.append(blog_update.content)
        if blog_update.category is not None:
            update_fields.append("category = %s")
            params.append(blog_update.category)
        if blog_update.read_time is not None:
            update_fields.append("read_time = %s")
            params.append(blog_update.read_time)
        if blog_update.featured is not None:
            update_fields.append("featured = %s")
            params.append(blog_update.featured)
        if blog_update.tags is not None:
            update_fields.append("tags = %s")
            params.append(json.dumps(blog_update.tags))
        if blog_update.image_url is not None:
            update_fields.append("image_url = %s")
            params.append(blog_update.image_url)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # Add updated_at
        update_fields.append("updated_at = NOW()")
        params.append(blog_id)
        
        query = f"UPDATE blogs SET {', '.join(update_fields)} WHERE id = %s"
        await execute_query(query, tuple(params))
        
        # Return updated blog
        updated_blog = await get_blog_by_id(blog_id)
        return updated_blog
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update blog")

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, admin_email: str = Depends(verify_admin)):
    """Delete blog post (admin only)"""
    try:
        # Check if blog exists
        existing_blog = await get_blog_by_id(blog_id)
        if not existing_blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Delete blog
        query = "DELETE FROM blogs WHERE id = %s"
        await execute_query(query, (blog_id,))
        
        return {"message": "Blog deleted successfully", "id": blog_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete blog")


# ============================================================================
# CATEGORY ENDPOINTS
# ============================================================================

@api_router.get("/categories")
async def get_categories():
    """Get all active categories"""
    try:
        categories = await get_categories_from_db()
        return categories
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories")


# ============================================================================
# CONTACT INFO ENDPOINTS
# ============================================================================

@api_router.get("/contact-info")
async def get_contact_info():
    """Get all visible contact information"""
    try:
        contacts = await get_contact_info_from_db()
        return contacts
    except Exception as e:
        logger.error(f"Error fetching contact info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contact info")

@api_router.post("/contact-info")
async def create_contact_info(
    contact: ContactInfoCreate,
    admin_email: str = Depends(verify_admin)
):
    """Create new contact info entry (admin only)"""
    try:
        contact_id = str(uuid.uuid4())
        
        query = """
            INSERT INTO contact_info 
            (id, label, value, contact_type, icon, display_order)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        await execute_query(query, (
            contact_id, contact.label, contact.value, contact.contact_type,
            contact.icon, contact.display_order
        ))
        
        # Return created contact
        result_query = "SELECT * FROM contact_info WHERE id = %s"
        created_contact = await execute_query(result_query, (contact_id,), fetch_one=True)
        return created_contact
        
    except Exception as e:
        logger.error(f"Error creating contact info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create contact info")

@api_router.put("/contact-info/{contact_id}")
async def update_contact_info(
    contact_id: str,
    contact_update: ContactInfoUpdate,
    admin_email: str = Depends(verify_admin)
):
    """Update contact info entry (admin only)"""
    try:
        # Build dynamic update query
        update_fields = []
        params = []
        
        if contact_update.label is not None:
            update_fields.append("label = %s")
            params.append(contact_update.label)
        if contact_update.value is not None:
            update_fields.append("value = %s")
            params.append(contact_update.value)
        if contact_update.contact_type is not None:
            update_fields.append("contact_type = %s")
            params.append(contact_update.contact_type)
        if contact_update.icon is not None:
            update_fields.append("icon = %s")
            params.append(contact_update.icon)
        if contact_update.display_order is not None:
            update_fields.append("display_order = %s")
            params.append(contact_update.display_order)
        if contact_update.is_visible is not None:
            update_fields.append("is_visible = %s")
            params.append(contact_update.is_visible)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_fields.append("updated_at = NOW()")
        params.append(contact_id)
        
        query = f"UPDATE contact_info SET {', '.join(update_fields)} WHERE id = %s"
        await execute_query(query, tuple(params))
        
        # Return updated contact
        result_query = "SELECT * FROM contact_info WHERE id = %s"
        updated_contact = await execute_query(result_query, (contact_id,), fetch_one=True)
        return updated_contact
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating contact info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update contact info")

@api_router.delete("/contact-info/{contact_id}")
async def delete_contact_info(contact_id: str, admin_email: str = Depends(verify_admin)):
    """Delete contact info entry (admin only)"""
    try:
        query = "DELETE FROM contact_info WHERE id = %s"
        await execute_query(query, (contact_id,))
        
        return {"message": "Contact info deleted successfully", "id": contact_id}
        
    except Exception as e:
        logger.error(f"Error deleting contact info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete contact info")


# ============================================================================
# BLOG INTERACTION ENDPOINTS (Comments & Likes)
# ============================================================================

@api_router.post("/blog/comment")
async def add_comment(
    comment: BlogCommentCreate,
    current_user_email: str = Depends(verify_token)
):
    """Add comment to blog post (authenticated users)"""
    try:
        # Get user info from admin_users table
        query = "SELECT name FROM admin_users WHERE email = %s"
        user = await execute_query(query, (current_user_email,), fetch_one=True)
        user_name = user['name'] if user else current_user_email
        
        comment_id = str(uuid.uuid4())
        
        insert_query = """
            INSERT INTO blog_comments 
            (id, blog_id, user_id, user_name, user_email, comment_text)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        
        await execute_query(insert_query, (
            comment_id, comment.blog_id, current_user_email,
            user_name, current_user_email, comment.comment_text
        ))
        
        return {"message": "Comment added successfully", "id": comment_id}
        
    except Exception as e:
        logger.error(f"Error adding comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add comment")

@api_router.get("/blog/{blog_id}/comments")
async def get_comments(blog_id: str):
    """Get all comments for a blog post"""
    try:
        query = """
            SELECT id, blog_id, user_id, user_name, user_email, comment_text, likes, timestamp
            FROM blog_comments
            WHERE blog_id = %s
            ORDER BY timestamp DESC
        """
        comments = await execute_query(query, (blog_id,), fetch_all=True)
        return comments
    except Exception as e:
        logger.error(f"Error fetching comments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch comments")

@api_router.post("/blog/like")
async def toggle_like(
    like_data: BlogLike,
    current_user_email: str = Depends(verify_token)
):
    """Toggle like on blog post (authenticated users)"""
    try:
        # Check if like exists
        check_query = """
            SELECT id FROM blog_likes 
            WHERE blog_id = %s AND user_id = %s
        """
        existing_like = await execute_query(
            check_query, 
            (like_data.blog_id, current_user_email),
            fetch_one=True
        )
        
        if existing_like:
            # Unlike - remove like and decrement count
            delete_query = "DELETE FROM blog_likes WHERE blog_id = %s AND user_id = %s"
            await execute_query(delete_query, (like_data.blog_id, current_user_email))
            
            update_query = "UPDATE blogs SET likes = likes - 1 WHERE id = %s AND likes > 0"
            await execute_query(update_query, (like_data.blog_id,))
            
            return {"message": "Blog unliked", "liked": False}
        else:
            # Like - add like and increment count
            like_id = str(uuid.uuid4())
            insert_query = """
                INSERT INTO blog_likes (id, blog_id, user_id, user_email)
                VALUES (%s, %s, %s, %s)
            """
            await execute_query(insert_query, (
                like_id, like_data.blog_id, current_user_email, current_user_email
            ))
            
            update_query = "UPDATE blogs SET likes = likes + 1 WHERE id = %s"
            await execute_query(update_query, (like_data.blog_id,))
            
            return {"message": "Blog liked", "liked": True}
        
    except Exception as e:
        logger.error(f"Error toggling like: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to toggle like")

@api_router.get("/blog/{blog_id}/likes")
async def get_likes(blog_id: str):
    """Get all likes for a blog post"""
    try:
        query = """
            SELECT id, blog_id, user_id, user_email, timestamp
            FROM blog_likes
            WHERE blog_id = %s
        """
        likes = await execute_query(query, (blog_id,), fetch_all=True)
        return likes
    except Exception as e:
        logger.error(f"Error fetching likes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch likes")


# ============================================================================
# FILE UPLOAD ENDPOINT
# ============================================================================

@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    admin_email: str = Depends(verify_admin)
):
    """Upload file (admin only) - placeholder for future implementation"""
    try:
        # For now, return a mock response
        # In production, implement actual file storage (S3, local, etc.)
        return {
            "message": "File upload endpoint - implement storage solution",
            "filename": file.filename,
            "content_type": file.content_type
        }
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


# ============================================================================
# MOUNT ROUTER AND RUN
# ============================================================================

# Mount the API router with /api prefix
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

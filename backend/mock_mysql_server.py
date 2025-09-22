#!/usr/bin/env python3
"""
Mock MySQL Backend Server for Julian Portfolio
This provides the same API as the MySQL server but uses in-memory storage
Use this while setting up the real MySQL database
"""

import os
import json
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path
import copy

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
    title="Julian Portfolio Admin API (Mock MySQL)",
    description="Mock MySQL backend for Julian D'Rozario's portfolio admin panel",
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

# In-memory storage (mock database)
mock_data = {
    "blogs": [
        {
            "id": 1,
            "title": "Free Zone vs Mainland: Complete Guide to Dubai Business Setup",
            "excerpt": "Understanding the key differences between Free Zone and Mainland company formation in Dubai and which option suits your business needs.",
            "content": """Choosing between Free Zone and Mainland company formation is one of the most critical decisions when setting up a business in Dubai. This comprehensive guide will walk you through the key differences, advantages, and considerations for each option.

## Free Zone Company Formation

Free Zones in Dubai offer numerous advantages for international businesses:

### Benefits:
- 100% foreign ownership allowed
- No personal income tax
- No corporate tax for most business activities
- Simplified setup process
- Modern infrastructure and facilities

### Limitations:
- Limited to trading within the free zone or export
- Cannot directly trade in the UAE mainland market
- Office space must be within the free zone

## Mainland Company Formation

Mainland companies offer greater flexibility for local market access:

### Benefits:
- Can trade anywhere in the UAE
- Access to government contracts
- No restrictions on business location
- Can have local sponsors for 100% ownership in certain sectors

### Considerations:
- May require local sponsor or service agent
- More complex regulatory requirements
- Higher setup costs in some cases

## Making the Right Choice

The decision between Free Zone and Mainland depends on your business model, target market, and long-term goals. Consider these factors:

1. **Target Market**: If you plan to serve the local UAE market, Mainland might be better
2. **Business Type**: Some activities are restricted to certain zones
3. **Ownership Structure**: Your preference for ownership control
4. **Budget**: Initial setup and ongoing costs

For personalized advice on which option suits your specific business needs, feel free to reach out for a consultation.""",
            "date": "2024-01-15",
            "read_time": "8 min read",
            "category": "Company Formation",
            "author": "Julian D'Rozario",
            "image_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
            "featured": True,
            "tags": ["Dubai Business", "Free Zone", "Mainland", "Company Formation"],
            "views": 2847,
            "likes": 89,
            "created_at": "2024-01-15T10:00:00",
            "updated_at": "2024-01-15T10:00:00"
        },
        {
            "id": 2,
            "title": "UAE Visa Types for Business Owners: Complete Guide 2024",
            "excerpt": "Navigate the UAE visa landscape with this comprehensive guide covering investor visas, employment visas, and residency requirements.",
            "content": """Understanding UAE visa requirements is crucial for business owners and investors looking to establish their presence in the Emirates. This guide covers the most relevant visa types for entrepreneurs and business professionals.

## Investor Visa

The UAE Investor Visa is ideal for business owners who want to invest in the country:

### Requirements:
- Minimum investment of AED 500,000 in a property or business
- Valid for 2-3 years (renewable)
- Allows family sponsorship

### Benefits:
- No sponsor required
- Can live and work in the UAE
- Path to long-term residency

## Employment Visa

For business owners who are employed by their own company:

### Process:
1. Company obtains work permit
2. Employee applies for employment visa
3. Medical tests and Emirates ID
4. Residence visa issuance

### Duration:
- Typically 2-3 years
- Renewable based on employment status

## Golden Visa

The UAE Golden Visa offers long-term residency for qualified investors:

### Categories:
- Real estate investors (minimum AED 2 million)
- Business investors with significant economic contribution
- Entrepreneurs with promising startups

### Benefits:
- 5-10 year renewable visa
- Family inclusion
- No sponsor requirement

## Application Process

1. **Document Preparation**: Gather required documents
2. **Initial Application**: Submit through approved channels
3. **Medical Examination**: Complete required health checks
4. **Approval and Collection**: Receive visa and Emirates ID

## Key Considerations

- Processing times vary by visa type
- Medical insurance is mandatory
- Some visas require continuous residence
- Regular renewal procedures apply

For assistance with your specific visa requirements and application process, professional guidance can help ensure a smooth experience.""",
            "date": "2024-01-10",
            "read_time": "7 min read",
            "category": "Immigration",
            "author": "Julian D'Rozario",
            "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
            "featured": False,
            "tags": ["UAE Visa", "Business Immigration", "Residency", "Dubai"],
            "views": 1923,
            "likes": 67,
            "created_at": "2024-01-10T14:30:00",
            "updated_at": "2024-01-10T14:30:00"
        }
    ],
    "contact_info": {
        "email": "julian@drozario.blog",
        "phone": "+971 55 386 8045",
        "linkedin": "https://www.linkedin.com/in/julian-d-rozario?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        "availability": "Available for consultation"
    },
    "categories": [
        {"id": 1, "name": "Company Formation", "count": 2},
        {"id": 2, "name": "Immigration", "count": 1},
        {"id": 3, "name": "Technology", "count": 0},
        {"id": 4, "name": "Operations", "count": 0},
        {"id": 5, "name": "Business Development", "count": 0},
        {"id": 6, "name": "Compliance", "count": 0},
        {"id": 7, "name": "M&A", "count": 0},
        {"id": 8, "name": "Finance", "count": 0},
        {"id": 9, "name": "Digital Transformation", "count": 0},
        {"id": 10, "name": "Leadership", "count": 0},
        {"id": 11, "name": "Customer Experience", "count": 0},
        {"id": 12, "name": "Licensing", "count": 0}
    ],
    "admin_users": [
        {
            "id": 1,
            "username": "admin",
            "password_hash": "$2b$12$Addp/JyaVEZSCcII.ODKj.w0rGrDoLWFUpkqmJO.Z.US3w1joXReW",  # admin123
            "email": "admin@drozario.blog",
            "last_login": None
        }
    ]
}

# Auto-increment counters
counters = {
    "blogs": 3,  # Next ID will be 3
    "categories": 13,
    "admin_users": 2
}

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
    return {"message": "Julian Portfolio Admin API (Mock MySQL)", "version": "1.0.0", "database": "Mock MySQL"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "mock_connected", "timestamp": datetime.utcnow()}

# Authentication endpoints
@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin):
    # Find admin user
    admin_user = None
    for user in mock_data["admin_users"]:
        if user["username"] == login_data.username:
            admin_user = user
            break
    
    if not admin_user or not verify_password(login_data.password, admin_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Update last login
    admin_user["last_login"] = datetime.utcnow().isoformat()
    
    # Create access token
    access_token = create_access_token(data={"sub": login_data.username})
    
    return {"access_token": access_token, "token_type": "bearer", "username": login_data.username}

@app.get("/api/admin/verify")
async def verify_admin_token(current_user: str = Depends(verify_token)):
    return {"valid": True, "username": current_user}

# Blog endpoints
@app.get("/api/blogs")
async def get_blogs():
    return sorted(mock_data["blogs"], key=lambda x: x["created_at"], reverse=True)

@app.get("/api/blogs/{blog_id}")
async def get_blog(blog_id: int):
    blog = None
    for b in mock_data["blogs"]:
        if b["id"] == blog_id:
            blog = b
            break
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Increment views
    blog["views"] += 1
    
    return blog

@app.post("/api/blogs")
async def create_blog(blog: BlogCreate, current_user: str = Depends(verify_token)):
    new_blog = {
        "id": counters["blogs"],
        "title": blog.title,
        "excerpt": blog.excerpt,
        "content": blog.content,
        "date": datetime.now().date().isoformat(),
        "read_time": blog.read_time,
        "category": blog.category,
        "author": "Julian D'Rozario",
        "image_url": blog.image_url,
        "featured": blog.featured,
        "tags": blog.tags,
        "views": 0,
        "likes": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    mock_data["blogs"].append(new_blog)
    counters["blogs"] += 1
    
    return {"id": new_blog["id"], "message": "Blog created successfully"}

@app.put("/api/blogs/{blog_id}")
async def update_blog(blog_id: int, blog: BlogUpdate, current_user: str = Depends(verify_token)):
    # Find blog
    blog_to_update = None
    for i, b in enumerate(mock_data["blogs"]):
        if b["id"] == blog_id:
            blog_to_update = b
            break
    
    if not blog_to_update:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Update fields
    update_data = blog.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            blog_to_update[key] = value
    
    blog_to_update["updated_at"] = datetime.utcnow().isoformat()
    
    return {"message": "Blog updated successfully"}

@app.delete("/api/blogs/{blog_id}")
async def delete_blog(blog_id: int, current_user: str = Depends(verify_token)):
    # Find and remove blog
    blog_index = None
    for i, b in enumerate(mock_data["blogs"]):
        if b["id"] == blog_id:
            blog_index = i
            break
    
    if blog_index is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    # Remove blog
    deleted_blog = mock_data["blogs"].pop(blog_index)
    
    # Delete associated image file if exists
    if deleted_blog.get("image_url") and deleted_blog["image_url"].startswith('/uploads/'):
        file_path = UPLOAD_FOLDER / deleted_blog["image_url"].replace('/uploads/', '')
        if file_path.exists():
            file_path.unlink()
    
    return {"message": "Blog deleted successfully"}

# Contact endpoints
@app.get("/api/contact")
async def get_contact_info():
    return mock_data["contact_info"]

@app.put("/api/contact")
async def update_contact_info(contact: ContactUpdate, current_user: str = Depends(verify_token)):
    update_data = contact.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            mock_data["contact_info"][key] = str(value) if key == "email" else value
    
    return {"message": "Contact information updated successfully"}

# Categories endpoints
@app.get("/api/categories")
async def get_categories():
    return mock_data["categories"]

@app.post("/api/categories")
async def create_category(category: CategoryCreate, current_user: str = Depends(verify_token)):
    # Check if category already exists
    for cat in mock_data["categories"]:
        if cat["name"].lower() == category.name.lower():
            raise HTTPException(status_code=400, detail="Category already exists")
    
    new_category = {
        "id": counters["categories"],
        "name": category.name,
        "count": 0
    }
    
    mock_data["categories"].append(new_category)
    counters["categories"] += 1
    
    return {"id": new_category["id"], "message": "Category created successfully"}

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
    total_blogs = len(mock_data["blogs"])
    featured_blogs = len([b for b in mock_data["blogs"] if b["featured"]])
    total_views = sum(b["views"] for b in mock_data["blogs"])
    total_likes = sum(b["likes"] for b in mock_data["blogs"])
    categories = len([c for c in mock_data["categories"] if c["name"] != "All"])
    
    return {
        "total_blogs": total_blogs,
        "featured_blogs": featured_blogs,
        "total_views": total_views,
        "total_likes": total_likes,
        "categories": categories
    }

if __name__ == "__main__":
    print("🚀 Starting Julian Portfolio Mock MySQL Server...")
    print("📊 Using in-memory storage (mock database)")
    print("🔑 Admin Login: username=admin, password=admin123")
    print("🌐 Admin Panel: http://localhost:3000/julian_portfolio")
    print("📖 API Docs: http://localhost:8001/docs")
    uvicorn.run("mock_mysql_server:app", host="0.0.0.0", port=8001, reload=True)
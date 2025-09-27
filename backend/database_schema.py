#!/usr/bin/env python3
"""
Enhanced Database Schema for Julian D'Rozario CMS System
Includes all models for complete blog management and Worked With sections
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# =============================================================================
# ENHANCED BLOG MODELS
# =============================================================================

class Tag(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = "#7c3aed"  # Default purple
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TagCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#7c3aed"

class TagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: Optional[str] = None
    color: Optional[str] = "#7c3aed"
    icon: Optional[str] = None  # Font Awesome icon or emoji
    parent_id: Optional[str] = None  # For nested categories
    display_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#7c3aed"
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    display_order: Optional[int] = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str  # Rich HTML content from TinyMCE
    category_id: str
    category: Optional[str] = None  # Category name for display
    author: str = Field(default="Julian D'Rozario")
    author_email: str = Field(default="julian@drozario.blog")
    
    # SEO Fields
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    og_image: Optional[str] = None
    
    # Display Fields
    featured_image: Optional[str] = None
    featured_image_alt: Optional[str] = None
    read_time: str = Field(default="5 min read")
    
    # Status & Visibility
    status: str = Field(default="draft")  # draft, published, archived
    is_featured: bool = Field(default=False)
    is_sticky: bool = Field(default=False)  # Pin to top
    
    # Engagement
    views: int = Field(default=0)
    likes: int = Field(default=0)
    comments_enabled: bool = Field(default=True)
    
    # Tags (many-to-many relationship)
    tags: List[str] = Field(default_factory=list)
    tag_ids: List[str] = Field(default_factory=list)
    
    # Publishing
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BlogPostCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category_id: str
    
    # Optional SEO fields
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    
    # Optional display fields
    featured_image: Optional[str] = None
    featured_image_alt: Optional[str] = None
    read_time: Optional[str] = "5 min read"
    
    # Status
    status: Optional[str] = "draft"
    is_featured: Optional[bool] = False
    is_sticky: Optional[bool] = False
    
    # Tags
    tag_ids: Optional[List[str]] = Field(default_factory=list)
    
    # Publishing
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    
    # SEO fields
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    og_image: Optional[str] = None
    
    # Display fields
    featured_image: Optional[str] = None
    featured_image_alt: Optional[str] = None
    read_time: Optional[str] = None
    
    # Status
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    is_sticky: Optional[bool] = None
    comments_enabled: Optional[bool] = None
    
    # Tags
    tag_ids: Optional[List[str]] = None
    
    # Publishing
    published_at: Optional[datetime] = None
    scheduled_at: Optional[datetime] = None

# =============================================================================
# WORKED WITH MODELS (Enhanced)
# =============================================================================

class WorkedWithCompany(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    slug: str
    
    # Company Details
    description: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None  # startup, sme, enterprise
    
    # Visual Assets
    logo_url: Optional[str] = None
    logo_alt_text: Optional[str] = None
    featured_image: Optional[str] = None
    
    # Relationship Details
    service_provided: Optional[str] = None
    project_duration: Optional[str] = None
    testimonial: Optional[str] = None
    testimonial_author: Optional[str] = None
    testimonial_title: Optional[str] = None
    
    # Display Settings
    display_order: int = Field(default=0)
    is_featured: bool = Field(default=False)
    is_active: bool = Field(default=True)
    show_on_homepage: bool = Field(default=True)
    
    # Categories/Tags
    tags: List[str] = Field(default_factory=list)
    category: Optional[str] = None  # Client, Partner, Affiliate, etc.
    
    # Timestamps
    partnership_start: Optional[datetime] = None
    partnership_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkedWithCreate(BaseModel):
    company_name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None
    
    logo_url: Optional[str] = None
    logo_alt_text: Optional[str] = None
    featured_image: Optional[str] = None
    
    service_provided: Optional[str] = None
    project_duration: Optional[str] = None
    testimonial: Optional[str] = None
    testimonial_author: Optional[str] = None
    testimonial_title: Optional[str] = None
    
    display_order: Optional[int] = 0
    is_featured: Optional[bool] = False
    show_on_homepage: Optional[bool] = True
    
    tags: Optional[List[str]] = Field(default_factory=list)
    category: Optional[str] = None
    
    partnership_start: Optional[datetime] = None
    partnership_end: Optional[datetime] = None

class WorkedWithUpdate(BaseModel):
    company_name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None
    
    logo_url: Optional[str] = None
    logo_alt_text: Optional[str] = None
    featured_image: Optional[str] = None
    
    service_provided: Optional[str] = None
    project_duration: Optional[str] = None
    testimonial: Optional[str] = None
    testimonial_author: Optional[str] = None
    testimonial_title: Optional[str] = None
    
    display_order: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    show_on_homepage: Optional[bool] = None
    
    tags: Optional[List[str]] = None
    category: Optional[str] = None
    
    partnership_start: Optional[datetime] = None
    partnership_end: Optional[datetime] = None

# =============================================================================
# MEDIA/FILE MODELS
# =============================================================================

class MediaFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_filename: str
    file_path: str
    file_url: str
    file_size: int  # in bytes
    mime_type: str
    
    # Image specific
    width: Optional[int] = None
    height: Optional[int] = None
    alt_text: Optional[str] = None
    
    # Organization
    folder: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    # Usage tracking
    usage_count: int = Field(default=0)
    last_used: Optional[datetime] = None
    
    # Metadata
    uploaded_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MediaUpload(BaseModel):
    alt_text: Optional[str] = None
    folder: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)

# =============================================================================
# ADMIN/SYSTEM MODELS
# =============================================================================

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = Field(default="admin")  # admin, editor, author
    avatar_url: Optional[str] = None
    
    # Permissions
    can_publish: bool = Field(default=True)
    can_delete: bool = Field(default=True)
    can_manage_users: bool = Field(default=False)
    can_manage_media: bool = Field(default=True)
    
    # Activity
    last_login: Optional[datetime] = None
    login_count: int = Field(default=0)
    
    # Status
    is_active: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DashboardStats(BaseModel):
    total_posts: int = 0
    published_posts: int = 0
    draft_posts: int = 0
    total_views: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_worked_with: int = 0
    recent_posts: List[Dict[str, Any]] = Field(default_factory=list)
    popular_posts: List[Dict[str, Any]] = Field(default_factory=list)
    recent_activity: List[Dict[str, Any]] = Field(default_factory=list)

# =============================================================================
# RESPONSE MODELS
# =============================================================================

class BlogListResponse(BaseModel):
    blogs: List[BlogPost]
    total: int
    page: int = 1
    per_page: int = 12
    total_pages: int = 1

class TagListResponse(BaseModel):
    tags: List[Tag]
    total: int

class CategoryListResponse(BaseModel):
    categories: List[Category] 
    total: int

class WorkedWithListResponse(BaseModel):
    companies: List[WorkedWithCompany]
    total: int
    page: int = 1
    per_page: int = 20
    total_pages: int = 1

class MediaListResponse(BaseModel):
    files: List[MediaFile]
    total: int
    page: int = 1
    per_page: int = 50
    total_pages: int = 1
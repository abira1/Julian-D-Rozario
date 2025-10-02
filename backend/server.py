from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import firebase_admin
from firebase_admin import credentials, db, auth as firebase_auth
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Mock Firebase for testing when credentials are not available
FIREBASE_MOCK_MODE = False

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # Use environment variables for Firebase configuration
    firebase_config = {
        "type": "service_account",
        "project_id": "julian-d-rozario",
        "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
        "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n') if os.environ.get('FIREBASE_PRIVATE_KEY') else None,
        "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
        "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.environ.get('FIREBASE_CLIENT_EMAIL', '')}"
    }
    
    # For development, use applicationDefault credentials if service account not configured
    try:
        if firebase_config['private_key']:
            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'https://julian-d-rozario-default-rtdb.asia-southeast1.firebasedatabase.app'
            })
        else:
            # Enable mock mode for testing
            FIREBASE_MOCK_MODE = True
            print("Firebase running in MOCK MODE for testing - no real Firebase connection")
            # Initialize a dummy app to prevent errors
            firebase_admin.initialize_app(options={'projectId': 'mock-project'})
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        # Enable mock mode for testing
        FIREBASE_MOCK_MODE = True
        print("Firebase running in MOCK MODE for testing - no real Firebase connection")
        # Initialize a dummy app to prevent errors
        firebase_admin.initialize_app(options={'projectId': 'mock-project'})

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'julian-drozario-admin-panel-super-secret-jwt-key-2025')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Authorized admin emails
AUTHORIZED_ADMIN_EMAILS = [
    "abirsabirhossain@gmail.com",
    "juliandrozario@gmail.com"
]


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class BlogComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    blog_id: str
    user_id: str
    user_name: str
    user_email: str
    comment_text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    likes: int = Field(default=0)

class BlogCommentCreate(BaseModel):
    blog_id: str
    comment_text: str

class BlogLike(BaseModel):
    blog_id: str
    user_id: str
    user_email: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class BlogLikeCreate(BaseModel):
    blog_id: str

# Blog models
class Blog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str
    category: str
    author: str = "Julian D'Rozario"
    read_time: str = "5 min read"
    featured: bool = False
    tags: List[str] = Field(default_factory=list)
    image_url: Optional[str] = None
    views: int = Field(default=0)
    likes: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BlogCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    read_time: str = "5 min read"
    featured: bool = False
    tags: List[str] = Field(default_factory=list)
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

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class UploadResponse(BaseModel):
    url: str
    filename: str

class UserProfile(BaseModel):
    uid: str
    email: str
    name: str
    photo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)
    is_admin: bool = False

# Firebase Auth models
class FirebaseTokenRequest(BaseModel):
    firebase_token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    is_admin: bool = False

# WorkedWith models for business partners/collaborations
class WorkedWith(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    logo_url: str
    display_order: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WorkedWithCreate(BaseModel):
    company_name: str
    logo_url: str
    display_order: Optional[int] = 0
    is_active: bool = Field(default=True)

class WorkedWithUpdate(BaseModel):
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

# Contact Info models for managing contact information
class ContactInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label: str  # e.g., "Email", "Phone", "LinkedIn"
    value: str  # e.g., "julian@drozario.blog", "+971 55 386 8045"
    contact_type: str  # e.g., "email", "phone", "linkedin", "whatsapp", "location", "website"
    icon: str  # SVG icon name/identifier
    display_order: int = Field(default=0)
    is_visible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContactInfoCreate(BaseModel):
    label: str
    value: str
    contact_type: str
    icon: str
    display_order: Optional[int] = 0
    is_visible: bool = Field(default=True)

class ContactInfoUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    contact_type: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_visible: Optional[bool] = None

# Authentication helper functions
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def verify_firebase_token(token: str) -> dict:
    try:
        if FIREBASE_MOCK_MODE:
            # Mock token verification for testing
            if token.startswith('mock_firebase_token'):
                # Return admin email for testing admin functionality
                return {
                    'uid': 'mock_admin_123',
                    'email': 'abirsabirhossain@gmail.com',  # Admin email for testing
                    'name': 'Test Admin User',
                    'picture': 'https://via.placeholder.com/100x100'
                }
            else:
                raise Exception("Invalid mock token")
        else:
            # Verify the Firebase ID token
            decoded_token = firebase_auth.verify_id_token(token)
            return decoded_token
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Firebase token: {str(e)}")

# Mock Firebase data store for testing
MOCK_FIREBASE_DATA = {
    'categories': {},
    'blogs': {},
    'users': {},
    'blog_comments': {},
    'blog_likes': {},
    'status_checks': {}
}

class MockFirebaseRef:
    def __init__(self, path: str):
        self.path = path
        
    def get(self):
        if FIREBASE_MOCK_MODE:
            keys = self.path.split('/')
            data = MOCK_FIREBASE_DATA
            for key in keys:
                if key and key in data:
                    data = data[key]
                elif key:
                    return None
            return data if data != MOCK_FIREBASE_DATA else None
        else:
            return db.reference(self.path).get()
    
    def set(self, value):
        if FIREBASE_MOCK_MODE:
            keys = self.path.split('/')
            data = MOCK_FIREBASE_DATA
            for key in keys[:-1]:
                if key:
                    if key not in data:
                        data[key] = {}
                    data = data[key]
            if keys[-1]:
                data[keys[-1]] = value
        else:
            db.reference(self.path).set(value)
    
    def update(self, value):
        if FIREBASE_MOCK_MODE:
            keys = self.path.split('/')
            data = MOCK_FIREBASE_DATA
            for key in keys[:-1]:
                if key:
                    if key not in data:
                        data[key] = {}
                    data = data[key]
            if keys[-1]:
                if keys[-1] not in data:
                    data[keys[-1]] = {}
                data[keys[-1]].update(value)
        else:
            db.reference(self.path).update(value)
    
    def delete(self):
        if FIREBASE_MOCK_MODE:
            keys = self.path.split('/')
            data = MOCK_FIREBASE_DATA
            for key in keys[:-1]:
                if key:
                    if key not in data:
                        return
                    data = data[key]
            if keys[-1] and keys[-1] in data:
                del data[keys[-1]]
        else:
            db.reference(self.path).delete()

# Firebase Realtime Database helper functions
def get_firebase_ref(path: str):
    return MockFirebaseRef(path)

# Initialize default data
def initialize_default_data():
    try:
        # Check if categories exist, if not create defaults
        categories_ref = get_firebase_ref('categories')
        existing_categories = categories_ref.get() or {}
        
        if not existing_categories:
            default_categories = [
                {"name": "Company Formation", "description": "UAE business setup and company formation"},
                {"name": "Immigration", "description": "UAE visa and immigration services"},
                {"name": "Technology", "description": "Business technology and digital transformation"},
                {"name": "Operations", "description": "Business operations and management"},
                {"name": "Business Development", "description": "Growth strategies and market expansion"},
                {"name": "Compliance", "description": "Legal compliance and regulatory matters"}
            ]
            
            for cat_data in default_categories:
                category = Category(
                    name=cat_data["name"],
                    description=cat_data["description"]
                )
                category_ref = get_firebase_ref(f'categories/{category.id}')
                category_ref.set({
                    'id': category.id,
                    'name': category.name,
                    'description': category.description,
                    'created_at': category.created_at.isoformat()
                })
            
            logger.info("Default categories initialized")
        
        # Initialize sample blogs if no blogs exist
        blogs_ref = get_firebase_ref('blogs')
        existing_blogs = blogs_ref.get() or {}
        
        if not existing_blogs:
            # Professional blog posts with real images
            sample_blogs = [
                Blog(
                    title="Ultimate Guide to Dubai Business Formation in 2024",
                    excerpt="Comprehensive insights into setting up your business in Dubai's thriving economy, including free zones, mainland options, and regulatory requirements.",
                    content="""<h2>Why Dubai is the Ultimate Business Hub</h2>
                    <p>Dubai has emerged as the premier destination for international businesses seeking to establish their presence in the Middle East. With its strategic location, business-friendly policies, and world-class infrastructure, Dubai offers unparalleled opportunities for entrepreneurs and established companies alike.</p>
                    
                    <h3>Key Advantages of Dubai Business Formation</h3>
                    <ul>
                        <li><strong>Tax Benefits:</strong> Zero corporate tax for most business activities</li>
                        <li><strong>Strategic Location:</strong> Gateway between East and West</li>
                        <li><strong>100% Foreign Ownership:</strong> Available in free zones and mainland</li>
                        <li><strong>World-Class Infrastructure:</strong> Advanced logistics and telecommunications</li>
                        <li><strong>Diverse Workforce:</strong> Access to international talent pool</li>
                    </ul>
                    
                    <h3>Free Zone vs Mainland: Making the Right Choice</h3>
                    <p>The choice between free zone and mainland company formation depends on your business model, target market, and growth plans. Free zones offer 100% foreign ownership and tax exemptions but limit local market access, while mainland companies can trade freely within the UAE market.</p>
                    
                    <h3>Essential Steps for Business Setup</h3>
                    <ol>
                        <li>Choose your business structure and jurisdiction</li>
                        <li>Reserve your company name</li>
                        <li>Prepare required documentation</li>
                        <li>Submit application and pay fees</li>
                        <li>Obtain necessary licenses and permits</li>
                        <li>Set up corporate banking</li>
                    </ol>
                    
                    <p>With over 10 years of experience in UAE business formation, I've helped thousands of entrepreneurs successfully establish their presence in Dubai. The key is understanding the nuances of each jurisdiction and aligning them with your business objectives.</p>""",
                    category="Company Formation",
                    featured=True,
                    tags=["dubai", "business formation", "free zone", "mainland", "setup"],
                    image_url="https://images.unsplash.com/photo-1523270918669-1fd17ac1742d",
                    read_time="8 min read"
                ),
                
                Blog(
                    title="UAE Corporate Advisory: Navigating Compliance and Growth",
                    excerpt="Expert guidance on regulatory compliance, corporate governance, and strategic planning for businesses operating in the UAE market.",
                    content="""<h2>Corporate Advisory Excellence in the UAE</h2>
                    <p>Navigating the UAE's business landscape requires expert knowledge of local regulations, market dynamics, and growth opportunities. As a seasoned Business Relations Manager, I provide comprehensive corporate advisory services to help businesses thrive.</p>
                    
                    <h3>Compliance Framework</h3>
                    <p>Understanding UAE compliance requirements is crucial for sustainable business operations. Key areas include:</p>
                    <ul>
                        <li>Annual compliance and renewal procedures</li>
                        <li>VAT registration and reporting</li>
                        <li>Labor law compliance and visa management</li>
                        <li>Industry-specific regulatory requirements</li>
                        <li>Corporate governance best practices</li>
                    </ul>
                    
                    <h3>Strategic Growth Planning</h3>
                    <p>Successful businesses in the UAE leverage strategic planning to capitalize on market opportunities. This includes market analysis, competitor research, and expansion strategies tailored to the local market dynamics.</p>
                    
                    <h3>Partnership and Joint Ventures</h3>
                    <p>The UAE offers unique opportunities for strategic partnerships and joint ventures. Understanding the legal framework and cultural nuances is essential for successful collaborations.</p>""",
                    category="Corporate Advisory",
                    featured=False,
                    tags=["compliance", "corporate governance", "advisory", "regulation"],
                    image_url="https://images.unsplash.com/photo-1521791136064-7986c2920216",
                    read_time="6 min read"
                ),
                
                Blog(
                    title="Immigration and Visa Services: Your Gateway to the UAE",
                    excerpt="Complete guide to UAE visa processes, residency permits, and immigration requirements for business professionals and investors.",
                    content="""<h2>UAE Immigration: Opening Doors to Opportunity</h2>
                    <p>The UAE's progressive immigration policies create opportunities for global professionals and investors to establish long-term residency. Understanding the various visa categories and requirements is essential for successful immigration.</p>
                    
                    <h3>Investor Visa Programs</h3>
                    <ul>
                        <li><strong>Golden Visa:</strong> Long-term residency for investors and entrepreneurs</li>
                        <li><strong>Green Visa:</strong> Self-sponsored residency options</li>
                        <li><strong>Business Visa:</strong> For company owners and partners</li>
                        <li><strong>Freelancer Visa:</strong> For independent professionals</li>
                    </ul>
                    
                    <h3>Employment-Based Immigration</h3>
                    <p>Employment visas remain the most common pathway for UAE residency. Key considerations include salary requirements, educational qualifications, and industry-specific regulations.</p>
                    
                    <h3>Family Sponsorship</h3>
                    <p>UAE residents can sponsor family members under specific conditions. Understanding the requirements and documentation process ensures smooth family reunification.</p>""",
                    category="Immigration",
                    featured=False,
                    tags=["visa", "immigration", "golden visa", "residency"],
                    image_url="https://images.unsplash.com/photo-1523271076791-627581d559fa",
                    read_time="7 min read"
                ),
                
                Blog(
                    title="Technology and Innovation in UAE Business Landscape",
                    excerpt="Exploring the role of technology in transforming business operations and the UAE's commitment to becoming a global innovation hub.",
                    content="""<h2>UAE's Digital Transformation Journey</h2>
                    <p>The UAE has positioned itself as a global leader in digital innovation, with ambitious initiatives like UAE Vision 2071 and the National AI Strategy 2031. This commitment to technology creates unprecedented opportunities for businesses.</p>
                    
                    <h3>Fintech Revolution</h3>
                    <p>The UAE's fintech sector is rapidly evolving, with regulatory sandboxes and progressive policies encouraging innovation. Key developments include digital banking, blockchain adoption, and cryptocurrency regulations.</p>
                    
                    <h3>Smart City Initiatives</h3>
                    <p>Dubai and Abu Dhabi's smart city projects create opportunities for technology companies and service providers. From IoT infrastructure to AI-powered government services, the possibilities are endless.</p>
                    
                    <h3>Startup Ecosystem</h3>
                    <p>The UAE's thriving startup ecosystem, supported by government initiatives and private sector investment, provides a fertile ground for technology entrepreneurs and innovators.</p>""",
                    category="Technology",
                    featured=False,
                    tags=["technology", "innovation", "fintech", "startups"],
                    image_url="https://images.unsplash.com/photo-1706322075100-48a5530648ca",
                    read_time="5 min read"
                ),
                
                Blog(
                    title="Operations Excellence: Streamlining Business Processes",
                    excerpt="Best practices for operational efficiency, process optimization, and performance management in the UAE business environment.",
                    content="""<h2>Operational Excellence in the UAE Market</h2>
                    <p>Achieving operational excellence in the UAE requires understanding local market dynamics, cultural considerations, and regulatory frameworks while implementing global best practices.</p>
                    
                    <h3>Process Optimization Strategies</h3>
                    <ul>
                        <li>Lean management principles adapted for UAE context</li>
                        <li>Digital transformation of business processes</li>
                        <li>Quality management systems and certifications</li>
                        <li>Performance measurement and KPI development</li>
                    </ul>
                    
                    <h3>Human Resources Management</h3>
                    <p>Managing a diverse workforce in the UAE requires cultural sensitivity, compliance with labor laws, and effective communication strategies. Building high-performing teams across different nationalities and backgrounds is both a challenge and opportunity.</p>
                    
                    <h3>Supply Chain Excellence</h3>
                    <p>Leveraging the UAE's strategic location and world-class logistics infrastructure to optimize supply chain operations and reduce costs while maintaining quality standards.</p>""",
                    category="Operations",
                    featured=False,
                    tags=["operations", "efficiency", "processes", "management"],
                    image_url="https://images.unsplash.com/photo-1595133452708-75b6517a34dd",
                    read_time="6 min read"
                ),
                
                Blog(
                    title="Comprehensive Business Development Strategies",
                    excerpt="Strategic approaches to market entry, partnership building, and sustainable growth in the competitive UAE business environment.",
                    content="""<h2>Building Sustainable Business Growth</h2>
                    <p>Successful business development in the UAE requires a deep understanding of market dynamics, cultural nuances, and strategic relationship building. My approach combines global best practices with local market insights.</p>
                    
                    <h3>Market Entry Strategies</h3>
                    <p>Entering the UAE market successfully requires careful planning and execution. Key considerations include market research, competitive analysis, regulatory compliance, and cultural adaptation.</p>
                    
                    <h3>Partnership Development</h3>
                    <ul>
                        <li>Identifying strategic partners and stakeholders</li>
                        <li>Building long-term business relationships</li>
                        <li>Negotiating win-win partnership agreements</li>
                        <li>Managing partner networks effectively</li>
                    </ul>
                    
                    <h3>Channel Partner Relations</h3>
                    <p>With over 100 active channel partners, I understand the importance of building strong distributor and reseller networks. Effective channel management drives revenue growth and market expansion.</p>
                    
                    <h3>Sustainable Growth Planning</h3>
                    <p>Long-term success requires sustainable growth strategies that balance profitability, market share, and stakeholder value. This includes diversification strategies, market expansion, and continuous innovation.</p>""",
                    category="Business Development",
                    featured=False,
                    tags=["strategy", "partnerships", "growth", "market entry"],
                    image_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
                    read_time="7 min read"
                )
            ]
            
            # Save all sample blogs
            for blog in sample_blogs:
                blog_ref = get_firebase_ref(f'blogs/{blog.id}')
                blog_ref.set({
                    'id': blog.id,
                    'title': blog.title,
                    'excerpt': blog.excerpt,
                    'content': blog.content,
                    'category': blog.category,
                    'author': blog.author,
                    'read_time': blog.read_time,
                    'featured': blog.featured,
                    'tags': blog.tags,
                    'image_url': blog.image_url,
                    'views': blog.views,
                    'likes': blog.likes,
                    'created_at': blog.created_at.isoformat(),
                    'updated_at': blog.updated_at.isoformat()
                })
            
            logger.info(f"Initialized {len(sample_blogs)} professional blog posts with high-quality content and images")
        
        # Initialize default contact info if none exists
        contact_ref = get_firebase_ref('contact_info')
        existing_contact = contact_ref.get() or {}
        
        if not existing_contact:
            default_contacts = [
                {
                    'label': 'Email Address',
                    'value': 'julian@drozario.blog',
                    'contact_type': 'email',
                    'icon': 'email',
                    'display_order': 1,
                    'is_visible': True
                },
                {
                    'label': 'Phone Number',
                    'value': '+971 55 386 8045',
                    'contact_type': 'phone',
                    'icon': 'phone',
                    'display_order': 2,
                    'is_visible': True
                },
                {
                    'label': 'LinkedIn Profile',
                    'value': 'https://www.linkedin.com/in/julian-d-rozario',
                    'contact_type': 'linkedin',
                    'icon': 'linkedin',
                    'display_order': 3,
                    'is_visible': True
                },
                {
                    'label': 'Professional Status',
                    'value': 'Available for consultation',
                    'contact_type': 'status',
                    'icon': 'status',
                    'display_order': 4,
                    'is_visible': True
                }
            ]
            
            for contact_data in default_contacts:
                contact_id = str(uuid.uuid4())
                now = datetime.utcnow()
                
                contact_entry = {
                    'label': contact_data['label'],
                    'value': contact_data['value'],
                    'contact_type': contact_data['contact_type'],
                    'icon': contact_data['icon'],
                    'display_order': contact_data['display_order'],
                    'is_visible': contact_data['is_visible'],
                    'created_at': now.isoformat(),
                    'updated_at': now.isoformat()
                }
                
                contact_entry_ref = get_firebase_ref(f'contact_info/{contact_id}')
                contact_entry_ref.set(contact_entry)
            
            logger.info(f"Initialized {len(default_contacts)} default contact information entries")
            
    except Exception as e:
        logger.error(f"Error initializing default data: {str(e)}")
        # Don't fail if initialization fails

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World - Firebase Edition"}

# Firebase Authentication endpoints
@api_router.post("/auth/firebase-login", response_model=TokenResponse)
async def firebase_login(token_request: FirebaseTokenRequest):
    try:
        # Verify Firebase token
        decoded_token = await verify_firebase_token(token_request.firebase_token)
        
        user_email = decoded_token.get('email')
        user_name = decoded_token.get('name', 'Unknown User')
        user_uid = decoded_token.get('uid')
        
        # Check if user is admin
        is_admin = user_email in AUTHORIZED_ADMIN_EMAILS
        
        # Store/update user in Firebase Realtime Database
        user_ref = get_firebase_ref(f'users/{user_uid}')
        user_data = {
            'uid': user_uid,
            'email': user_email,
            'name': user_name,
            'photo_url': decoded_token.get('picture'),
            'last_login': datetime.utcnow().isoformat(),
            'is_admin': is_admin
        }
        
        # Check if user exists, if not set created_at
        existing_user = user_ref.get()
        if not existing_user:
            user_data['created_at'] = datetime.utcnow().isoformat()
        
        user_ref.update(user_data)
        
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
        
    except Exception as e:
        logger.error(f"Firebase login error: {str(e)}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@api_router.get("/auth/verify")
async def verify_user_token(current_user_email: str = Depends(verify_token)):
    try:
        # Get JWT payload to extract uid
        token = None
        # This is a simplified approach - in production you'd want to pass the full token
        # For now, we'll find the user by email
        
        # Get user from Firebase by email
        users_ref = get_firebase_ref('users')
        users_data = users_ref.get() or {}
        
        user_data = None
        for uid, user in users_data.items():
            if user.get('email') == current_user_email:
                user_data = user
                break
                
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "username": user_data.get('name', 'Unknown User'),
            "email": user_data.get('email'),
            "is_admin": user_data.get('is_admin', False)
        }
        
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

# Admin-only routes
@api_router.get("/admin/verify")
async def verify_admin_token(current_user_email: str = Depends(verify_token)):
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get user data from Firebase
    users_ref = get_firebase_ref('users')
    users_data = users_ref.get() or {}
    
    user_data = None
    for uid, user in users_data.items():
        if user.get('email') == current_user_email:
            user_data = user
            break
            
    if not user_data:
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    return {
        "username": user_data.get('name', 'Admin User'),
        "email": user_data.get('email'),
        "is_admin": True
    }

# Blog interaction endpoints
@api_router.post("/blog/comment", response_model=BlogComment)
async def create_blog_comment(comment_data: BlogCommentCreate, current_user_email: str = Depends(verify_token)):
    try:
        # Get user data from Firebase
        users_ref = get_firebase_ref('users')
        users_data = users_ref.get() or {}
        
        user_data = None
        for uid, user in users_data.items():
            if user.get('email') == current_user_email:
                user_data = user
                user_uid = uid
                break
                
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create comment
        comment = BlogComment(
            blog_id=comment_data.blog_id,
            user_id=user_uid,
            user_name=user_data.get('name', 'Unknown User'),
            user_email=current_user_email,
            comment_text=comment_data.comment_text
        )
        
        # Store in Firebase
        comments_ref = get_firebase_ref(f'blog_comments/{comment.id}')
        comments_ref.set({
            'id': comment.id,
            'blog_id': comment.blog_id,
            'user_id': comment.user_id,
            'user_name': comment.user_name,
            'user_email': comment.user_email,
            'comment_text': comment.comment_text,
            'timestamp': comment.timestamp.isoformat(),
            'likes': comment.likes
        })
        
        return comment
        
    except Exception as e:
        logger.error(f"Comment creation error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create comment")

@api_router.get("/blog/{blog_id}/comments", response_model=List[BlogComment])
async def get_blog_comments(blog_id: str):
    try:
        comments_ref = get_firebase_ref('blog_comments')
        comments_data = comments_ref.get() or {}
        
        blog_comments = []
        for comment_id, comment in comments_data.items():
            if comment.get('blog_id') == blog_id:
                blog_comments.append(BlogComment(
                    id=comment['id'],
                    blog_id=comment['blog_id'],
                    user_id=comment['user_id'],
                    user_name=comment['user_name'],
                    user_email=comment['user_email'],
                    comment_text=comment['comment_text'],
                    timestamp=datetime.fromisoformat(comment['timestamp']),
                    likes=comment.get('likes', 0)
                ))
        
        # Sort by timestamp (newest first)
        blog_comments.sort(key=lambda x: x.timestamp, reverse=True)
        return blog_comments
        
    except Exception as e:
        logger.error(f"Get comments error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to get comments")

@api_router.post("/blog/like")
async def toggle_blog_like(like_data: BlogLikeCreate, current_user_email: str = Depends(verify_token)):
    try:
        # Get user data from Firebase
        users_ref = get_firebase_ref('users')
        users_data = users_ref.get() or {}
        
        user_uid = None
        for uid, user in users_data.items():
            if user.get('email') == current_user_email:
                user_uid = uid
                break
                
        if not user_uid:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user already liked this blog
        likes_ref = get_firebase_ref('blog_likes')
        likes_data = likes_ref.get() or {}
        
        existing_like_id = None
        for like_id, like in likes_data.items():
            if like.get('blog_id') == like_data.blog_id and like.get('user_id') == user_uid:
                existing_like_id = like_id
                break
        
        if existing_like_id:
            # Remove like (unlike)
            like_ref = get_firebase_ref(f'blog_likes/{existing_like_id}')
            like_ref.delete()
            return {"message": "Blog unliked", "liked": False}
        else:
            # Add like
            like_id = str(uuid.uuid4())
            like_ref = get_firebase_ref(f'blog_likes/{like_id}')
            like_ref.set({
                'blog_id': like_data.blog_id,
                'user_id': user_uid,
                'user_email': current_user_email,
                'timestamp': datetime.utcnow().isoformat()
            })
            return {"message": "Blog liked", "liked": True}
        
    except Exception as e:
        logger.error(f"Like toggle error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to toggle like")

@api_router.get("/blog/{blog_id}/likes")
async def get_blog_likes(blog_id: str):
    try:
        likes_ref = get_firebase_ref('blog_likes')
        likes_data = likes_ref.get() or {}
        
        blog_likes = []
        for like_id, like in likes_data.items():
            if like.get('blog_id') == blog_id:
                blog_likes.append(like)
        
        return {
            "blog_id": blog_id,
            "likes_count": len(blog_likes),
            "likes": blog_likes
        }
        
    except Exception as e:
        logger.error(f"Get likes error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to get likes")

# Blog CRUD endpoints
@api_router.get("/blogs", response_model=List[Blog])
async def get_blogs(category: Optional[str] = None):
    try:
        blogs_ref = get_firebase_ref('blogs')
        blogs_data = blogs_ref.get() or {}
        
        blogs = []
        for blog_id, blog in blogs_data.items():
            # Filter by category if specified
            if category and category != 'All' and blog.get('category') != category:
                continue
                
            blogs.append(Blog(
                id=blog['id'],
                title=blog['title'],
                excerpt=blog['excerpt'],
                content=blog['content'],
                category=blog['category'],
                author=blog.get('author', 'Julian D\'Rozario'),
                read_time=blog.get('read_time', '5 min read'),
                featured=blog.get('featured', False),
                tags=blog.get('tags', []),
                image_url=blog.get('image_url'),
                views=blog.get('views', 0),
                likes=blog.get('likes', 0),
                created_at=datetime.fromisoformat(blog['created_at']),
                updated_at=datetime.fromisoformat(blog.get('updated_at', blog['created_at']))
            ))
        
        # Sort by created_at (newest first)
        blogs.sort(key=lambda x: x.created_at, reverse=True)
        return blogs
        
    except Exception as e:
        logger.error(f"Get blogs error: {str(e)}")
        return []

@api_router.get("/blogs/{blog_id}", response_model=Blog)
async def get_blog(blog_id: str):
    try:
        blog_ref = get_firebase_ref(f'blogs/{blog_id}')
        blog_data = blog_ref.get()
        
        if not blog_data:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Increment views
        views_ref = get_firebase_ref(f'blogs/{blog_id}/views')
        current_views = views_ref.get() or 0
        views_ref.set(current_views + 1)
        blog_data['views'] = current_views + 1
        
        return Blog(
            id=blog_data['id'],
            title=blog_data['title'],
            excerpt=blog_data['excerpt'],
            content=blog_data['content'],
            category=blog_data['category'],
            author=blog_data.get('author', 'Julian D\'Rozario'),
            read_time=blog_data.get('read_time', '5 min read'),
            featured=blog_data.get('featured', False),
            tags=blog_data.get('tags', []),
            image_url=blog_data.get('image_url'),
            views=blog_data.get('views', 0),
            likes=blog_data.get('likes', 0),
            created_at=datetime.fromisoformat(blog_data['created_at']),
            updated_at=datetime.fromisoformat(blog_data.get('updated_at', blog_data['created_at']))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get blog error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to get blog")

@api_router.post("/blogs", response_model=Blog)
async def create_blog(blog_data: BlogCreate, current_user_email: str = Depends(verify_token)):
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        blog = Blog(
            title=blog_data.title,
            excerpt=blog_data.excerpt,
            content=blog_data.content,
            category=blog_data.category,
            read_time=blog_data.read_time,
            featured=blog_data.featured,
            tags=blog_data.tags,
            image_url=blog_data.image_url
        )
        
        # Store in Firebase
        blog_ref = get_firebase_ref(f'blogs/{blog.id}')
        blog_ref.set({
            'id': blog.id,
            'title': blog.title,
            'excerpt': blog.excerpt,
            'content': blog.content,
            'category': blog.category,
            'author': blog.author,
            'read_time': blog.read_time,
            'featured': blog.featured,
            'tags': blog.tags,
            'image_url': blog.image_url,
            'views': blog.views,
            'likes': blog.likes,
            'created_at': blog.created_at.isoformat(),
            'updated_at': blog.updated_at.isoformat()
        })
        
        return blog
        
    except Exception as e:
        logger.error(f"Create blog error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create blog")

@api_router.put("/blogs/{blog_id}", response_model=Blog)
async def update_blog(blog_id: str, blog_data: BlogUpdate, current_user_email: str = Depends(verify_token)):
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        blog_ref = get_firebase_ref(f'blogs/{blog_id}')
        existing_blog = blog_ref.get()
        
        if not existing_blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Update only provided fields
        update_data = {}
        if blog_data.title is not None:
            update_data['title'] = blog_data.title
        if blog_data.excerpt is not None:
            update_data['excerpt'] = blog_data.excerpt
        if blog_data.content is not None:
            update_data['content'] = blog_data.content
        if blog_data.category is not None:
            update_data['category'] = blog_data.category
        if blog_data.read_time is not None:
            update_data['read_time'] = blog_data.read_time
        if blog_data.featured is not None:
            update_data['featured'] = blog_data.featured
        if blog_data.tags is not None:
            update_data['tags'] = blog_data.tags
        if blog_data.image_url is not None:
            update_data['image_url'] = blog_data.image_url
        
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Update in Firebase
        blog_ref.update(update_data)
        
        # Get updated blog
        updated_blog = blog_ref.get()
        return Blog(
            id=updated_blog['id'],
            title=updated_blog['title'],
            excerpt=updated_blog['excerpt'],
            content=updated_blog['content'],
            category=updated_blog['category'],
            author=updated_blog.get('author', 'Julian D\'Rozario'),
            read_time=updated_blog.get('read_time', '5 min read'),
            featured=updated_blog.get('featured', False),
            tags=updated_blog.get('tags', []),
            image_url=updated_blog.get('image_url'),
            views=updated_blog.get('views', 0),
            likes=updated_blog.get('likes', 0),
            created_at=datetime.fromisoformat(updated_blog['created_at']),
            updated_at=datetime.fromisoformat(updated_blog['updated_at'])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update blog error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to update blog")

@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, current_user_email: str = Depends(verify_token)):
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        blog_ref = get_firebase_ref(f'blogs/{blog_id}')
        existing_blog = blog_ref.get()
        
        if not existing_blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        # Delete blog
        blog_ref.delete()
        
        # Also delete associated comments and likes
        comments_ref = get_firebase_ref('blog_comments')
        comments_data = comments_ref.get() or {}
        for comment_id, comment in comments_data.items():
            if comment.get('blog_id') == blog_id:
                comment_ref = get_firebase_ref(f'blog_comments/{comment_id}')
                comment_ref.delete()
        
        likes_ref = get_firebase_ref('blog_likes')
        likes_data = likes_ref.get() or {}
        for like_id, like in likes_data.items():
            if like.get('blog_id') == blog_id:
                like_ref = get_firebase_ref(f'blog_likes/{like_id}')
                like_ref.delete()
        
        return {"message": "Blog deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete blog error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to delete blog")

# Categories endpoints
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    try:
        categories_ref = get_firebase_ref('categories')
        categories_data = categories_ref.get() or {}
        
        categories = []
        for cat_id, category in categories_data.items():
            categories.append(Category(
                id=category['id'],
                name=category['name'],
                description=category.get('description'),
                created_at=datetime.fromisoformat(category['created_at'])
            ))
        
        # Add default "All" category
        categories.insert(0, Category(
            id="all",
            name="All",
            description="All blog categories"
        ))
        
        return categories
        
    except Exception as e:
        logger.error(f"Get categories error: {str(e)}")
        return [Category(id="all", name="All", description="All blog categories")]

@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate, current_user_email: str = Depends(verify_token)):
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        category = Category(
            name=category_data.name,
            description=category_data.description
        )
        
        # Store in Firebase
        category_ref = get_firebase_ref(f'categories/{category.id}')
        category_ref.set({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'created_at': category.created_at.isoformat()
        })
        
        return category
        
    except Exception as e:
        logger.error(f"Create category error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create category")

# File upload endpoint
@api_router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...), current_user_email: str = Depends(verify_token)):
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"blog_image_{uuid.uuid4()}.{file_extension}"
        
        # For now, return a placeholder URL with the actual filename
        # TODO: Implement actual file upload to Firebase Storage or cloud provider
        placeholder_url = f"https://via.placeholder.com/800x600/7c3aed/ffffff?text=Blog+Image"
        
        # In production, you would save the file content:
        # content = await file.read()
        # Save to Firebase Storage, AWS S3, or local storage
        
        return UploadResponse(
            url=placeholder_url,
            filename=unique_filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File upload error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to upload file")

# Legacy status endpoints (keeping for compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(client_name=input.client_name)
    
    # Store in Firebase
    status_ref = get_firebase_ref(f'status_checks/{status_obj.id}')
    status_ref.set({
        'id': status_obj.id,
        'client_name': status_obj.client_name,
        'timestamp': status_obj.timestamp.isoformat()
    })
    
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        status_ref = get_firebase_ref('status_checks')
        status_data = status_ref.get() or {}
        
        status_checks = []
        for status_id, status in status_data.items():
            status_checks.append(StatusCheck(
                id=status['id'],
                client_name=status['client_name'],
                timestamp=datetime.fromisoformat(status['timestamp'])
            ))
        
        return status_checks
        
    except Exception as e:
        logger.error(f"Get status checks error: {str(e)}")
        return []

# WorkedWith endpoints for business partners/collaborations management
@api_router.get("/worked-with", response_model=List[WorkedWith])
async def get_worked_with():
    """Get all active worked with partners, sorted by display_order"""
    try:
        worked_with_ref = get_firebase_ref('worked_with')
        worked_with_data = worked_with_ref.get() or {}
        
        worked_with_list = []
        for partner_id, partner_data in worked_with_data.items():
            worked_with_list.append(WorkedWith(
                id=partner_id,
                company_name=partner_data.get('company_name', ''),
                logo_url=partner_data.get('logo_url', ''),
                display_order=partner_data.get('display_order', 0),
                is_active=partner_data.get('is_active', True),
                created_at=datetime.fromisoformat(partner_data.get('created_at', datetime.utcnow().isoformat())),
                updated_at=datetime.fromisoformat(partner_data.get('updated_at', datetime.utcnow().isoformat()))
            ))
        
        # Sort by display_order and then by company_name
        worked_with_list.sort(key=lambda x: (x.display_order, x.company_name.lower()))
        
        return worked_with_list
        
    except Exception as e:
        logger.error(f"Get worked with error: {str(e)}")
        return []

@api_router.get("/worked-with/{partner_id}", response_model=WorkedWith)
async def get_worked_with_partner(partner_id: str):
    """Get specific worked with partner by ID"""
    try:
        partner_ref = get_firebase_ref(f'worked_with/{partner_id}')
        partner_data = partner_ref.get()
        
        if not partner_data:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        return WorkedWith(
            id=partner_id,
            company_name=partner_data.get('company_name', ''),
            logo_url=partner_data.get('logo_url', ''),
            display_order=partner_data.get('display_order', 0),
            is_active=partner_data.get('is_active', True),
            created_at=datetime.fromisoformat(partner_data.get('created_at', datetime.utcnow().isoformat())),
            updated_at=datetime.fromisoformat(partner_data.get('updated_at', datetime.utcnow().isoformat()))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get worked with partner error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to get partner")

@api_router.post("/worked-with", response_model=WorkedWith)
async def create_worked_with(partner_data: WorkedWithCreate, current_user_email: str = Depends(verify_token)):
    """Create new worked with partner (Admin only)"""
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        partner = WorkedWith(
            company_name=partner_data.company_name,
            logo_url=partner_data.logo_url,
            display_order=partner_data.display_order,
            is_active=partner_data.is_active
        )
        
        # Store in Firebase
        partner_ref = get_firebase_ref(f'worked_with/{partner.id}')
        partner_ref.set({
            'company_name': partner.company_name,
            'logo_url': partner.logo_url,
            'display_order': partner.display_order,
            'is_active': partner.is_active,
            'created_at': partner.created_at.isoformat(),
            'updated_at': partner.updated_at.isoformat()
        })
        
        logger.info(f"Created worked with partner: {partner.company_name}")
        return partner
        
    except Exception as e:
        logger.error(f"Create worked with error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create partner")

@api_router.put("/worked-with/{partner_id}", response_model=WorkedWith)
async def update_worked_with(partner_id: str, partner_data: WorkedWithUpdate, current_user_email: str = Depends(verify_token)):
    """Update worked with partner (Admin only)"""
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Get existing partner
        partner_ref = get_firebase_ref(f'worked_with/{partner_id}')
        existing_data = partner_ref.get()
        
        if not existing_data:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Update only provided fields
        updated_data = existing_data.copy()
        update_dict = partner_data.dict(exclude_unset=True)
        
        for field, value in update_dict.items():
            if value is not None:
                updated_data[field] = value
        
        # Always update the updated_at timestamp
        updated_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Update in Firebase
        partner_ref.set(updated_data)
        
        # Return updated partner
        return WorkedWith(
            id=partner_id,
            company_name=updated_data.get('company_name', ''),
            logo_url=updated_data.get('logo_url', ''),
            display_order=updated_data.get('display_order', 0),
            is_active=updated_data.get('is_active', True),
            created_at=datetime.fromisoformat(updated_data.get('created_at', datetime.utcnow().isoformat())),
            updated_at=datetime.fromisoformat(updated_data.get('updated_at', datetime.utcnow().isoformat()))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update worked with error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to update partner")

@api_router.delete("/worked-with/{partner_id}")
async def delete_worked_with(partner_id: str, current_user_email: str = Depends(verify_token)):
    """Delete worked with partner (Admin only)"""
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Check if partner exists
        partner_ref = get_firebase_ref(f'worked_with/{partner_id}')
        partner_data = partner_ref.get()
        
        if not partner_data:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        # Delete from Firebase
        partner_ref.delete()
        
        logger.info(f"Deleted worked with partner: {partner_data.get('company_name', partner_id)}")
        return {"message": "Partner deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete worked with error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to delete partner")

# ================================================================================================
# CONTACT INFO ENDPOINTS - Manage contact information entries
# ================================================================================================

@api_router.get("/contact-info", response_model=List[ContactInfo])
async def get_contact_info():
    """Get all contact info entries"""
    try:
        contact_ref = get_firebase_ref('contact_info')
        contact_data = contact_ref.get() or {}
        
        contact_list = []
        for contact_id, data in contact_data.items():
            contact_list.append(ContactInfo(
                id=contact_id,
                label=data.get('label', ''),
                value=data.get('value', ''),
                contact_type=data.get('contact_type', ''),
                icon=data.get('icon', ''),
                display_order=data.get('display_order', 0),
                is_visible=data.get('is_visible', True),
                created_at=datetime.fromisoformat(data.get('created_at', datetime.utcnow().isoformat())),
                updated_at=datetime.fromisoformat(data.get('updated_at', datetime.utcnow().isoformat()))
            ))
        
        # Sort by display_order
        contact_list.sort(key=lambda x: x.display_order)
        
        logger.info(f"Retrieved {len(contact_list)} contact info entries")
        return contact_list
        
    except Exception as e:
        logger.error(f"Get contact info error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contact information")

@api_router.get("/contact-info/{contact_id}", response_model=ContactInfo)
async def get_contact_info_by_id(contact_id: str):
    """Get specific contact info entry by ID"""
    try:
        contact_ref = get_firebase_ref(f'contact_info/{contact_id}')
        data = contact_ref.get()
        
        if not data:
            raise HTTPException(status_code=404, detail="Contact info not found")
        
        return ContactInfo(
            id=contact_id,
            label=data.get('label', ''),
            value=data.get('value', ''),
            contact_type=data.get('contact_type', ''),
            icon=data.get('icon', ''),
            display_order=data.get('display_order', 0),
            is_visible=data.get('is_visible', True),
            created_at=datetime.fromisoformat(data.get('created_at', datetime.utcnow().isoformat())),
            updated_at=datetime.fromisoformat(data.get('updated_at', datetime.utcnow().isoformat()))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get contact info by ID error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contact information")

@api_router.post("/contact-info", response_model=ContactInfo)
async def create_contact_info(contact_data: ContactInfoCreate, current_user_email: str = Depends(verify_token)):
    """Create new contact info entry (Admin only)"""
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        contact_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        contact_entry = {
            'label': contact_data.label,
            'value': contact_data.value,
            'contact_type': contact_data.contact_type,
            'icon': contact_data.icon,
            'display_order': contact_data.display_order,
            'is_visible': contact_data.is_visible,
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        }
        
        # Save to Firebase
        contact_ref = get_firebase_ref(f'contact_info/{contact_id}')
        contact_ref.set(contact_entry)
        
        logger.info(f"Created contact info: {contact_data.label} ({contact_data.contact_type})")
        
        return ContactInfo(
            id=contact_id,
            label=contact_data.label,
            value=contact_data.value,
            contact_type=contact_data.contact_type,
            icon=contact_data.icon,
            display_order=contact_data.display_order,
            is_visible=contact_data.is_visible,
            created_at=now,
            updated_at=now
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create contact info error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create contact information")

@api_router.put("/contact-info/{contact_id}", response_model=ContactInfo)
async def update_contact_info(contact_id: str, contact_update: ContactInfoUpdate, current_user_email: str = Depends(verify_token)):
    """Update contact info entry (Admin only)"""
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Check if contact exists
        contact_ref = get_firebase_ref(f'contact_info/{contact_id}')
        existing_data = contact_ref.get()
        
        if not existing_data:
            raise HTTPException(status_code=404, detail="Contact info not found")
        
        # Prepare update data (only include non-None values)
        update_data = {}
        if contact_update.label is not None:
            update_data['label'] = contact_update.label
        if contact_update.value is not None:
            update_data['value'] = contact_update.value
        if contact_update.contact_type is not None:
            update_data['contact_type'] = contact_update.contact_type
        if contact_update.icon is not None:
            update_data['icon'] = contact_update.icon
        if contact_update.display_order is not None:
            update_data['display_order'] = contact_update.display_order
        if contact_update.is_visible is not None:
            update_data['is_visible'] = contact_update.is_visible
            
        # Always update the timestamp
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        # Update Firebase
        contact_ref.update(update_data)
        
        # Get updated data
        updated_data = contact_ref.get()
        
        logger.info(f"Updated contact info: {updated_data.get('label', contact_id)}")
        
        return ContactInfo(
            id=contact_id,
            label=updated_data.get('label', ''),
            value=updated_data.get('value', ''),
            contact_type=updated_data.get('contact_type', ''),
            icon=updated_data.get('icon', ''),
            display_order=updated_data.get('display_order', 0),
            is_visible=updated_data.get('is_visible', True),
            created_at=datetime.fromisoformat(updated_data.get('created_at', datetime.utcnow().isoformat())),
            updated_at=datetime.fromisoformat(updated_data.get('updated_at', datetime.utcnow().isoformat()))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update contact info error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to update contact information")

@api_router.delete("/contact-info/{contact_id}")
async def delete_contact_info(contact_id: str, current_user_email: str = Depends(verify_token)):
    """Delete contact info entry (Admin only)"""
    # Check if user is admin
    if current_user_email not in AUTHORIZED_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Check if contact exists
        contact_ref = get_firebase_ref(f'contact_info/{contact_id}')
        contact_data = contact_ref.get()
        
        if not contact_data:
            raise HTTPException(status_code=404, detail="Contact info not found")
        
        # Delete from Firebase
        contact_ref.delete()
        
        logger.info(f"Deleted contact info: {contact_data.get('label', contact_id)}")
        return {"message": "Contact info deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete contact info error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to delete contact information")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Initialize default data when server starts
    initialize_default_data()

@app.on_event("shutdown")
async def shutdown_event():
    # Firebase Admin SDK will clean up automatically
    pass
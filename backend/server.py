from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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
        else:
            # Use default credentials for development
            cred = credentials.ApplicationDefault()
        
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://julian-d-rozario-default-rtdb.asia-southeast1.firebasedatabase.app'
        })
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        # Initialize without credentials for now - will need service account key
        firebase_admin.initialize_app(options={
            'databaseURL': 'https://julian-d-rozario-default-rtdb.asia-southeast1.firebasedatabase.app'
        })

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
        # Verify the Firebase ID token
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Firebase token: {str(e)}")

# Firebase Realtime Database helper functions
def get_firebase_ref(path: str):
    return db.reference(path)

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

@app.on_event("shutdown")
async def shutdown_event():
    # Firebase Admin SDK will clean up automatically
    pass
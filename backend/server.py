from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
from google.auth.transport import requests
from google.oauth2 import id_token
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Google OAuth configuration
GOOGLE_CLIENT_ID = "474981062451-1kevsn9u6v4gjob0kmm0eog39fiae00h.apps.googleusercontent.com"
AUTHORIZED_EMAIL = "abirsabirhossain@gmail.com"


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Admin authentication models
class GoogleLoginRequest(BaseModel):
    google_token: str
    email: str
    name: str
    google_id: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    google_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: datetime = Field(default_factory=datetime.utcnow)

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

async def verify_google_token(token: str) -> dict:
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
            
        return idinfo
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

# Admin authentication endpoints
@api_router.post("/admin/google-login", response_model=TokenResponse)
async def google_login(login_data: GoogleLoginRequest):
    try:
        # Verify Google token
        google_user_info = await verify_google_token(login_data.google_token)
        
        # Check if email matches authorized email
        if google_user_info['email'] != AUTHORIZED_EMAIL:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only authorized users can access the admin panel."
            )
        
        # Check if user exists in database, if not create new user
        existing_user = await db.admin_users.find_one({"email": google_user_info['email']})
        
        if not existing_user:
            # Create new admin user
            admin_user = AdminUser(
                email=google_user_info['email'],
                name=google_user_info['name'],
                google_id=google_user_info['sub']
            )
            await db.admin_users.insert_one(admin_user.dict())
        else:
            # Update last login
            await db.admin_users.update_one(
                {"email": google_user_info['email']},
                {"$set": {"last_login": datetime.utcnow()}}
            )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": google_user_info['email']})
        
        return TokenResponse(
            access_token=access_token,
            username=google_user_info['name']
        )
        
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@api_router.get("/admin/verify")
async def verify_admin_token(current_user_email: str = Depends(verify_token)):
    # Get user from database
    user = await db.admin_users.find_one({"email": current_user_email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"username": user["name"], "email": user["email"]}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

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
async def shutdown_db_client():
    client.close()

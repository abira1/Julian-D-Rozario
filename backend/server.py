from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import aiomysql
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

# MySQL connection pool
mysql_pool = None

async def init_db():
    global mysql_pool
    mysql_pool = await aiomysql.create_pool(
        host='localhost',
        port=3306,
        user=os.environ.get('MYSQL_USER', 'dbuser'),
        password=os.environ.get('MYSQL_PASSWORD', 'dbpassword'),
        db=os.environ.get('MYSQL_DB', 'test_database'),
        minsize=1,
        maxsize=10,
        autocommit=True
    )

async def get_db_connection():
    return mysql_pool

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'julian-drozario-admin-panel-super-secret-jwt-key-2025')
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
        
        # Get database connection
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Check if user exists in database
                await cursor.execute("SELECT * FROM admin_users WHERE email = %s", (google_user_info['email'],))
                existing_user = await cursor.fetchone()
                
                if not existing_user:
                    # Create new admin user
                    admin_user = AdminUser(
                        email=google_user_info['email'],
                        name=google_user_info['name'],
                        google_id=google_user_info['sub']
                    )
                    await cursor.execute(
                        "INSERT INTO admin_users (id, email, name, google_id, created_at, last_login) VALUES (%s, %s, %s, %s, %s, %s)",
                        (admin_user.id, admin_user.email, admin_user.name, admin_user.google_id, admin_user.created_at, admin_user.last_login)
                    )
                else:
                    # Update last login
                    await cursor.execute(
                        "UPDATE admin_users SET last_login = %s WHERE email = %s",
                        (datetime.utcnow(), google_user_info['email'])
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
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT * FROM admin_users WHERE email = %s", (current_user_email,))
            user = await cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # user is a tuple: (id, email, name, google_id, created_at, last_login)
            return {"username": user[2], "email": user[1]}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(client_name=input.client_name)
    
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "INSERT INTO status_checks (id, client_name, timestamp) VALUES (%s, %s, %s)",
                (status_obj.id, status_obj.client_name, status_obj.timestamp)
            )
    
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT id, client_name, timestamp FROM status_checks")
            rows = await cursor.fetchall()
            
            status_checks = []
            for row in rows:
                status_checks.append(StatusCheck(
                    id=row[0],
                    client_name=row[1],
                    timestamp=row[2]
                ))
            
            return status_checks

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
async def startup_db_client():
    await init_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    global mysql_pool
    if mysql_pool:
        mysql_pool.close()
        await mysql_pool.wait_closed()
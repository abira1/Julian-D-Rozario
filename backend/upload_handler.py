"""
Image Upload Handler for Blog Posts
Handles image uploads with validation, optimization, and storage
"""

import os
import uuid
import shutil
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Configuration
UPLOAD_DIR = Path(__file__).parent / "uploads" / "blog_images"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_IMAGE_WIDTH = 1920
MAX_IMAGE_HEIGHT = 1080

# Create upload directory if it doesn't exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename with UUID"""
    ext = get_file_extension(original_filename)
    unique_id = str(uuid.uuid4())
    return f"{unique_id}.{ext}"

def optimize_image(image_path: Path, max_width: int = MAX_IMAGE_WIDTH, max_height: int = MAX_IMAGE_HEIGHT) -> None:
    """
    Optimize image:
    - Resize if too large
    - Convert to RGB if needed
    - Optimize file size
    """
    try:
        with Image.open(image_path) as img:
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if image is too large
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(image_path, optimize=True, quality=85)
            
        logger.info(f"✅ Image optimized: {image_path.name}")
    except Exception as e:
        logger.error(f"❌ Image optimization failed: {e}")
        raise

async def save_upload_file(upload_file: UploadFile) -> dict:
    """
    Save uploaded file to disk
    Returns: dict with success status, filename, and URL
    """
    try:
        # Validate file
        if not upload_file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not is_allowed_file(upload_file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content
        contents = await upload_file.read()
        file_size = len(contents)
        
        # Validate file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Generate unique filename
        unique_filename = generate_unique_filename(upload_file.filename)
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(contents)
        
        logger.info(f"✅ File saved: {unique_filename} ({file_size} bytes)")
        
        # Optimize image
        try:
            optimize_image(file_path)
        except Exception as e:
            logger.warning(f"⚠️ Image optimization failed, using original: {e}")
        
        # Generate URL
        image_url = f"/uploads/blog_images/{unique_filename}"
        
        return {
            "success": True,
            "filename": unique_filename,
            "url": image_url,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

def delete_image(filename: str) -> bool:
    """Delete image file from disk"""
    try:
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            file_path.unlink()
            logger.info(f"✅ Image deleted: {filename}")
            return True
        return False
    except Exception as e:
        logger.error(f"❌ Delete error: {e}")
        return False

def get_image_path(filename: str) -> Optional[Path]:
    """Get full path to image file"""
    file_path = UPLOAD_DIR / filename
    return file_path if file_path.exists() else None

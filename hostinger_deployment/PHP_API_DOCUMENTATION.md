# 📘 PHP API Documentation
## Julian D'Rozario Portfolio - Hostinger Deployment

---

## ✅ Complete PHP Backend Included

Your deployment package now includes a **full PHP API backend** that replaces the Python FastAPI backend. This allows the entire application to run on Hostinger shared hosting.

---

## 📂 Updated File Structure

```
public_html/
├── api/                            # ✅ NEW: PHP Backend API
│   ├── index.php                   # Main API router
│   ├── config.php                  # Configuration
│   ├── database.php                # Database handler
│   ├── auth.php                    # JWT authentication
│   ├── cors.php                    # CORS headers
│   ├── blogs.php                   # Blog endpoints
│   ├── categories.php              # Categories endpoint
│   ├── contact.php                 # Contact info endpoint
│   ├── authentication.php          # Login endpoints
│   ├── user.php                    # User profile endpoints
│   └── upload.php                  # Image upload endpoint
│
├── uploads/                        # ✅ NEW: Image uploads folder
│   └── blog_images/                # Blog images storage
│       └── *.jpg, *.png, ...       # Uploaded images
│
├── upload_image.php                # ✅ NEW: Legacy upload endpoint
├── .htaccess                       # ✅ UPDATED: API routing added
├── index.html                      # React app entry
└── static/                         # React bundles
    ├── css/
    └── js/
```

---

## 🔧 Configuration Required

### Step 1: Update Database Credentials

Edit `/public_html/api/config.php`:

```php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'u691568332_Juliandrozario');  // ← Your MySQL user
define('DB_PASS', 'Toiral185#4');                // ← Your MySQL password
define('DB_NAME', 'u691568332_toiraldbhub');     // ← Your MySQL database
```

### Step 2: Update JWT Secret

```php
// JWT Configuration (in config.php)
define('JWT_SECRET', 'your-super-secret-key-change-in-production');
// ☝️ Change this to a random secure string
```

Generate a secure key:
```bash
# On Linux/Mac
openssl rand -hex 32

# Or use online generator
# https://randomkeygen.com/
```

### Step 3: Update CORS Origins

```php
// CORS Configuration (in config.php)
define('ALLOWED_ORIGINS', [
    'https://drozario.blog',           // ← Your production domain
    'https://www.drozario.blog',       // ← www version
    'http://localhost:3000'            // ← Development (remove in production)
]);
```

---

## 🌐 API Endpoints

### Base URL
```
Production: https://drozario.blog/api
Development: http://localhost/api
```

### Public Endpoints (No Auth Required)

#### 1. Health Check
```
GET /api/
GET /api/health

Response:
{
  "status": "healthy",
  "database": "MySQL",
  "timestamp": "2025-01-16T10:30:00+00:00"
}
```

#### 2. Get All Blogs
```
GET /api/blogs
Query Parameters:
  - category (optional): Filter by category
  - featured (optional): true/false
  - limit (optional): Number of blogs (default: 10)
  - offset (optional): Pagination offset (default: 0)

Response:
{
  "blogs": [...],
  "total": 6
}
```

#### 3. Get Single Blog
```
GET /api/blogs/{id}

Response:
{
  "id": 1,
  "title": "Blog Title",
  "content": "...",
  ...
}
```

#### 4. Get Categories
```
GET /api/categories

Response:
[
  "Company Formation",
  "Immigration",
  "Business Development",
  ...
]
```

#### 5. Get Contact Info
```
GET /api/contact-info

Response:
[
  {
    "id": 1,
    "label": "Email",
    "value": "juliandrozario@gmail.com",
    "contact_type": "email"
  },
  ...
]
```

---

### Protected Endpoints (Auth Required)

#### Authentication Headers
```
Authorization: Bearer {jwt_token}
```

#### 6. User Login
```
POST /api/auth/firebase-user-login
Content-Type: application/json

Body:
{
  "firebase_token": "...",
  "user_data": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  }
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "User Name",
    "is_admin": false
  }
}
```

#### 7. Admin Login
```
POST /api/auth/firebase-admin-login
(Same as user login, but only allows authorized admin emails)

Authorized Admins:
- juliandrozario@gmail.com
- abirsabirhossain@gmail.com
```

#### 8. Get User Profile
```
GET /api/user/profile
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "firebase_uid": "...",
  "email": "user@example.com",
  "display_name": "User Name",
  "photo_url": "https://...",
  "is_admin": false,
  ...
}
```

#### 9. Update User Profile
```
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "display_name": "New Name",
  "bio": "My bio",
  "preferences": {...}
}

Response:
{
  "message": "Profile updated successfully"
}
```

---

### Admin Endpoints (Admin Access Required)

#### 10. Create Blog
```
POST /api/blogs
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "title": "Blog Title",
  "excerpt": "Short description",
  "content": "<p>Full content...</p>",
  "category": "Company Formation",
  "image_url": "https://...",
  "featured_image": "https://...",
  "is_featured": false,
  "status": "published",
  "tags": ["business", "dubai"]
}

Response:
{
  "id": 7,
  "message": "Blog created successfully"
}
```

#### 11. Update Blog
```
PUT /api/blogs/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json

Body:
{
  "title": "Updated Title",
  "content": "Updated content..."
}

Response:
{
  "message": "Blog updated successfully"
}
```

#### 12. Delete Blog
```
DELETE /api/blogs/{id}
Authorization: Bearer {admin_token}

Response:
{
  "message": "Blog deleted successfully"
}
```

#### 13. Upload Image
```
POST /api/upload-image
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Form Data:
  - image: (file)

Response:
{
  "success": true,
  "filename": "67fd9ce2-1234-5678.jpg",
  "url": "/uploads/blog_images/67fd9ce2-1234-5678.jpg",
  "size": 102400
}
```

#### 14. Legacy Upload (Backward Compatibility)
```
POST /upload_image.php
Content-Type: multipart/form-data

Form Data:
  - image: (file)

Response:
{
  "success": true,
  "filename": "67fd9ce2-1234-5678.jpg",
  "url": "/uploads/blog_images/67fd9ce2-1234-5678.jpg",
  "size": 102400
}
```

---

## 🔐 Authentication Flow

### JWT Token Structure

**Header:**
```json
{
  "typ": "JWT",
  "alg": "HS256"
}
```

**Payload:**
```json
{
  "email": "user@example.com",
  "firebase_uid": "abc123...",
  "is_admin": false,
  "exp": 1705501234  // Expiry timestamp (24 hours)
}
```

### Using JWT Tokens

```javascript
// Frontend example
const token = "eyJ0eXAiOiJKV1QiLCJhbGc...";

fetch('https://drozario.blog/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📤 Image Upload Configuration

### Upload Settings (in config.php)

```php
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/blog_images/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024);  // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
```

### Upload Folder Permissions

```bash
# Set correct permissions
chmod 755 uploads
chmod 755 uploads/blog_images
chmod 644 uploads/blog_images/*
```

### Image Optimization

The API automatically:
- Resizes large images (max 1920x1080)
- Converts RGBA to RGB
- Optimizes file size (85% quality)
- Generates unique filenames

---

## 🗄️ Database Schema

### Required Tables

Your MySQL database should have these tables:

#### 1. blogs
```sql
CREATE TABLE blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt VARCHAR(1000) NOT NULL,
    content LONGTEXT NOT NULL,
    image_url VARCHAR(500),
    featured_image VARCHAR(500),
    date DATE NOT NULL,
    read_time VARCHAR(20) DEFAULT '5 min read',
    category VARCHAR(100) NOT NULL,
    author VARCHAR(100) DEFAULT 'Julian D\'Rozario',
    tags JSON,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'published',
    slug VARCHAR(500) UNIQUE,
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    keywords VARCHAR(500),
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. user_profiles
```sql
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url VARCHAR(500),
    bio TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### 3. contact_info
```sql
CREATE TABLE contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(500) NOT NULL,
    contact_type VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'info',
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl https://drozario.blog/api/health

# Get blogs
curl https://drozario.blog/api/blogs

# Get single blog
curl https://drozario.blog/api/blogs/1

# Get categories
curl https://drozario.blog/api/categories

# Upload image (with auth)
curl -X POST https://drozario.blog/api/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Using Browser

```
Visit: https://drozario.blog/api/health
Should show: {"status":"healthy",...}
```

---

## 🐛 Troubleshooting

### Issue 1: API Returns 500 Error

**Check:**
1. Database credentials in `config.php`
2. Database tables exist
3. PHP error logs: `tail -f /var/log/php_errors.log`

**Fix:**
```bash
# Check PHP errors
tail -f /var/log/apache2/error.log

# Or enable debug mode in config.php
define('DEBUG_MODE', true);
```

---

### Issue 2: CORS Errors

**Symptoms:** Console shows "CORS policy" errors

**Fix:**
1. Add your domain to ALLOWED_ORIGINS in `config.php`
2. Ensure `cors.php` is loaded in all API files
3. Check `.htaccess` doesn't block OPTIONS requests

---

### Issue 3: Upload Fails

**Check:**
1. Folder permissions: `chmod 755 uploads/blog_images`
2. PHP upload limits: `upload_max_filesize` in php.ini
3. Directory is writable

**Fix:**
```bash
# Set correct permissions
chmod 755 uploads
chmod 755 uploads/blog_images

# Check PHP settings
php -i | grep upload_max_filesize
php -i | grep post_max_size
```

---

### Issue 4: JWT Token Invalid

**Symptoms:** "Invalid token" or "Authentication required"

**Fix:**
1. Check JWT_SECRET is set in `config.php`
2. Ensure token hasn't expired (24 hours)
3. Verify Authorization header format: `Bearer {token}`

---

## 📊 Performance Tips

### 1. Enable OpCache
```php
// In php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
```

### 2. Database Indexing
```sql
CREATE INDEX idx_status ON blogs(status);
CREATE INDEX idx_category ON blogs(category);
CREATE INDEX idx_date ON blogs(date);
CREATE INDEX idx_slug ON blogs(slug);
```

### 3. Caching
```php
// Add to config.php for production
header('Cache-Control: public, max-age=3600');
```

---

## 🔒 Security Checklist

- [x] JWT tokens with expiry
- [x] Admin email whitelist
- [x] SQL injection protection (PDO prepared statements)
- [x] File upload validation
- [x] CORS restrictions
- [x] XSS protection (via .htaccess)
- [x] Directory browsing disabled
- [x] Error messages sanitized

---

## ✅ What's Working

With this PHP backend, you now have:

- ✅ Blog CRUD operations
- ✅ User authentication (Firebase + JWT)
- ✅ Admin panel functionality
- ✅ Image upload system
- ✅ Category filtering
- ✅ Contact info API
- ✅ User profile management
- ✅ Database connectivity
- ✅ CORS handling
- ✅ Security headers

---

## 🎉 Complete Hostinger Deployment

Your deployment package is now **100% ready for Hostinger shared hosting**:

1. **Frontend** - React SPA (static files)
2. **Backend** - PHP API (no Python required)
3. **Database** - MySQL (Hostinger native)
4. **Uploads** - File storage system
5. **Configuration** - .htaccess with API routing

**Just upload and it works!** 🚀

---

**Last Updated:** January 2025  
**Version:** 2.0 (PHP Backend)  
**Status:** ✅ Production Ready

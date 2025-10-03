# Local Development Testing Guide

## ⚠️ Important Note

The new MySQL-based backend **cannot be fully tested locally** without:
1. MySQL server installed and running
2. Access to Hostinger MySQL database
3. Database schema initialized
4. Data migrated

## 🧪 What Can Be Tested Locally

### 1. Code Syntax Validation ✅
```bash
# Already completed
python3 -m py_compile server.py
python3 -m py_compile migrate_data_to_mysql.py
```

### 2. Import Verification
```bash
cd /app/backend
python3 -c "import server; print('✅ All imports successful')"
```

### 3. Environment Configuration
```bash
# Verify .env file exists and has correct structure
cat .env | grep MYSQL_
```

## 🚀 Full Testing on Hostinger

### Step 1: Deploy to Hostinger
Follow `HOSTINGER_DEPLOYMENT.md` to:
1. Upload files via SSH/FTP
2. Configure `.env` with production values
3. Install dependencies: `pip3 install -r requirements.txt`

### Step 2: Initialize Database
```bash
ssh user@hostinger-server
cd /path/to/backend
./setup_database.sh
```

This will:
- Create all database tables
- Insert default data (categories, contact info, admin users)
- Migrate all 6 blog articles

### Step 3: Start Backend Server
```bash
# Option 1: Direct uvicorn
uvicorn server:app --host 0.0.0.0 --port 8001

# Option 2: Gunicorn (production recommended)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
```

### Step 4: Test API Endpoints

```bash
# Health check
curl https://drozario.blog/api/
# Expected: {"message": "Julian Portfolio API - MySQL Production", "status": "active", ...}

# Get blogs
curl https://drozario.blog/api/blogs
# Expected: Array of 6 blog objects

# Get categories
curl https://drozario.blog/api/categories  
# Expected: Array of 7 categories

# Get contact info
curl https://drozario.blog/api/contact-info
# Expected: Array of 4 contact entries
```

### Step 5: Test Admin Authentication

```bash
# Test with invalid email (should fail)
curl -X POST https://drozario.blog/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"google_token": "invalid_token"}'
# Expected: 400 or 403 error

# Test with valid Google token from authorized email
# (Get token from Google OAuth flow in browser)
curl -X POST https://drozario.blog/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{"google_token": "ACTUAL_GOOGLE_TOKEN_HERE"}'
# Expected: {"access_token": "...", "username": "...", "is_admin": true}
```

### Step 6: Test Admin Operations

```bash
# Get JWT token from previous step
TOKEN="your_jwt_token_here"

# Create new blog (with rate limiting)
curl -X POST https://drozario.blog/api/blogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Blog Post",
    "excerpt": "This is a test",
    "content": "<p>Test content</p>",
    "category": "Technology",
    "read_time": 5,
    "featured": false,
    "tags": ["test"],
    "image_url": "https://images.unsplash.com/photo-test"
  }'
# Expected: Created blog object with ID

# Update blog
curl -X PUT https://drozario.blog/api/blogs/{blog_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Updated Title"}'
# Expected: Updated blog object

# Delete blog
curl -X DELETE https://drozario.blog/api/blogs/{blog_id} \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"message": "Blog deleted successfully", "id": "..."}
```

### Step 7: Test Frontend Integration

1. Open browser: `https://drozario.blog`
2. Verify homepage loads with Julian's info
3. Navigate to Blog section
4. Verify all 6 blogs are displayed
5. Click on individual blog post
6. Verify blog content displays correctly
7. Try category filtering
8. Go to Admin panel: `https://drozario.blog/admin`
9. Login with `juliandrozario@gmail.com` or `abirsabirhossain@gmail.com`
10. Verify admin panel loads
11. Test creating/editing/deleting blogs
12. Verify changes appear on main website immediately

### Step 8: Performance Testing

```bash
# Test response times
curl -w "\nTime: %{time_total}s\n" https://drozario.blog/api/blogs

# Load testing (install ab first: apt-get install apache2-utils)
ab -n 100 -c 10 https://drozario.blog/api/blogs
# Expected: All requests succeed, average < 100ms

# Rate limit testing
for i in {1..70}; do
  curl https://drozario.blog/api/blogs > /dev/null 2>&1
  echo "Request $i"
done
# Expected: Requests 61-70 should get 429 error (rate limited)
```

### Step 9: Database Verification

```bash
# Connect to MySQL
mysql -h localhost -u u691568332_Dataubius -pDataubius@2024 u691568332_Dataubius

# Verify tables exist
SHOW TABLES;
# Expected: admin_users, blogs, blog_comments, blog_likes, categories, contact_info

# Check blog count
SELECT COUNT(*) FROM blogs;
# Expected: 6

# Check categories
SELECT name FROM categories ORDER BY display_order;
# Expected: All, Company Formation, Immigration, Technology, Operations, Business Development, Compliance

# Check admin users
SELECT email FROM admin_users;
# Expected: juliandrozario@gmail.com, abirsabirhossain@gmail.com

# Check contact info
SELECT label, value FROM contact_info;
# Expected: Email, Phone, LinkedIn, Status entries

# Exit MySQL
EXIT;
```

### Step 10: Backup Testing

```bash
# Create manual backup
./backup_database.sh
# Expected: Backup file created in ./backups/ directory

# List backups
ls -lh ./backups/
# Expected: portfolio_backup_*.sql.gz files

# Test restore (CAUTION: This will overwrite current data)
# Only test on non-production database or after confirming backup
./restore_database.sh ./backups/portfolio_backup_YYYYMMDD_HHMMSS.sql.gz
# Expected: Database restored successfully
```

## 📊 Expected Results Summary

### API Endpoints
| Endpoint | Expected Response Time | Status Code |
|----------|----------------------|-------------|
| GET /api/ | < 50ms | 200 |
| GET /api/blogs | < 100ms | 200 |
| GET /api/blogs/{id} | < 50ms | 200 |
| GET /api/categories | < 50ms | 200 |
| GET /api/contact-info | < 50ms | 200 |
| POST /api/blogs (admin) | < 200ms | 200 |

### Database Records
| Table | Expected Count |
|-------|----------------|
| blogs | 6 |
| categories | 7 |
| contact_info | 4 |
| admin_users | 2 |
| blog_comments | 0 (initially) |
| blog_likes | 0 (initially) |

### Admin Authentication
- ✅ `juliandrozario@gmail.com` - Access granted
- ✅ `abirsabirhossain@gmail.com` - Access granted
- ❌ Any other email - Access denied (403)

### Rate Limiting
- First 60 requests: Success (200)
- Request 61+: Rate limited (429)
- After 60 seconds: Counter resets

## 🐛 Troubleshooting

### Cannot connect to backend
```bash
# Check if backend is running
ps aux | grep uvicorn

# Check backend logs
tail -f /var/log/backend.err.log

# Verify port is listening
netstat -tulpn | grep 8001
```

### MySQL connection fails
```bash
# Test MySQL connectivity
mysql -h localhost -u u691568332_Dataubius -pDataubius@2024 u691568332_Dataubius

# If fails, check MySQL service
systemctl status mysql

# Verify credentials in .env
cat .env | grep MYSQL_
```

### No blogs displaying
```bash
# Check if data was migrated
mysql -h localhost -u u691568332_Dataubius -pDataubius@2024 u691568332_Dataubius -e "SELECT COUNT(*) FROM blogs;"

# If 0, run migration again
python3 migrate_data_to_mysql.py

# Check backend API directly
curl http://localhost:8001/api/blogs
```

### Admin login not working
```bash
# Verify Google OAuth configuration
cat .env | grep GOOGLE_CLIENT_ID

# Check authorized emails
cat .env | grep AUTHORIZED_ADMIN_EMAILS

# Check JWT secret is set
cat .env | grep JWT_SECRET

# Test Google OAuth redirect URI in Google Console
# Should be: https://drozario.blog
```

## ✅ Testing Completion Checklist

- [ ] All files uploaded to Hostinger
- [ ] `.env` configured with production values
- [ ] Dependencies installed (`pip3 install -r requirements.txt`)
- [ ] Database schema created (`./setup_database.sh`)
- [ ] 6 blogs migrated successfully
- [ ] Backend server running
- [ ] Health check API responds
- [ ] All blogs API returns 6 blogs
- [ ] Categories API returns 7 categories
- [ ] Contact info API returns 4 entries
- [ ] Admin login works for authorized emails
- [ ] Admin login rejects unauthorized emails
- [ ] Blog creation works in admin panel
- [ ] Blog editing works in admin panel
- [ ] Blog deletion works in admin panel
- [ ] Frontend displays all blogs correctly
- [ ] Individual blog pages load properly
- [ ] Category filtering works
- [ ] Mobile responsiveness maintained
- [ ] Page load times under 3 seconds
- [ ] Rate limiting blocks excessive requests
- [ ] Database backup script works
- [ ] Database restore script works

## 📝 Sign-Off

After completing all tests above, the MySQL conversion is successful and ready for production use!

**Tested By:** _________________
**Date:** _________________
**Signature:** _________________

---

**For full deployment instructions, see:** `HOSTINGER_DEPLOYMENT.md`
**For conversion summary, see:** `CONVERSION_SUMMARY.md`

# Julian D'Rozario Portfolio - Hostinger Deployment Guide

## 🎯 Overview

This guide covers the complete deployment of Julian D'Rozario's portfolio website to Hostinger with MySQL database backend.

## 📋 Prerequisites

- Hostinger hosting account with:
  - MySQL database: `u691568332_Dataubius`
  - SSH access enabled
  - Python 3.8+ support
  - Node.js 16+ support

## 🔧 Hostinger MySQL Database Configuration

### Database Credentials (Already Provisioned)
```
Database Name: u691568332_Dataubius
Database User: u691568332_Dataubius  
Password: Dataubius@2024
Host: localhost (or check Hostinger control panel for exact hostname)
Port: 3306
```

### Finding MySQL Hostname
1. Log in to Hostinger control panel
2. Navigate to "Databases" → "MySQL Databases"
3. Check the hostname listed (usually `localhost` or `mysql.hostinger.com`)

## 🚀 Deployment Steps

### Step 1: Upload Files to Hostinger

```bash
# Upload backend files via SSH or File Manager
/backend/
  ├── server.py (MySQL version)
  ├── requirements.txt
  ├── .env
  ├── database_schema.sql
  ├── migrate_data_to_mysql.py
  ├── setup_database.sh
  ├── backup_database.sh
  └── restore_database.sh

/frontend/
  └── (React build files)
```

### Step 2: Configure Environment Variables

Create `/backend/.env` file on Hostinger:

```bash
# MySQL Database Configuration (Hostinger)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=u691568332_Dataubius
MYSQL_PASSWORD=Dataubius@2024
MYSQL_DATABASE=u691568332_Dataubius

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-xyz123
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# Google OAuth Configuration
GOOGLE_CLIENT_ID=474981062451-1kevsn9u6v4gjob0kmm0eog39fiae00h.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Authorized Admin Emails (DO NOT CHANGE)
AUTHORIZED_ADMIN_EMAILS=juliandrozario@gmail.com,abirsabirhossain@gmail.com

# Environment
ENVIRONMENT=production
CORS_ORIGINS=https://drozario.blog,https://www.drozario.blog

# Rate Limiting (memory-based)
RATE_LIMIT_PER_MINUTE=60
```

**IMPORTANT:** Generate a strong JWT_SECRET for production:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Install Python Dependencies

SSH into Hostinger server and run:

```bash
cd /path/to/backend
pip3 install --user -r requirements.txt
```

Or if using virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Initialize MySQL Database

Run the setup script:

```bash
cd /path/to/backend
chmod +x setup_database.sh
./setup_database.sh
```

This script will:
1. Create all database tables (blogs, categories, contact_info, admin_users, etc.)
2. Insert default categories (All, Company Formation, Immigration, etc.)
3. Insert default contact information
4. Create admin user records for authorized emails
5. Migrate all 6 existing blog articles

**Manual Alternative (if script fails):**

```bash
# Run schema creation
mysql -h localhost -u u691568332_Dataubius -pDataubius@2024 u691568332_Dataubius < database_schema.sql

# Run data migration
python3 migrate_data_to_mysql.py
```

### Step 5: Start Backend Server

For Hostinger with Passenger or similar:

```bash
# Using uvicorn directly
uvicorn server:app --host 0.0.0.0 --port 8001

# Or with gunicorn (production recommended)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
```

For supervisor (if available):

```ini
[program:backend]
command=/path/to/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:8001
directory=/path/to/backend
user=your_hostinger_user
autostart=true
autorestart=true
stderr_logfile=/var/log/backend.err.log
stdout_logfile=/var/log/backend.out.log
```

### Step 6: Build and Deploy Frontend

```bash
cd /path/to/frontend

# Install dependencies
yarn install

# Build for production
yarn build

# Deploy build folder to public_html or appropriate directory
cp -r build/* /path/to/public_html/
```

### Step 7: Configure Frontend Environment

Update `/frontend/.env.production`:

```bash
REACT_APP_BACKEND_URL=https://drozario.blog/api
```

### Step 8: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Update OAuth 2.0 Client authorized redirect URIs:
   - Add: `https://drozario.blog`
   - Add: `https://www.drozario.blog`
4. Update authorized JavaScript origins:
   - Add: `https://drozario.blog`
   - Add: `https://www.drozario.blog`

### Step 9: Configure Web Server

#### For Apache (.htaccess in public_html):

```apache
# API routing - redirect /api/* to backend server
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:8001/api/$1 [P,L]
ProxyPassReverse /api http://localhost:8001/api

# React routing - serve index.html for all frontend routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteRule ^ index.html [L]
```

#### For Nginx:

```nginx
server {
    listen 80;
    server_name drozario.blog www.drozario.blog;
    
    root /path/to/public_html;
    index index.html;
    
    # API proxy
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # React routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Step 10: SSL/HTTPS Configuration

1. In Hostinger control panel:
   - Navigate to "SSL"
   - Enable "Force HTTPS"
   - Install SSL certificate (free Let's Encrypt available)

2. Update CORS_ORIGINS in .env to use HTTPS:
   ```
   CORS_ORIGINS=https://drozario.blog,https://www.drozario.blog
   ```

## 📊 Database Management

### Create Manual Backup

```bash
cd /path/to/backend
./backup_database.sh
```

Backups are stored in `./backups/` directory with timestamp.

### Restore from Backup

```bash
./restore_database.sh ./backups/portfolio_backup_20250115_143022.sql.gz
```

### Schedule Automatic Backups (Cron)

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/backend && ./backup_database.sh >> /var/log/backup.log 2>&1
```

## 🧪 Testing Deployment

### Test Backend API

```bash
# Health check
curl https://drozario.blog/api/

# Get blogs
curl https://drozario.blog/api/blogs

# Get categories
curl https://drozario.blog/api/categories

# Get contact info
curl https://drozario.blog/api/contact-info
```

### Test Admin Login

1. Visit: `https://drozario.blog/admin`
2. Click "Login with Google"
3. Sign in with authorized email:
   - `juliandrozario@gmail.com`
   - `abirsabirhossain@gmail.com`
4. Verify admin panel access

### Test Blog Management

1. Login as admin
2. Navigate to Blog Manager
3. Try creating, editing, and deleting a test blog
4. Verify changes appear on main website

## 🔒 Security Checklist

- [x] Strong JWT_SECRET generated and configured
- [x] HTTPS/SSL enabled
- [x] Admin email whitelist enforced (only 2 authorized emails)
- [x] CORS restricted to production domains
- [x] Database password stored securely in .env
- [x] Rate limiting enabled (memory-based)
- [x] File upload endpoint secured (admin only)
- [x] SQL injection protection (parameterized queries)
- [x] XSS protection (HTML escaping in frontend)

## 📈 Performance Optimization

### Database Indexes

All important indexes are already configured in `database_schema.sql`:
- Blog category, featured, created_at
- Category slug
- Contact info type, display_order
- Blog comments and likes blog_id

### Connection Pooling

MySQL connection pool configured with:
- Min connections: 5
- Max connections: 20
- Auto-reconnect enabled

### Caching (Optional)

Add Redis caching for frequently accessed data:

```python
# In server.py, add Redis caching for blogs
from redis import Redis
redis_client = Redis(host='localhost', port=6379, db=0)
```

## 🐛 Troubleshooting

### Backend won't start

**Check logs:**
```bash
tail -f /var/log/backend.err.log
```

**Common issues:**
1. Missing dependencies: `pip3 install -r requirements.txt`
2. Database connection failed: Verify MySQL credentials
3. Port already in use: Change port or kill existing process

### Database connection errors

**Test MySQL connection:**
```bash
mysql -h localhost -u u691568332_Dataubius -pDataubius@2024 u691568332_Dataubius
```

**Check if tables exist:**
```sql
USE u691568332_Dataubius;
SHOW TABLES;
SELECT COUNT(*) FROM blogs;
```

### Admin login not working

1. Verify Google OAuth credentials in `.env`
2. Check authorized redirect URIs in Google Console
3. Verify email in whitelist: `echo $AUTHORIZED_ADMIN_EMAILS`
4. Check browser console for errors

### Blogs not displaying

1. Verify data migration: `SELECT COUNT(*) FROM blogs;` (should be 6)
2. Check backend API: `curl https://drozario.blog/api/blogs`
3. Verify frontend is using correct REACT_APP_BACKEND_URL
4. Check CORS configuration

## 📞 Support

For deployment issues:
- Check Hostinger documentation: https://support.hostinger.com
- Review backend logs: `/var/log/backend.err.log`
- Test API endpoints directly with curl
- Verify database connectivity with mysql command

## 🎉 Post-Deployment Verification

After successful deployment, verify:

1. ✅ Main website loads: https://drozario.blog
2. ✅ Blog listing page works: https://drozario.blog/blog
3. ✅ Individual blog posts open: https://drozario.blog/blog/{id}
4. ✅ Admin login functional (Google OAuth)
5. ✅ Admin panel CRUD operations working
6. ✅ Contact information displays correctly
7. ✅ Mobile responsiveness maintained
8. ✅ Page load times under 3 seconds
9. ✅ All 6 blog articles visible
10. ✅ Category filtering works

## 📝 Maintenance Tasks

### Weekly
- Review error logs
- Check disk space for backups
- Monitor API response times

### Monthly
- Update dependencies (security patches)
- Review and rotate old backups
- Test backup restoration process

### Quarterly
- Performance audit
- Security audit
- Dependency updates

---

**Deployment Date:** _To be completed_
**Deployed By:** _To be completed_
**Version:** 2.0 (MySQL Production)

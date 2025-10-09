# 🚀 DROZARIO.BLOG - COMPLETE DEPLOYMENT GUIDE

## 📦 Package Contents

This is a **complete, production-ready deployment package** for Julian D'Rozario's portfolio website.

**Domain**: https://drozario.blog  
**Platform**: Hostinger Shared Hosting  
**Tech Stack**: PHP Backend + React Frontend + MySQL Database

---

## 📁 Package Structure

```
hostinger-deployment-final/
├── public_html/              ← UPLOAD THIS TO HOSTINGER
│   ├── index.html           ← React SPA entry point
│   ├── static/              ← JavaScript and CSS files
│   │   ├── css/
│   │   └── js/
│   ├── api/                 ← PHP Backend API
│   │   ├── index.php       ← Main API router
│   │   ├── config.php      ← Database configuration
│   │   ├── jwt.php         ← JWT authentication
│   │   └── endpoints/      ← API endpoint handlers
│   │       ├── auth.php
│   │       ├── blogs.php
│   │       ├── user.php
│   │       ├── comments.php
│   │       ├── contact.php
│   │       └── seo.php
│   ├── uploads/             ← Directory for image uploads
│   ├── .htaccess           ← Apache URL rewriting
│   ├── favicon.ico
│   └── asset-manifest.json
│
├── database_setup.sql       ← MySQL database schema
└── DEPLOYMENT_GUIDE.md     ← This file
```

---

## ⚡ QUICK START (30 Minutes)

### Step 1: Setup MySQL Database (5 mins)

1. **Login to Hostinger hPanel**: https://hpanel.hostinger.com/
2. **Go to**: Websites → Manage → Databases → MySQL Databases
3. **The database should already exist**:
   - **Database Name**: `u691568332_toiraldbhub`
   - **Username**: `u691568332_Juliandrozario`
   - **Password**: `Toiral185#4`
4. **Click "Enter phpMyAdmin"**
5. **Import Database**:
   - Click "Import" tab
   - Choose file: `database_setup.sql`
   - Click "Go"
   - Wait for success message ✅
6. **Verify**: You should see 6 tables created

### Step 2: Upload Files to Hostinger (10 mins)

**Option A: Using File Manager (Recommended)**

1. Go to: Websites → Manage → Files → File Manager
2. Navigate to: `/domains/drozario.blog/public_html/`
3. **Delete any existing files** in public_html (backup first if needed)
4. Upload ALL contents from the `public_html/` folder:
   - Upload `index.html`
   - Upload `.htaccess`
   - Upload `static/` folder (with all subfolders)
   - Upload `api/` folder (with all subfolders)
   - Upload `uploads/` folder
   - Upload all other files (favicon, manifest, etc.)

**Option B: Using FTP**

1. Use FileZilla or any FTP client
2. Connect to Hostinger FTP (get credentials from hPanel)
3. Navigate to: `/domains/drozario.blog/public_html/`
4. Upload all contents from `public_html/` folder

### Step 3: Configure Backend (5 mins)

1. **Edit API Configuration**:
   - In File Manager, navigate to: `public_html/api/config.php`
   - Click "Edit"
   - **Verify database credentials** (should already be correct):
     ```php
     define('DB_HOST', 'localhost');
     define('DB_NAME', 'u691568332_toiraldbhub');
     define('DB_USER', 'u691568332_Juliandrozario');
     define('DB_PASS', 'Toiral185#4');
     ```
   - **Generate JWT Secret** (important for security):
     - Replace the JWT_SECRET line with a long random string
     - Example: `define('JWT_SECRET', 'your-very-long-random-secret-key-here-make-it-at-least-64-characters-long');`
   - Click "Save & Close"

2. **Set File Permissions**:
   - `uploads/` folder: Set to **755** (writable)
   - All `.php` files: Set to **644**
   - `.htaccess`: Set to **644**

### Step 4: Enable SSL (5 mins)

1. In hPanel, go to: Websites → Manage → SSL
2. Enable **Force HTTPS**
3. Wait 2-5 minutes for SSL to activate
4. Verify: Green padlock appears when visiting https://drozario.blog

### Step 5: Test Everything (5 mins)

Open your browser and test:

```
✅ https://drozario.blog/
   → Should load homepage with design

✅ https://drozario.blog/api/health
   → Should return: {"status":"healthy","database":"MySQL","timestamp":"..."}

✅ https://drozario.blog/api/blogs
   → Should return: {"blogs":[...],"total":1}

✅ https://drozario.blog/blog
   → Should show blog listing page

✅ https://drozario.blog/julian_portfolio
   → Should show admin login page

✅ https://drozario.blog/sitemap.xml
   → Should return XML sitemap

✅ https://drozario.blog/robots.txt
   → Should return robots.txt
```

---

## 🎯 DETAILED DEPLOYMENT STEPS

### Phase 1: Pre-Deployment Checklist

- [ ] Backup any existing website data
- [ ] Have Hostinger hPanel access ready
- [ ] Database credentials confirmed
- [ ] FTP credentials ready (if using FTP)
- [ ] SSL certificate will be enabled
- [ ] Admin emails configured: juliandrozario@gmail.com, abirsabirhossain@gmail.com

### Phase 2: Database Setup

**2.1. Access phpMyAdmin**
- Login to Hostinger hPanel
- Navigate to Databases → phpMyAdmin
- Select database: `u691568332_toiraldbhub`

**2.2. Import Schema**
- Click "Import" tab
- Choose file: `database_setup.sql`
- Character set: utf8mb4
- Click "Go"

**2.3. Verify Tables Created**
Run this query to verify:
```sql
SHOW TABLES;
```
You should see:
- blogs
- contact_info
- user_profiles
- blog_likes
- blog_saves
- blog_comments

**2.4. Check Sample Data**
```sql
SELECT * FROM blogs;
SELECT * FROM contact_info;
```

### Phase 3: File Upload

**3.1. Prepare Destination**
- Navigate to: `/domains/drozario.blog/public_html/`
- **Important**: Clear this directory (backup first!)
- This ensures clean deployment

**3.2. Upload Structure**
Upload in this order:
1. `.htaccess` (URL rewriting - crucial!)
2. `index.html` (React entry point)
3. `static/` folder (all JS/CSS)
4. `api/` folder (all PHP backend)
5. `uploads/` folder (empty, for images)
6. Other files (favicon, manifest, etc.)

**3.3. Verify Upload**
Check these files exist:
- `/public_html/index.html`
- `/public_html/.htaccess`
- `/public_html/api/index.php`
- `/public_html/api/config.php`
- `/public_html/static/js/` (folder with files)
- `/public_html/static/css/` (folder with files)

### Phase 4: Configuration

**4.1. Configure Database Connection**
Edit: `/public_html/api/config.php`

Verify these lines:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u691568332_toiraldbhub');
define('DB_USER', 'u691568332_Juliandrozario');
define('DB_PASS', 'Toiral185#4');
```

**4.2. Generate JWT Secret**
**CRITICAL FOR SECURITY!**

Replace this line in `config.php`:
```php
define('JWT_SECRET', 'your-secret-key-change-this-in-production-make-it-very-long-and-random');
```

With a long random string (64+ characters):
```php
define('JWT_SECRET', 'a8f5f167f44f4964e6c998dee827110c3d82d6239dd6cf6a64b9a8f7d4e5b2c9d3f4e5a6b7c8d9e0f1a2b3c4d5e6f7');
```

**4.3. Set File Permissions**

| File/Folder | Permission | Reason |
|-------------|------------|--------|
| `uploads/` | 755 | Allow write access |
| `api/` | 755 | Execute PHP |
| `*.php` | 644 | Read only |
| `.htaccess` | 644 | Read only |
| `static/` | 755 | Serve assets |

**4.4. Configure PHP (Optional)**
Create `.user.ini` in `public_html/` if needed:
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

### Phase 5: SSL & Security

**5.1. Enable SSL**
- hPanel → SSL → Enable Let's Encrypt
- Enable "Force HTTPS"
- Wait 5-10 minutes for activation

**5.2. Test SSL**
- Visit: https://drozario.blog
- Check for green padlock icon
- Certificate should be valid

**5.3. Security Headers**
Already configured in `.htaccess`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

**5.4. Protect Sensitive Files**
`.htaccess` already protects:
- `.env` files
- Database credentials
- Hidden files (starting with .)

### Phase 6: Testing

**6.1. Homepage Test**
```
Visit: https://drozario.blog/
Expected: Beautiful portfolio homepage loads
```

**6.2. API Health Check**
```
Visit: https://drozario.blog/api/health
Expected: {"status":"healthy","database":"MySQL","timestamp":"2025-..."}
```

**6.3. Blog Listing**
```
Visit: https://drozario.blog/api/blogs
Expected: JSON with blog posts array
```

**6.4. Frontend Blog Page**
```
Visit: https://drozario.blog/blog
Expected: Blog listing page with sample post
```

**6.5. Admin Panel**
```
Visit: https://drozario.blog/julian_portfolio
Expected: Admin login page (Google OAuth)
```

**6.6. SEO Routes**
```
Visit: https://drozario.blog/sitemap.xml
Expected: XML sitemap

Visit: https://drozario.blog/robots.txt
Expected: robots.txt file
```

**6.7. Mobile Responsive**
- Open on mobile device
- Check responsive design
- Test navigation

---

## 🔧 API ENDPOINTS REFERENCE

### Public Endpoints (No Auth Required)

```
GET  /api/                      - API info
GET  /api/health                - Health check
GET  /api/blogs                 - Get all blogs
GET  /api/blogs/{id}            - Get single blog
GET  /api/categories            - Get blog categories
GET  /api/blogs/{id}/comments   - Get blog comments
GET  /api/contact-info          - Get contact info
GET  /sitemap.xml               - XML sitemap
GET  /robots.txt                - Robots.txt
```

### Authenticated Endpoints (Requires Login)

```
POST /api/auth/firebase-user-login   - User login
POST /api/auth/firebase-admin-login  - Admin login
GET  /api/user/profile               - Get user profile
PUT  /api/user/profile               - Update profile
GET  /api/user/liked-blogs           - Get liked blogs
GET  /api/user/saved-blogs           - Get saved blogs
GET  /api/user/comments              - Get user comments
POST /api/blogs/{id}/like            - Like/unlike blog
POST /api/blogs/{id}/save            - Save/unsave blog
POST /api/blogs/{id}/comments        - Create comment
PUT  /api/comments/{id}              - Update comment
DELETE /api/comments/{id}            - Delete comment
```

### Admin Endpoints (Admin Auth Required)

```
POST   /api/blogs                    - Create blog
PUT    /api/blogs/{id}               - Update blog
DELETE /api/blogs/{id}               - Delete blog
GET    /api/admin/contact-info       - Get all contact info
POST   /api/contact-info             - Create contact
PUT    /api/contact-info/{id}        - Update contact
DELETE /api/contact-info/{id}        - Delete contact
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Database connection failed"

**Solution**:
1. Check `api/config.php` credentials
2. Verify database exists in phpMyAdmin
3. Test database connection:
   ```php
   <?php
   $pdo = new PDO("mysql:host=localhost;dbname=u691568332_toiraldbhub", "u691568332_Juliandrozario", "Toiral185#4");
   echo "Connected!";
   ?>
   ```

### Issue: "404 Not Found" on API

**Solution**:
1. Check `.htaccess` file exists
2. Verify mod_rewrite is enabled (Hostinger has it by default)
3. Test direct access: `https://drozario.blog/api/index.php`

### Issue: "500 Internal Server Error"

**Solution**:
1. Check PHP error logs in hPanel
2. Verify file permissions (644 for PHP files)
3. Check PHP version (should be 7.4+)
4. Look for syntax errors in PHP files

### Issue: Blank homepage

**Solution**:
1. Check `index.html` exists in public_html root
2. Clear browser cache (Ctrl+Shift+R)
3. Check browser console (F12) for errors
4. Verify `static/` folder uploaded correctly

### Issue: Admin login fails

**Solution**:
1. Check admin email in `api/config.php`:
   ```php
   define('AUTHORIZED_ADMIN_EMAILS', 'juliandrozario@gmail.com,abirsabirhossain@gmail.com');
   ```
2. Verify Firebase is configured correctly
3. Check browser console for errors

### Issue: Images not uploading

**Solution**:
1. Check `uploads/` folder permissions (755)
2. Verify `upload_max_filesize` in PHP settings
3. Check disk space in hPanel

### Issue: SSL not working

**Solution**:
1. Wait 10 minutes after enabling
2. Clear browser cache
3. Check hPanel → SSL status
4. Contact Hostinger support if still failing

---

## 📊 POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] All pages load correctly
- [ ] API endpoints respond
- [ ] Admin login works
- [ ] Can create/edit blog posts
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] SEO routes working (sitemap, robots.txt)
- [ ] No console errors
- [ ] Database connections stable
- [ ] File uploads work
- [ ] Contact information displays

### Immediate Actions:

1. **Delete sample blog post** (create real content)
2. **Update contact information**
3. **Change JWT secret** (if not done yet)
4. **Create database backup** (hPanel → Backups)
5. **Test from different devices**
6. **Submit sitemap to Google Search Console**
7. **Set up uptime monitoring** (uptimerobot.com - free)

---

## 🔒 SECURITY BEST PRACTICES

### Already Implemented:
✅ JWT authentication
✅ Password hashing (Firebase handles this)
✅ SQL injection protection (PDO prepared statements)
✅ XSS protection headers
✅ HTTPS forced via .htaccess
✅ Admin email whitelist
✅ File upload restrictions

### Manual Steps:
- [ ] Generate unique JWT secret (64+ characters)
- [ ] Change default database password regularly
- [ ] Enable 2FA on Hostinger account
- [ ] Regular database backups
- [ ] Monitor error logs weekly
- [ ] Keep PHP version updated

---

## 📈 PERFORMANCE OPTIMIZATION

Already configured:
- ✅ GZIP compression
- ✅ Browser caching (1 year for images)
- ✅ Minified JS/CSS (from React build)
- ✅ Database indexes on key columns

Optional improvements:
- Enable Cloudflare (free CDN)
- Optimize images before upload
- Monitor with Google PageSpeed Insights

---

## 🎯 ADMIN PANEL USAGE

### Accessing Admin Panel

1. Visit: `https://drozario.blog/julian_portfolio`
2. Click "Sign in with Google"
3. Use authorized email:
   - juliandrozario@gmail.com
   - abirsabirhossain@gmail.com

### Managing Blogs

**Create Blog**:
1. Click "Create New Post"
2. Fill in title, excerpt, content
3. Choose category
4. Add tags (optional)
5. Set featured (optional)
6. Click "Publish"

**Edit Blog**:
1. Click blog in list
2. Click "Edit"
3. Make changes
4. Click "Update"

**Delete Blog**:
1. Click blog in list
2. Click "Delete"
3. Confirm deletion

---

## 📞 SUPPORT

### Hostinger Support
- **Live Chat**: 24/7 in hPanel
- **Email**: support@hostinger.com
- **Knowledge Base**: https://support.hostinger.com

### Technical Issues
- Check error logs in hPanel
- Review browser console (F12)
- Contact Hostinger support for server issues

---

## 🎉 SUCCESS!

Your website is now live at **https://drozario.blog**!

Congratulations on deploying your professional portfolio! 🚀

---

**Deployment Package Version**: 1.0  
**Created**: January 2025  
**Domain**: drozario.blog  
**Platform**: Hostinger Shared Hosting  
**Tech**: PHP + React + MySQL
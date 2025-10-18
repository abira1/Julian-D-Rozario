# 🔧 Hostinger Deployment Fixes - Julian D'Rozario Portfolio

## Issues Identified & Solutions

### 🔴 ISSUE 1: Google Sign-Up Not Working

**Root Cause:** The frontend was built with a placeholder Google Client ID instead of a real one.

**Evidence:** Found in built JavaScript: `REACT_APP_GOOGLE_CLIENT_ID:"your_google_client_id_here"`

**Solution:**

#### Step 1: Get Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to: **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth Client ID**
5. Choose **Web application**
6. Configure:
   - **Name:** Julian Portfolio
   - **Authorized JavaScript origins:**
     ```
     https://drozario.blog
     https://www.drozario.blog
     ```
   - **Authorized redirect URIs:**
     ```
     https://drozario.blog
     https://www.drozario.blog
     https://drozario.blog/julian_portfolio
     ```
7. Click **Create** and copy the **Client ID**

#### Step 2: Update Frontend Configuration

**Option A: Rebuild Frontend (Recommended)**

1. On your local machine, update `/app/frontend/.env.production`:
   ```env
   REACT_APP_BACKEND_URL=https://drozario.blog/api
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_ANALYTICS=true
   REACT_APP_ENABLE_CONTACT_FORM=true
   ```

2. Rebuild the frontend:
   ```bash
   cd /app/frontend
   yarn build
   ```

3. Copy new build to deployment folder:
   ```bash
   rm -rf /app/hostinger_deployment/public_html/static/*
   rm /app/hostinger_deployment/public_html/index.html
   rm /app/hostinger_deployment/public_html/asset-manifest.json
   
   cp -r build/static/* /app/hostinger_deployment/public_html/static/
   cp build/index.html /app/hostinger_deployment/public_html/
   cp build/asset-manifest.json /app/hostinger_deployment/public_html/
   ```

4. Re-upload to Hostinger

**Option B: Quick Fix via Hostinger (Not Recommended - harder to maintain)**

This would require manually editing the minified JavaScript files which is not practical.

---

### 🔴 ISSUE 2: Database Not Connected / Blogs Not Showing

**Root Cause:** Database might not be properly imported or API configuration issues

**Solution:**

#### Step 1: Verify Database Import on Hostinger

1. Login to Hostinger → **Databases** → **phpMyAdmin**
2. Select database: `u691568332_toiraldbhub`
3. Check if these tables exist:
   - `blogs`
   - `user_profiles`
   - `contact_info`
   - `blog_likes`
   - `blog_saves`
   - `blog_comments`

4. If tables don't exist, run the SQL from:
   `/app/hostinger_deployment/database_schema.sql`

#### Step 2: Verify Sample Data

Run this query in phpMyAdmin:
```sql
SELECT COUNT(*) as blog_count FROM blogs;
```

If count is 0, the sample data wasn't inserted. Re-run the INSERT statements from `database_schema.sql`.

#### Step 3: Test PHP API Endpoints

Test these URLs in your browser:

1. **Health Check:**
   ```
   https://drozario.blog/api/
   ```
   Expected: `{"message":"Julian D'Rozario Portfolio API","status":"running","database":"MySQL","version":"2.0.0"}`

2. **Get All Blogs:**
   ```
   https://drozario.blog/api/blogs
   ```
   Expected: JSON array with blog data

3. **Get Categories:**
   ```
   https://drozario.blog/api/categories
   ```
   Expected: JSON array with categories

If any of these fail:

**Check API error logs:**
```bash
# On Hostinger via SSH
tail -f /path/to/your/public_html/error.log
```

Or check through Hostinger File Manager → look for error logs

#### Step 4: Update JWT Secret (CRITICAL SECURITY FIX)

1. Open `/app/hostinger_deployment/public_html/api/config.php`
2. Find line 20:
   ```php
   define('JWT_SECRET', 'your-super-secret-key-change-in-production');
   ```

3. Generate a secure key:
   ```bash
   openssl rand -hex 32
   ```
   Or visit: https://randomkeygen.com/

4. Replace with generated key:
   ```php
   define('JWT_SECRET', 'your-generated-secure-key-here');
   ```

5. Save and upload to Hostinger

---

### 🔴 ISSUE 3: CORS / Backend URL Configuration

**Verification:**

Check if `/app/hostinger_deployment/public_html/api/config.php` has correct settings:

```php
// CORS Configuration (Lines 31-35)
define('ALLOWED_ORIGINS', [
    'https://drozario.blog',
    'https://www.drozario.blog',
    'http://localhost:3000' // Development
]);
```

This looks correct. If still having issues, check:

1. **.htaccess file exists** in `/public_html/`
2. **mod_rewrite is enabled** on your Hostinger hosting
3. **API folder permissions** are correct (755 for directories, 644 for files)

---

## 🧪 Complete Testing Checklist

After applying all fixes:

### 1. Database Tests (via phpMyAdmin)

```sql
-- Check tables exist
SHOW TABLES;

-- Check blog count
SELECT COUNT(*) FROM blogs;

-- Check if blogs are published
SELECT id, title, status FROM blogs LIMIT 5;

-- Check user_profiles table
SELECT id, email, is_admin FROM user_profiles;
```

### 2. API Tests (Browser or Postman)

✅ `GET https://drozario.blog/api/`
✅ `GET https://drozario.blog/api/blogs`
✅ `GET https://drozario.blog/api/categories`
✅ `GET https://drozario.blog/api/contact-info`

### 3. Frontend Tests

1. **Homepage:** https://drozario.blog
   - Should load without errors
   - Check browser console (F12) for errors

2. **Blog Listing:** https://drozario.blog/blog
   - Should show blog cards
   - Click on a blog to view details

3. **Admin Login:** https://drozario.blog/julian_portfolio
   - Click "Sign in with Google"
   - Should show Google login popup
   - Login with authorized email

4. **After Admin Login:**
   - Should redirect to admin dashboard
   - Should see blog stats
   - Should be able to create/edit blogs

### 4. Browser Console Check

Open Developer Tools (F12) → Console Tab

**Should NOT see:**
- ❌ "Failed to fetch"
- ❌ "Network error"
- ❌ "CORS policy" errors
- ❌ "Invalid Google Client ID"

**Expected warnings (OK to ignore):**
- ⚠️ Source map warnings
- ⚠️ React DevTools messages

---

## 🚀 Quick Fix Commands Summary

If you have SSH access to Hostinger:

```bash
# 1. Navigate to your public_html folder
cd /home/u691568332/domains/drozario.blog/public_html

# 2. Check if API files exist
ls -la api/

# 3. Set correct permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# 4. Check .htaccess exists
ls -la .htaccess

# 5. Test PHP syntax
php -l api/index.php
php -l api/config.php
php -l api/database.php
```

---

## 📞 If Issues Persist

### Debug Steps:

1. **Enable Error Display** (temporarily):
   Edit `/app/hostinger_deployment/public_html/api/config.php`:
   ```php
   define('DEBUG_MODE', true); // Change to true
   ```

2. **Check PHP Error Logs:**
   - Location varies by host
   - Check Hostinger panel → Error Logs
   - Or look for `error_log` file in public_html

3. **Test Database Connection:**
   Create test file `test_db.php`:
   ```php
   <?php
   $host = 'localhost';
   $user = 'u691568332_Juliandrozario';
   $pass = 'Toiral185#4';
   $db = 'u691568332_toiraldbhub';
   
   try {
       $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
       echo "✅ Database connection successful!";
   } catch(PDOException $e) {
       echo "❌ Connection failed: " . $e->getMessage();
   }
   ?>
   ```
   
   Access: `https://drozario.blog/test_db.php`
   (Delete after testing!)

---

## 📋 Files That Need Updates

### Critical:
1. ✅ `/app/hostinger_deployment/public_html/api/config.php` (JWT_SECRET)
2. ✅ Rebuild frontend with real Google Client ID
3. ✅ Verify database imported via phpMyAdmin

### Optional:
- Update CORS origins if using different domains
- Add more authorized admin emails in config.php

---

## 🎯 Priority Order

1. **FIRST:** Get Google OAuth Client ID and rebuild frontend
2. **SECOND:** Verify database is imported and has data
3. **THIRD:** Update JWT_SECRET in config.php
4. **FOURTH:** Test all API endpoints
5. **FIFTH:** Test complete user flow (view blogs → login → admin panel)

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ https://drozario.blog shows homepage with content
2. ✅ /blog page shows list of blog articles
3. ✅ Clicking "Sign in with Google" opens Google login popup
4. ✅ After login, admin dashboard shows blog stats
5. ✅ Admin can create/edit/delete blogs
6. ✅ No console errors in browser DevTools

---

**Last Updated:** $(date)
**Database:** u691568332_toiraldbhub
**Domain:** drozario.blog

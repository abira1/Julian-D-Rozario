# 🔴 WHY IS IT NOT WORKING? - Troubleshooting Guide

## Your Issue: Site Not Working After Upload

**Database:** u691568332_toiraldbhub ✅ Available  
**User:** u691568332_Juliandrozario ✅ Available  
**Domain:** drozario.blog ✅ Available  

---

## 🎯 MOST LIKELY CAUSE: Database Tables Don't Exist

The database exists, but the **TABLES are not created yet**. This is why the API will fail.

---

## ✅ SOLUTION: Create Database Tables

### Step 1: Login to phpMyAdmin

1. Login to **Hostinger hPanel**
2. Go to **Databases** → **phpMyAdmin**
3. Click on database: **u691568332_toiraldbhub**

### Step 2: Import SQL Schema

1. Click **"Import"** tab at the top
2. Click **"Choose File"**
3. Select: `/app/hostinger_deployment/database_schema.sql`
4. Click **"Go"** at bottom
5. Wait for success message

**OR** 

### Step 2 (Alternative): Run SQL Manually

1. Click **"SQL"** tab at the top
2. Copy and paste the entire content from `database_schema.sql`
3. Click **"Go"**
4. Wait for tables to be created

---

## 🔍 How to Verify Tables Exist

### Method 1: phpMyAdmin
1. Select database: **u691568332_toiraldbhub**
2. Look at left sidebar
3. You should see these tables:
   - ✅ blogs
   - ✅ user_profiles
   - ✅ contact_info
   - ✅ blog_likes
   - ✅ blog_saves
   - ✅ blog_comments

### Method 2: Run SQL Query
```sql
SHOW TABLES;
```

Should return 6 tables.

---

## 🐛 Other Possible Issues

### Issue 2: Wrong Database Name

**Check in phpMyAdmin:**
- Is database name exactly: `u691568332_toiraldbhub`?
- Any typos?

**If different, update:**
File: `public_html/api/config.php` Line 16
```php
define('DB_NAME', 'YOUR_ACTUAL_DATABASE_NAME');
```

---

### Issue 3: Wrong Database User

**Check credentials:**
- Username: `u691568332_Juliandrozario`
- Password: `Toiral185#4`

**Test connection:**
1. phpMyAdmin → Home
2. Try logging in with these credentials
3. If fails, password is wrong

**If wrong, update:**
File: `public_html/api/config.php` Lines 14-15
```php
define('DB_USER', 'YOUR_ACTUAL_USERNAME');
define('DB_PASS', 'YOUR_ACTUAL_PASSWORD');
```

---

### Issue 4: .htaccess Not Uploaded

**Check if .htaccess exists:**
1. Hostinger File Manager
2. Navigate to `public_html/`
3. Click **"Settings"** → Enable **"Show Hidden Files"**
4. Look for `.htaccess` file

**If missing:**
- Re-upload from `/app/hostinger_deployment/public_html/.htaccess`

---

### Issue 5: Wrong File Permissions

**Set correct permissions via File Manager:**

**Folders (755):**
- public_html/
- public_html/api/
- public_html/uploads/
- public_html/uploads/blog_images/
- public_html/static/

**Files (644):**
- public_html/.htaccess
- public_html/*.php
- public_html/api/*.php

---

### Issue 6: PHP Version Too Old

**Check PHP version:**
1. Hostinger hPanel
2. Advanced → PHP Configuration
3. Should be **PHP 7.4** or higher

**If lower:**
- Change to PHP 8.0 or 8.1

---

### Issue 7: SSL Not Enabled

**Enable SSL:**
1. Hostinger hPanel
2. Advanced → SSL
3. Install **Free SSL (Let's Encrypt)**
4. Wait 10 minutes

---

### Issue 8: DNS Not Pointing to Hostinger

**Check DNS:**
1. Visit: https://www.whatsmydns.net/
2. Enter: drozario.blog
3. Type: A
4. Should point to Hostinger IP

**If not:**
- Update nameservers at domain registrar
- Point to Hostinger nameservers

---

## 🧪 Testing After Fix

### Test 1: API Health Check
```
Visit: https://drozario.blog/api/health

Expected Response:
{
  "status": "healthy",
  "database": "MySQL",
  "timestamp": "2025-01-16T..."
}

If Error: Database connection failed - Check credentials
```

### Test 2: Get Blogs
```
Visit: https://drozario.blog/api/blogs

Expected Response:
{
  "blogs": [
    {
      "id": 1,
      "title": "Complete Guide to Company Formation...",
      ...
    }
  ],
  "total": 3
}

If Error: Table 'blogs' doesn't exist - Run database_schema.sql
```

### Test 3: Homepage
```
Visit: https://drozario.blog

Expected: Homepage loads with no errors

If Blank: Check .htaccess exists
If 500 Error: Check PHP error logs
```

---

## 📋 Complete Checklist

Run through this checklist:

**Database:**
- [ ] Database `u691568332_toiraldbhub` exists
- [ ] Tables are created (run `database_schema.sql`)
- [ ] Credentials in `config.php` are correct
- [ ] Can login to phpMyAdmin with credentials

**Files:**
- [ ] All files uploaded to `public_html/`
- [ ] `.htaccess` file exists (show hidden files)
- [ ] `api/` folder with all PHP files
- [ ] `uploads/blog_images/` folder exists

**Configuration:**
- [ ] JWT_SECRET changed in `config.php`
- [ ] Database credentials verified in `config.php`
- [ ] CORS origins set in `config.php`

**Permissions:**
- [ ] Folders: 755
- [ ] Files: 644
- [ ] `uploads/blog_images/`: writable

**Server:**
- [ ] PHP version 7.4+
- [ ] SSL certificate enabled
- [ ] Domain points to Hostinger
- [ ] mod_rewrite enabled (usually is)

---

## 🚨 Quick Debug Steps

### Step 1: Enable Debug Mode

**File:** `public_html/api/config.php` Line 44
```php
define('DEBUG_MODE', true);  // Change false to true
```

### Step 2: Visit API

```
Visit: https://drozario.blog/api/health
```

**You'll see actual error message now!**

Common errors:
- `Access denied for user` → Wrong credentials
- `Unknown database` → Wrong database name
- `Table 'blogs' doesn't exist` → Tables not created
- `Connection refused` → Database server down

### Step 3: Check PHP Logs

**Via hPanel:**
1. Advanced → Error Logs
2. Select domain
3. View logs
4. Look for recent errors

### Step 4: Check Browser Console

1. Open site: https://drozario.blog
2. Press F12
3. Go to Console tab
4. Look for errors (red messages)

---

## 💡 Most Common Solutions

### 90% of issues are one of these:

1. **Tables don't exist** → Run `database_schema.sql`
2. **.htaccess missing** → Re-upload it
3. **Wrong credentials** → Update `config.php`
4. **Permissions wrong** → Set 755/644
5. **SSL not enabled** → Enable in hPanel

---

## 📞 Still Not Working?

### Contact Information

**Hostinger Support:**
- 24/7 Live Chat in hPanel
- Very helpful and fast

**What to tell them:**
"My PHP site is showing errors. Can you check if:
1. mod_rewrite is enabled
2. PHP version is 7.4+
3. MySQL database is accessible
4. File permissions are correct"

**Developer:**
- juliandrozario@gmail.com

---

## 🎯 Expected Result After Fix

**✅ Working Homepage:**
https://drozario.blog

**✅ Working API:**
```json
// https://drozario.blog/api/health
{
  "status": "healthy",
  "database": "MySQL",
  "timestamp": "2025-01-16T10:30:00+00:00"
}
```

**✅ Working Blogs:**
```json
// https://drozario.blog/api/blogs
{
  "blogs": [...],
  "total": 3
}
```

---

## 🔑 Key Files to Check

```
public_html/
├── .htaccess                    ← MUST exist
├── api/config.php               ← Check credentials
├── api/index.php                ← Entry point
└── uploads/blog_images/         ← Must be writable
```

---

**Most Important:** RUN `database_schema.sql` in phpMyAdmin!

This creates all the tables your site needs to work.

---

**Last Updated:** January 2025  
**Issue:** Database tables missing  
**Solution:** Import database_schema.sql

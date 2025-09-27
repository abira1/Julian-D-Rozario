# 🎯 COMPLETE HOSTINGER DEPLOYMENT GUIDE
# Frontend + Backend + MySQL + Google Authentication

## 📋 WHAT YOU'LL HAVE:
- ✅ **Frontend**: React app on your domain
- ✅ **Backend**: PHP API with Google authentication  
- ✅ **Database**: MySQL with all tables
- ✅ **Cost**: $0 additional (uses your existing Hostinger plan)

---

## 🗄️ STEP 1: Setup Hostinger MySQL Database

### 1.1 Create MySQL Database in Hostinger
1. **Login to Hostinger Control Panel**
2. **Go to MySQL Databases**
3. **Create New Database:**
   - Database name: `julian_portfolio` (or whatever you prefer)
   - Create new user with full permissions
   - **WRITE DOWN THESE CREDENTIALS** (you'll need them!)

### 1.2 Note Your Database Info
```
Host: localhost (usually)
Database: u123456789_julian_portfolio (example)
Username: u123456789_julian (example)
Password: [your chosen password]
```

---

## 🔧 STEP 2: Configure Backend Files

### 2.1 Update Database Credentials
Edit `api/index.php` (lines 14-18):
```php
$db_config = [
    'host' => 'localhost',
    'username' => 'u123456789_julian',           // YOUR USERNAME
    'password' => 'your_mysql_password',         // YOUR PASSWORD
    'database' => 'u123456789_julian_portfolio'  // YOUR DATABASE
];
```

### 2.2 Update Database Setup Script
Edit `setup_hostinger_mysql.php` (lines 7-11):
```php
$db_config = [
    'host' => 'localhost',
    'username' => 'u123456789_julian',           // YOUR USERNAME
    'password' => 'your_mysql_password',         // YOUR PASSWORD
    'database' => 'u123456789_julian_portfolio'  // YOUR DATABASE
];
```

---

## 📤 STEP 3: Upload Files to Hostinger

### 3.1 Upload Backend (API)
1. **In Hostinger File Manager**, go to `public_html/`
2. **Create folder**: `api`
3. **Upload**: `api/index.php` to `public_html/api/`

### 3.2 Setup Database Tables
1. **Upload**: `setup_hostinger_mysql.php` to `public_html/`
2. **Visit**: `https://your-domain.com/setup_hostinger_mysql.php` in browser
3. **You should see**: "✅ Database setup completed successfully!"
4. **Delete**: `setup_hostinger_mysql.php` (for security)

### 3.3 Test Backend API
Visit: `https://your-domain.com/api/`
You should see:
```json
{
  "message": "Julian Portfolio API - Running on Hostinger!",
  "status": "active",
  "version": "1.0.0"
}
```

---

## 🌐 STEP 4: Upload Frontend

### 4.1 Update Frontend Environment
Edit `frontend/.env.production`:
```bash
REACT_APP_BACKEND_URL=https://your-domain.com/api
GENERATE_SOURCEMAP=false
REACT_APP_ENVIRONMENT=production
```

### 4.2 Build Frontend
```bash
cd frontend
npm run build
```

### 4.3 Upload Frontend Files
1. **Upload ALL files** from `frontend/build/` to `public_html/`
2. **Make sure** `index.html` is in the root of `public_html/`
3. **Structure should look like:**
```
public_html/
├── index.html          # Main React app
├── static/             # CSS/JS files
├── api/                # PHP backend
│   └── index.php
├── favicon.ico
└── [other React files]
```

---

## 🔐 STEP 5: Configure Google Authentication

### 5.1 Firebase Console Setup
1. **Go to**: https://console.firebase.google.com
2. **Select**: `julian-d-rozario` project
3. **Authentication > Settings**
4. **Add Authorized Domains:**
   - `your-hostinger-domain.com`
   - `www.your-hostinger-domain.com`

### 5.2 Test Google Login
1. **Visit your website**
2. **Try Google login** in admin panel
3. **Should work perfectly!**

---

## ✅ STEP 6: Final Testing

### 6.1 Test Frontend
- ✅ Website loads correctly
- ✅ All pages work
- ✅ Images and assets load

### 6.2 Test Backend API
- ✅ `/api/` returns success message
- ✅ `/api/blogs` returns blog data
- ✅ Google authentication works

### 6.3 Test Database
- ✅ Admin users can login
- ✅ Blog posts can be created/edited
- ✅ Data persists correctly

---

## 📁 FILE STRUCTURE ON HOSTINGER

```
public_html/
├── index.html                 # React app entry
├── static/
│   ├── css/main.xxx.css      # React styles
│   └── js/main.xxx.js        # React JavaScript
├── api/
│   └── index.php             # PHP backend
├── favicon.ico
├── jdr-logo.png
└── asset-manifest.json
```

---

## 🎉 FINAL RESULT

- **Website**: `https://your-domain.com` (React frontend)
- **API**: `https://your-domain.com/api` (PHP backend)
- **Admin**: `https://your-domain.com/admin` (Google login)
- **Database**: MySQL on Hostinger
- **Cost**: $0 additional (uses existing Hostinger plan)

---

## 🆘 TROUBLESHOOTING

### Frontend Issues:
- **Blank page**: Check browser console for errors
- **API errors**: Verify backend URL in environment file

### Backend Issues:
- **500 errors**: Check database credentials
- **CORS errors**: Verify frontend domain is correct

### Database Issues:
- **Connection failed**: Double-check MySQL credentials
- **Permission denied**: Ensure user has full database permissions

---

## 📞 READY TO START?

1. **First**: Create MySQL database in Hostinger
2. **Then**: Follow steps 2-6 above
3. **Result**: Complete working website in 30 minutes!

Need help with any step? Just ask! 🚀
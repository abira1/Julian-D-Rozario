# 🚀 HOSTINGER DEPLOYMENT - Step by Step

## 📋 **WHAT YOU NEED:**
- ✅ Hostinger account (you have this)
- ✅ Built React app (you have this in `frontend/build/`)
- ✅ Free Railway account for backend (we'll set this up)

---

## 🎯 **STEP 1: Upload Frontend to Hostinger**

### **1.1 Access Hostinger File Manager**
1. Login to your Hostinger control panel
2. Go to **File Manager** (or **hPanel > File Manager**)
3. Navigate to your domain's **`public_html`** folder

### **1.2 Upload React Build Files**
1. **Upload ALL files from `frontend/build/` to `public_html/`:**
   - `index.html`
   - `asset-manifest.json`
   - `favicon.ico`
   - `favicon.png`
   - `jdr-logo.png`
   - `static/` folder (with all its contents)

2. **Make sure your file structure looks like this:**
   ```
   public_html/
   ├── index.html          ✅ Main page
   ├── favicon.ico         ✅ Site icon
   ├── jdr-logo.png        ✅ Your logo
   ├── asset-manifest.json ✅ React manifest
   └── static/             ✅ CSS/JS files
       ├── css/
       └── js/
   ```

### **1.3 Test Frontend**
- Visit your Hostinger domain
- You should see your website loading (without backend functionality yet)

---

## 🎯 **STEP 2: Deploy Backend to Railway (FREE)**

### **2.1 Sign up for Railway**
1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub (recommended)

### **2.2 Deploy Backend**
1. Click **"Deploy from GitHub repo"**
2. Select your repository: `Julian-D-Rozario`
3. Railway will automatically detect Python and deploy

### **2.3 Configure Environment Variables**
In Railway dashboard, add these variables:
```
MYSQL_HOST=localhost
MYSQL_USER=demo_user
MYSQL_PASSWORD=demo_pass
MYSQL_DATABASE=demo_db
JWT_SECRET_KEY=julian-portfolio-super-secret-jwt-key-2024
FRONTEND_URL=https://your-hostinger-domain.com
```

### **2.4 Get Railway URL**
- Railway will provide a URL like: `https://your-app.railway.app`
- **SAVE THIS URL** - you'll need it for frontend

---

## 🎯 **STEP 3: Connect Frontend to Backend**

### **3.1 Update Frontend Environment**
Update `frontend/.env.production`:
```bash
REACT_APP_BACKEND_URL=https://your-app.railway.app
GENERATE_SOURCEMAP=false
REACT_APP_ENVIRONMENT=production
```

### **3.2 Rebuild and Re-upload**
```bash
cd frontend
npm run build
```
Then upload the new build files to Hostinger again.

---

## 🎯 **STEP 4: Setup Hostinger MySQL (Optional)**

If you want to use Hostinger's MySQL instead of Railway's free database:

### **4.1 Create MySQL Database in Hostinger**
1. Go to **Hostinger Control Panel > MySQL Databases**
2. Create new database:
   - Database name: `julian_portfolio`
   - Username: create new user
   - Password: generate strong password

### **4.2 Update Railway Environment**
Update Railway environment variables with Hostinger MySQL credentials:
```
MYSQL_HOST=your-hostinger-mysql-host
MYSQL_USER=your-hostinger-mysql-user
MYSQL_PASSWORD=your-hostinger-mysql-password
MYSQL_DATABASE=your-hostinger-database
```

---

## 🎯 **STEP 5: Configure Google Authentication**

### **5.1 Firebase Console**
1. Go to https://console.firebase.google.com
2. Select your project: `julian-d-rozario`
3. Go to **Authentication > Settings**
4. Add **Authorized Domains:**
   - Your Hostinger domain: `your-domain.com`
   - Railway backend: `your-app.railway.app`

---

## ✅ **FINAL RESULT:**

- **Frontend**: Hosted on Hostinger (your domain)
- **Backend**: Hosted on Railway (free)
- **Database**: MySQL on Hostinger or Railway
- **Authentication**: Google Auth via Firebase
- **Cost**: $0 additional (just your existing Hostinger plan)

---

## 🧪 **Test Your Deployment**

Run this test to verify everything works:
```bash
python test_hostinger_deployment.py
```

---

## 📞 **Need Help?**

Common issues and solutions:

**Frontend not loading:**
- Check file upload to `public_html`
- Verify `index.html` is in the root

**API not working:**
- Check Railway deployment status
- Verify environment variables
- Check CORS settings include your domain

**Google login failing:**
- Add your domain to Firebase authorized domains
- Check browser console for errors
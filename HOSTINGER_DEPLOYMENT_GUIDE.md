# 🚀 Julian Portfolio - Hostinger Deployment Guide

## 📋 What You Need
- Hostinger Business subscription ✅ 
- Google Firebase project (for authentication) ✅
- Railway.app account (free, for backend hosting)

---

## 🗄️ Step 1: Setup Hostinger MySQL Database

1. **Login to Hostinger Control Panel**
2. **Go to MySQL Databases**
3. **Create New Database:**
   - Database name: `julian_portfolio`
   - Username: `julian_admin` 
   - Password: (generate strong password)
   - **SAVE THESE CREDENTIALS!**

4. **Note your database connection details:**
   ```
   Host: localhost (or provided host)
   Database: your_database_name
   Username: your_username  
   Password: your_password
   Port: 3306
   ```

5. **Setup database tables:**
   - Update `hostinger_mysql_setup.py` with your credentials
   - Run: `python hostinger_mysql_setup.py`

---

## 🖥️ Step 2: Deploy Backend to Railway

1. **Sign up at Railway.app** (free tier is enough)

2. **Connect GitHub:**
   - Link your GitHub account
   - Select this repository

3. **Deploy Backend:**
   - Railway auto-detects Python
   - Uses `backend_hostinger.py` as main file

4. **Add Environment Variables in Railway:**
   ```
   MYSQL_HOST=localhost (your Hostinger MySQL host)
   MYSQL_USER=your_hostinger_mysql_username
   MYSQL_PASSWORD=your_hostinger_mysql_password
   MYSQL_DATABASE=your_hostinger_database_name
   MYSQL_PORT=3306
   JWT_SECRET_KEY=your-super-secret-jwt-key-minimum-32-chars
   ```

5. **Get your Railway URL:** `https://your-app.railway.app`

---

## 🌐 Step 3: Deploy Frontend to Hostinger

1. **Update frontend environment:**
   ```bash
   # frontend/.env.production
   REACT_APP_BACKEND_URL=https://your-app.railway.app
   GENERATE_SOURCEMAP=false
   REACT_APP_ENVIRONMENT=production
   ```

2. **Build React app:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Upload to Hostinger:**
   - Go to Hostinger File Manager
   - Navigate to `public_html` folder
   - Upload ALL contents of `frontend/build/` folder
   - Make sure `index.html` is in root of `public_html`

---

## 🔐 Step 4: Configure Google Authentication

1. **Firebase Console:**
   - Go to Authentication > Settings
   - Add your Hostinger domain to Authorized domains:
     - `your-domain.com`
     - `www.your-domain.com`

2. **Update CORS in Railway backend:**
   - In Railway environment variables, the backend already includes CORS setup
   - Replace `your-hostinger-domain.com` with your actual domain

---

## ✅ Step 5: Test Everything

1. **Visit your Hostinger domain**
2. **Test Google login**
3. **Check admin panel functionality**  
4. **Verify blog creation/editing works**

---

## 🎯 Final Architecture

```
Frontend (Hostinger) → Backend (Railway) → MySQL (Hostinger)
     ↓                      ↓
Google Auth (Firebase) → JWT tokens
```

## 💡 Cost Breakdown
- **Hostinger:** Your existing business plan (includes MySQL)
- **Railway:** Free tier (500 hours/month - plenty for your needs)
- **Firebase:** Free tier (Google Auth is free up to 50k users)

**Total additional cost: $0** 🎉

---

## 🆘 Troubleshooting

### Frontend Issues:
- Check browser console for errors
- Verify `REACT_APP_BACKEND_URL` points to Railway URL
- Check CORS settings in backend

### Backend Issues:
- Check Railway logs for errors  
- Verify MySQL credentials in Railway environment
- Test database connection

### Authentication Issues:
- Verify Firebase authorized domains include your Hostinger domain
- Check admin emails are correct in backend code
- Test Google login popup works

---

## 📞 Need Help?
- Railway documentation: railway.app/docs
- Hostinger support: hostinger.com/help  
- Firebase documentation: firebase.google.com/docs
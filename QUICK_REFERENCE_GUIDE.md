# 📚 Quick Reference Guide - User Profile System

## 🎯 For Future Testing/Debugging

### **Quick Health Check Commands**

```bash
# 1. Check if all services are running
sudo supervisorctl status

# 2. Check backend health
curl http://localhost:8001/api/health

# 3. Check database tables (SQLite)
sqlite3 /app/backend/julian_portfolio.db "SELECT name FROM sqlite_master WHERE type='table';"

# 4. View backend logs
tail -f /var/log/supervisor/backend.*.log

# 5. View frontend logs
tail -f /var/log/supervisor/frontend.*.log

# 6. Restart all services
sudo supervisorctl restart all
```

---

## 🗄️ Database Quick Reference

### **Tables Structure:**

1. **blogs** - Blog posts
2. **contact_info** - Contact information
3. **user_profiles** - User accounts (Firebase + local)
4. **blog_likes** - User likes on blogs
5. **blog_saves** - User saved blogs
6. **blog_comments** - User comments on blogs

### **Quick Database Queries:**

```sql
-- View all users
SELECT id, email, display_name, is_admin FROM user_profiles;

-- View all likes
SELECT u.email, b.title FROM blog_likes bl
JOIN user_profiles u ON bl.user_id = u.id
JOIN blogs b ON bl.blog_id = b.id;

-- View all comments
SELECT u.display_name, b.title, c.comment_text, c.created_at 
FROM blog_comments c
JOIN user_profiles u ON c.user_id = u.id
JOIN blogs b ON c.blog_id = b.id
WHERE c.is_deleted = 0;

-- Count user activity
SELECT 
  u.email,
  COUNT(DISTINCT bl.id) as likes,
  COUNT(DISTINCT bs.id) as saves,
  COUNT(DISTINCT bc.id) as comments
FROM user_profiles u
LEFT JOIN blog_likes bl ON u.id = bl.user_id
LEFT JOIN blog_saves bs ON u.id = bs.user_id
LEFT JOIN blog_comments bc ON u.id = bc.user_id AND bc.is_deleted = 0
GROUP BY u.id;
```

---

## 🔌 API Endpoints Quick Reference

### **Public Endpoints (No Auth Required):**

```bash
# Get all blogs
GET /api/blogs

# Get single blog
GET /api/blogs/{id}

# Get blog categories
GET /api/categories

# Get blog comments
GET /api/blogs/{id}/comments

# Health check
GET /api/health
```

### **Protected Endpoints (Auth Required):**

```bash
# User Profile
GET /api/user/profile
PUT /api/user/profile

# Likes
POST /api/blogs/{id}/like
GET /api/blogs/{id}/user-like-status
GET /api/user/liked-blogs

# Saves
POST /api/blogs/{id}/save
GET /api/blogs/{id}/user-save-status
GET /api/user/saved-blogs

# Comments
POST /api/blogs/{id}/comments
GET /api/user/comments
PUT /api/comments/{id}
DELETE /api/comments/{id}
```

### **Admin Endpoints (Admin Auth Required):**

```bash
POST /api/blogs
PUT /api/blogs/{id}
DELETE /api/blogs/{id}
POST /api/contact-info
PUT /api/contact-info/{id}
DELETE /api/contact-info/{id}
```

---

## 🎨 Frontend Routes

```
/ - Homepage
/blog - Blog listing (premium)
/blog/:id - Single blog post (premium)
/blog-old - Old blog listing
/blog-old/:id - Old blog post

/user/profile - User profile dashboard
/user/liked-blogs - User's liked blogs
/user/saved-blogs - User's saved blogs
/user/comments - User's comments

/julian_portfolio - Admin panel
```

---

## 🔑 Environment Variables

### **Backend (.env):**

```env
# Database
DATABASE_TYPE=sqlite  # or mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=julian_portfolio

# JWT
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# Admin
AUTHORIZED_ADMIN_EMAILS=email1@gmail.com,email2@gmail.com
```

### **Frontend (.env):**

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🐛 Common Issues & Quick Fixes

### **Issue: Profile pages redirect to homepage**
**Fix:** Already fixed - pages now wait for auth to load

### **Issue: "User not found" error**
**Fix:** Sign out and sign in again to recreate profile

### **Issue: Likes/saves not persisting**
**Check:**
```bash
# Verify token exists
# In browser console:
localStorage.getItem('firebase_backend_token')

# Test API manually
curl -X POST http://localhost:8001/api/blogs/1/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Issue: Backend not connecting to database**
**Fix:**
```bash
# For SQLite - check if file exists
ls -la /app/backend/julian_portfolio.db

# For MySQL - verify credentials
grep MYSQL /app/backend/.env

# Restart backend
sudo supervisorctl restart backend
```

### **Issue: Frontend not loading**
**Fix:**
```bash
# Check if running
sudo supervisorctl status frontend

# Check logs for errors
tail -n 50 /var/log/supervisor/frontend.err.log

# Restart
sudo supervisorctl restart frontend
```

---

## 🧪 Quick Test Scenarios

### **Test 1: User Registration & Login**
1. Open http://localhost:3000
2. Click "Sign In" → Sign in with Google
3. Profile avatar should appear
4. Check database: `SELECT * FROM user_profiles;`

### **Test 2: Like a Blog**
1. Go to blog post
2. Click heart icon
3. Heart should fill
4. Check: `SELECT * FROM blog_likes;`

### **Test 3: Save a Blog**
1. Go to blog post
2. Click bookmark icon
3. Bookmark should fill
4. Navigate to "Saved Blogs" → blog should appear

### **Test 4: Post a Comment**
1. Go to blog post
2. Scroll to comments section
3. Type comment and submit
4. Comment should appear immediately
5. Check: `SELECT * FROM blog_comments;`

### **Test 5: View Profile**
1. Click profile avatar → "My Profile"
2. Should show user info and stats
3. Stats should reflect actual data

---

## 📊 Getting User Token for API Testing

```javascript
// In browser console (F12)
localStorage.getItem('firebase_backend_token')

// Copy the token, then use in curl:
TOKEN="paste_token_here"

curl -X GET http://localhost:8001/api/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Deployment Checklist (Hostinger)

- [ ] Create MySQL database in hPanel
- [ ] Run `/app/database_migration.sql` in phpMyAdmin
- [ ] Update backend `.env` with MySQL credentials
- [ ] Set `DATABASE_TYPE=mysql`
- [ ] Update `AUTHORIZED_ADMIN_EMAILS` with real admin emails
- [ ] Update `JWT_SECRET` with strong random key
- [ ] Update `CORS_ORIGINS` with production domain
- [ ] Test database connection
- [ ] Upload files via FTP/Git
- [ ] Restart services
- [ ] Test all functionality on live site

---

## 📝 File Locations

### **Important Files:**

```
/app/backend/server.py - Main backend API
/app/backend/.env - Backend environment variables
/app/backend/julian_portfolio.db - SQLite database (local dev)

/app/frontend/src/App.js - Main app component with routes
/app/frontend/src/pages/ - User profile pages
/app/frontend/src/components/FirebaseUserProfileMenu.js - Profile dropdown
/app/frontend/src/contexts/FirebaseAuthContext.js - Auth context
/app/frontend/.env - Frontend environment variables

/app/database_migration.sql - MySQL database schema
/app/DATABASE_SETUP_GUIDE.md - Complete setup guide
/app/COMPREHENSIVE_TESTING_PROMPT.md - Full testing guide
```

### **Log Files:**

```
/var/log/supervisor/backend.out.log - Backend output
/var/log/supervisor/backend.err.log - Backend errors
/var/log/supervisor/frontend.out.log - Frontend output
/var/log/supervisor/frontend.err.log - Frontend errors
```

---

## 🎯 Key Features Summary

### **User Features:**
✅ Google Sign-In (Firebase OAuth)
✅ User Profile Dashboard
✅ Like blogs
✅ Save blogs for later
✅ Comment on blogs
✅ Edit/delete own comments
✅ View all liked blogs
✅ View all saved blogs
✅ View all comments
✅ Activity statistics

### **Admin Features:**
✅ Create/edit/delete blog posts
✅ Manage contact information
✅ Full admin dashboard
✅ Admin badge in profile menu

### **Technical Features:**
✅ Dual database support (SQLite/MySQL)
✅ JWT authentication
✅ Firebase integration
✅ RESTful API
✅ Foreign key constraints
✅ Soft delete for comments
✅ Real-time like/save counters
✅ Responsive design
✅ Client-side routing

---

## 🆘 Need Help?

### **Documents to Check:**

1. **For Setup:** `/app/DATABASE_SETUP_GUIDE.md`
2. **For Testing:** `/app/COMPREHENSIVE_TESTING_PROMPT.md`
3. **For Features:** `/app/USER_PROFILE_IMPLEMENTATION_SUMMARY.md`
4. **For Navigation Fix:** `/app/NAVIGATION_FIX_APPLIED.md`

### **Quick Debugging Steps:**

1. Check service status
2. Check logs for errors
3. Verify environment variables
4. Test API endpoints manually
5. Check database data
6. Clear browser cache
7. Sign out and sign in again
8. Restart services

---

## 🎉 Everything Working?

If all checks pass:
- ✅ Users can sign in
- ✅ Profile pages load
- ✅ Likes, saves, comments work
- ✅ Database persists data
- ✅ No console errors

**You're ready for production!** 🚀

---

**Quick Reference Version 1.0**
**Last Updated: 2025**

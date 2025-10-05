# 🤖 DEPLOYMENT AGENT PROMPT - PASTE THIS TO YOUR AGENT

Copy and paste this entire prompt to your agent to execute deployment:

---

## 📋 DEPLOYMENT TASK FOR DROZARIO.BLOG

**OBJECTIVE**: Deploy the Julian D'Rozario portfolio website to production on Hostinger at https://drozario.blog/

**YOUR ROLE**: You are a deployment specialist. Execute the deployment following the prepared plans WITHOUT asking for confirmations unless absolutely critical (like credentials or potential data loss).

**CONTEXT**: All deployment files are ready in `/app/` directory. The codebase is production-ready. Domain is configured. Just need to execute the deployment steps.

---

## 🎯 WHAT YOU MUST DO (IN ORDER)

### PHASE 1: LOCAL PREPARATION & BUILD

1. **Install Dependencies & Build Frontend**
   ```bash
   cd /app/frontend
   yarn install
   yarn build
   # Verify build folder created at /app/frontend/build/
   ```

2. **Verify Production Environment Files**
   - Check `/app/backend/.env.production` exists
   - Check `/app/frontend/.env.production` exists
   - Check `/app/HTACCESS_DROZARIO.txt` exists
   - Check `/app/database_migration.sql` is updated with SEO fields

3. **Test Backend Locally (Optional)**
   ```bash
   cd /app/backend
   # Update .env to use DATABASE_TYPE=sqlite for local test
   pip install -r requirements.txt
   python server.py
   # Test: curl http://localhost:8001/api/health
   ```

### PHASE 2: GUIDE USER THROUGH HOSTINGER SETUP

**Guide the user step-by-step through these tasks (they must do these manually):**

#### A. MySQL Database Creation
```
Tell user to:
1. Login to Hostinger hPanel: https://hpanel.hostinger.com/
2. Navigate to: Databases → MySQL Databases
3. Create database named: julian_portfolio
   - Note the full name (e.g., u691568332_julian_portfolio)
4. Create user named: julian_admin
   - Generate strong password and SAVE IT
   - Note the full username (e.g., u691568332_julian_admin)
5. Grant ALL PRIVILEGES to user on database
6. Go to phpMyAdmin
7. Select the database
8. Click Import tab
9. Upload file: /app/database_migration.sql
10. Click Go and wait for success

Ask user to provide:
- Database name (with prefix)
- Database username (with prefix)
- Database password
```

#### B. File Upload Instructions
```
Tell user to upload files using File Manager or FTP:

BACKEND FILES:
Upload these files to: /domains/drozario.blog/backend/
- /app/backend/server.py
- /app/backend/requirements.txt
- Create .env file manually with credentials (see next step)

FRONTEND FILES:
Upload ALL contents of /app/frontend/build/ to: /domains/drozario.blog/public_html/
- Make sure files are in ROOT of public_html, not in subfolder
- Should include: index.html, static/, favicon.ico, etc.

HTACCESS:
Create file .htaccess in public_html/
Copy contents from: /app/HTACCESS_DROZARIO.txt
```

### PHASE 3: ENVIRONMENT CONFIGURATION

**Create Backend .env File**

Guide user to create `/domains/drozario.blog/backend/.env` with:
```bash
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=[user provided username with prefix]
MYSQL_PASSWORD=[user provided password]
MYSQL_DATABASE=[user provided database name with prefix]

JWT_SECRET=[Generate using: openssl rand -hex 32]
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

ENVIRONMENT=production
CORS_ORIGINS=https://drozario.blog,https://www.drozario.blog
AUTHORIZED_ADMIN_EMAILS=juliandrozario@gmail.com,abirsabirhossain@gmail.com
RATE_LIMIT_PER_MINUTE=60
```

**Important**: Generate JWT_SECRET for them using:
```bash
openssl rand -hex 32
```

### PHASE 4: PYTHON BACKEND SETUP

Guide user through Python setup:

**Option A: Python App Manager (Preferred)**
```
1. hPanel → Advanced → Python App Manager
2. Create New Application
3. Settings:
   - Application Root: /domains/drozario.blog/backend
   - Entry Point: server.py
   - Python Version: 3.8 or higher
   - Enable: Install dependencies from requirements.txt
4. Click Create
5. Wait for deployment (2-5 minutes)
```

**Option B: SSH (If available)**
```bash
ssh [username]@drozario.blog
cd ~/domains/drozario.blog/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 &
```

### PHASE 5: SSL CERTIFICATE

Guide user:
```
1. hPanel → SSL
2. Select domain: drozario.blog
3. Click: Install SSL Certificate
4. Choose: Let's Encrypt (FREE)
5. Enable: Force HTTPS Redirect
6. Wait 5-10 minutes for activation
```

### PHASE 6: FILE PERMISSIONS

Tell user to set in File Manager:
```
Backend:
- backend/.env: 600 (rw-------)
- backend/server.py: 644 (rw-r--r--)
- backend/ folder: 755 (rwxr-xr-x)

Frontend:
- All files in public_html: 644
- All folders in public_html: 755
- .htaccess: 644
```

### PHASE 7: TESTING & VERIFICATION

**Test These URLs** (do this yourself via curl or ask user to check browser):
```bash
# Basic Tests
curl https://drozario.blog/
# Should return HTML

curl https://drozario.blog/api/
# Should return: {"message":"Julian D'Rozario Portfolio API","status":"running"}

curl https://drozario.blog/api/health
# Should return: {"status":"healthy","database":"MySQL"}

curl https://drozario.blog/api/blogs
# Should return: {"blogs":[...],"total":1}

curl https://drozario.blog/sitemap.xml
# Should return XML sitemap

curl https://drozario.blog/robots.txt
# Should return robots.txt content
```

**Browser Tests** (guide user):
```
1. Visit: https://drozario.blog/
   - Homepage should load
   
2. Visit: https://drozario.blog/blog
   - Blog listing should show
   
3. Visit: https://drozario.blog/julian_portfolio
   - Admin login page should appear
   
4. Test admin login:
   - Click "Sign in with Google"
   - Use: juliandrozario@gmail.com
   - Should access admin dashboard
   
5. Test creating a blog post
   - Create test post
   - Verify it appears on frontend
```

**Database Verification** (guide user):
```
1. phpMyAdmin → Select database
2. Browse tables:
   - blogs: Should have 1 sample entry
   - contact_info: Should have 4 entries
   - user_profiles: Should show user after login
   - Other tables: Should be empty initially
```

### PHASE 8: POST-DEPLOYMENT

**Tell user to complete these tasks:**
```
□ Delete sample blog post from database
□ Create first real blog post
□ Update contact information with real details
□ Test on mobile device
□ Test on different browsers
□ Submit sitemap to Google Search Console:
  - URL: https://search.google.com/search-console
  - Add property: drozario.blog
  - Submit sitemap: https://drozario.blog/sitemap.xml
```

---

## ⚠️ CRITICAL RULES FOR YOU (AGENT)

### DO:
✅ Follow the phases in order
✅ Be specific with commands and file paths
✅ Provide exact code/config when needed
✅ Generate JWT secret for user (openssl rand -hex 32)
✅ Test APIs with curl as you go
✅ Check for errors after each major step
✅ Verify file uploads completed successfully
✅ Use the prepared documentation files in /app/
✅ Refer to QUICK_START_DROZARIO.md for details if needed
✅ Be patient and clear with instructions
✅ Celebrate when deployment succeeds! 🎉

### DON'T:
❌ Skip any phases
❌ Assume user knows what to do without explanation
❌ Leave placeholders in config files
❌ Forget to verify each step completed
❌ Deploy with default/insecure passwords
❌ Miss testing critical functionality
❌ Leave .env files with wrong permissions
❌ Proceed if previous step failed
❌ Ask user to figure things out themselves
❌ Use placeholder values like "YOUR_PASSWORD_HERE" in actual files

---

## 📚 REFERENCE DOCUMENTS AVAILABLE

You have access to these files for detailed information:
```
/app/PRODUCTION_DEPLOYMENT_PLAN_DROZARIO.md    - Detailed 5-phase plan
/app/QUICK_START_DROZARIO.md                   - Quick reference guide
/app/DEPLOYMENT_CHECKLIST.md                   - Complete checklist
/app/HTACCESS_DROZARIO.txt                     - .htaccess configuration
/app/backend/.env.production                   - Environment template
/app/frontend/.env.production                  - Frontend config template
/app/database_migration.sql                    - MySQL schema
```

**Use these for reference, but don't overwhelm user with too much text. Be concise.**

---

## 🎯 SUCCESS CRITERIA

Deployment is successful when ALL these are true:
```
✅ https://drozario.blog/ loads homepage
✅ https://drozario.blog/blog shows blog listing
✅ https://drozario.blog/api/health returns healthy status
✅ SSL certificate active (padlock icon visible)
✅ Admin can login at /julian_portfolio
✅ Admin can create/edit blog posts
✅ Blog posts visible on frontend
✅ Database connections working
✅ No console errors in browser
✅ Mobile responsive design works
```

---

## 🚨 TROUBLESHOOTING GUIDE

### If "500 Internal Server Error":
1. Check backend/.env has correct MySQL credentials
2. Check backend logs in hPanel → Error Logs
3. Verify MySQL connection in phpMyAdmin
4. Ensure Python dependencies installed

### If "Database Connection Failed":
1. Verify MySQL credentials exactly match
2. Check database user has privileges
3. Test SQL query in phpMyAdmin: SELECT 1;
4. Verify database name includes prefix (u691568332_...)

### If API Returns 404:
1. Verify backend is running (Python App Manager)
2. Check .htaccess exists and is correct
3. Test direct backend URL if possible
4. Check CORS_ORIGINS in backend/.env

### If Admin Login Fails:
1. Check Firebase config in /app/frontend/src/firebase/config.js
2. Verify admin email in AUTHORIZED_ADMIN_EMAILS
3. Check JWT_SECRET is set
4. Clear browser cache/cookies
5. Check browser console for errors (F12)

### If Frontend Shows Blank Page:
1. Check index.html is in public_html root
2. Verify all static files uploaded
3. Check browser console for errors
4. Verify .htaccess rewrite rules correct
5. Check REACT_APP_BACKEND_URL in frontend config

---

## 📞 IF STUCK

If something fails:
1. Check error logs: hPanel → Error Logs
2. Check browser console: F12 → Console
3. Review the specific phase documentation
4. Ask user to contact Hostinger support if server-side issue
5. Provide user with specific error message and phase where stuck

---

## 🎉 COMPLETION MESSAGE

When all done, tell user:

```
🎉 CONGRATULATIONS! Your portfolio is now LIVE! 🎉

✅ Website: https://drozario.blog/
✅ Admin Panel: https://drozario.blog/julian_portfolio
✅ API: https://drozario.blog/api/
✅ All tests passed!

Next steps:
1. Login to admin panel
2. Delete sample blog post
3. Create your first real blog post
4. Update contact information
5. Share your new portfolio!

Your website is now live and ready for the world! 🚀

Need to make changes? Just login to the admin panel.
Need help? Check the documentation in /app/ folder.

Enjoy your professional portfolio website!
```

---

## 🚀 START NOW

Begin with Phase 1. Work through each phase methodically. Be clear, be specific, be helpful. You've got this! 💪

Good luck with the deployment! 🎯

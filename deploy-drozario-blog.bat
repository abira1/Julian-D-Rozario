@echo off
echo 🚀 Julian D'Rozario - drozario.blog One-Click Deployment
echo ========================================================
echo Domain: drozario.blog (SSL Active)
echo Plan: Hostinger Premium Web Hosting  
echo Admins: juliandrozario@gmail.com + abirsabirhossain@gmail.com
echo.

REM Check if in correct directory
if not exist "backend\server.py" (
    echo ❌ Error: Please run this script from the project root directory
    echo Expected files: backend\server.py, frontend\package.json
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ Error: Please run this script from the project root directory  
    echo Expected files: backend\server.py, frontend\package.json
    pause
    exit /b 1
)

echo ✅ Project structure verified
echo.

REM Pre-configured settings for Julian's Hostinger account
set DOMAIN_NAME=drozario.blog
set ADMIN_EMAIL=juliandrozario@gmail.com
set SECONDARY_ADMIN=abirsabirhossain@gmail.com

echo 📋 Using your Hostinger configuration:
echo    🌐 Domain: %DOMAIN_NAME%
echo    📧 Primary Admin: %ADMIN_EMAIL%
echo    📧 Secondary Admin: %SECONDARY_ADMIN%
echo    🔐 SSL: Active (Premium plan)
echo    🗄️  Database: MySQL (Premium plan)
echo.

REM Pre-configured database settings
set DB_PREFIX=u691568332_
set DB_NAME=u691568332_Dataubius
set DB_USER=u691568332_Dataubius
set DB_PASSWORD=Dataubius@2024

echo �️  Using your MySQL database:
echo    Database: %DB_NAME%
echo    User: %DB_USER%
echo    Password: [configured]

echo ✅ Configuration complete!
echo.

REM Check prerequisites
echo 🔍 Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js
    pause
    exit /b 1
)
echo ✅ Node.js found

python --version >nul 2>&1
if errorlevel 1 (
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Python not found. Please install Python
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)
echo ✅ Python found
echo.

REM Export database if exists
echo 📊 Checking for existing database...
if exist "backend\julian_portfolio.db" (
    echo ✅ SQLite database found, exporting to MySQL format...
    %PYTHON_CMD% hostinger_deployment_prep.py
    if errorlevel 1 (
        echo ⚠️  Database export had issues, continuing anyway...
    ) else (
        echo ✅ Database exported successfully
    )
) else (
    echo ℹ️  No local database found - will create fresh MySQL database
)
echo.

REM Build frontend
echo 🔨 Building React frontend for production...
cd frontend

if not exist "node_modules" (
    echo 📦 Installing React dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
)

echo 🏗️  Building optimized production build...
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    cd ..
    pause
    exit /b 1
)

cd ..
echo ✅ React build completed successfully
echo.

REM Create deployment package
echo 📦 Creating drozario.blog deployment package...

if exist "drozario-blog-deployment" rmdir /s /q "drozario-blog-deployment"
mkdir "drozario-blog-deployment\public_html"
mkdir "drozario-blog-deployment\backend" 
mkdir "drozario-blog-deployment\docs"

REM Copy frontend build
if exist "frontend\build" (
    xcopy "frontend\build\*" "drozario-blog-deployment\public_html\" /s /e /y >nul
    echo ✅ React frontend files copied
) else (
    echo ❌ Frontend build not found
    pause
    exit /b 1
)

REM Copy backend files
copy "backend\server.py" "drozario-blog-deployment\backend\" >nul
copy "backend\server_local.py" "drozario-blog-deployment\backend\" >nul
copy "backend\requirements.txt" "drozario-blog-deployment\backend\" >nul
if exist "backend\database_setup.py" copy "backend\database_setup.py" "drozario-blog-deployment\backend\" >nul
if exist "backend\database_schema.py" copy "backend\database_schema.py" "drozario-blog-deployment\backend\" >nul  
if exist "backend\hostinger_database_export.sql" copy "backend\hostinger_database_export.sql" "drozario-blog-deployment\backend\" >nul

echo ✅ Backend API files copied

REM Generate secure JWT secret
for /f %%i in ('%PYTHON_CMD% -c "import secrets; print(secrets.token_urlsafe(32))"') do set JWT_SECRET=%%i

REM Create production .env file
echo # Julian D'Rozario - drozario.blog Production Configuration > "drozario-blog-deployment\backend\.env"
echo # Generated %date% %time% >> "drozario-blog-deployment\backend\.env"
echo # Hostinger Premium Web Hosting >> "drozario-blog-deployment\backend\.env"
echo. >> "drozario-blog-deployment\backend\.env"
echo # MySQL Database Configuration >> "drozario-blog-deployment\backend\.env"
echo DATABASE_TYPE=mysql >> "drozario-blog-deployment\backend\.env"
echo MYSQL_HOST=localhost >> "drozario-blog-deployment\backend\.env"
echo MYSQL_PORT=3306 >> "drozario-blog-deployment\backend\.env"
echo MYSQL_USER=%DB_USER% >> "drozario-blog-deployment\backend\.env"
echo MYSQL_PASSWORD=%DB_PASSWORD% >> "drozario-blog-deployment\backend\.env"
echo MYSQL_DATABASE=%DB_NAME% >> "drozario-blog-deployment\backend\.env"
echo. >> "drozario-blog-deployment\backend\.env"
echo # JWT Authentication >> "drozario-blog-deployment\backend\.env"
echo JWT_SECRET=%JWT_SECRET% >> "drozario-blog-deployment\backend\.env"
echo JWT_ALGORITHM=HS256 >> "drozario-blog-deployment\backend\.env"
echo ACCESS_TOKEN_EXPIRE_HOURS=24 >> "drozario-blog-deployment\backend\.env"
echo. >> "drozario-blog-deployment\backend\.env"
echo # Google OAuth Configuration (Optional) >> "drozario-blog-deployment\backend\.env"
echo GOOGLE_CLIENT_ID=optional-google-client-id >> "drozario-blog-deployment\backend\.env"
echo GOOGLE_CLIENT_SECRET=optional-google-client-secret >> "drozario-blog-deployment\backend\.env"
echo. >> "drozario-blog-deployment\backend\.env"
echo # Authorized Admin Emails >> "drozario-blog-deployment\backend\.env"
echo AUTHORIZED_ADMIN_EMAILS=juliandrozario@gmail.com,abirsabirhossain@gmail.com >> "drozario-blog-deployment\backend\.env"
echo. >> "drozario-blog-deployment\backend\.env"
echo # Production Environment >> "drozario-blog-deployment\backend\.env"
echo ENVIRONMENT=production >> "drozario-blog-deployment\backend\.env"
echo CORS_ORIGINS=https://drozario.blog,https://www.drozario.blog >> "drozario-blog-deployment\backend\.env"
echo. >> "drozario-blog-deployment\backend\.env"
echo # Performance Settings >> "drozario-blog-deployment\backend\.env"
echo RATE_LIMIT_PER_MINUTE=60 >> "drozario-blog-deployment\backend\.env"

echo ✅ Production environment configured

REM Create optimized .htaccess for drozario.blog
echo # Julian D'Rozario - drozario.blog Configuration > "drozario-blog-deployment\public_html\.htaccess"
echo # Hostinger Premium Web Hosting with SSL >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteEngine On >> "drozario-blog-deployment\public_html\.htaccess"
echo. >> "drozario-blog-deployment\public_html\.htaccess"
echo # Force HTTPS (SSL included with Premium plan) >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteCond %%{HTTPS} off >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteRule ^^(.*) https://%%{HTTP_HOST}%%{REQUEST_URI} [L,R=301] >> "drozario-blog-deployment\public_html\.htaccess"
echo. >> "drozario-blog-deployment\public_html\.htaccess"
echo # Security Headers >> "drozario-blog-deployment\public_html\.htaccess"
echo ^<IfModule mod_headers.c^> >> "drozario-blog-deployment\public_html\.htaccess"
echo     Header always set X-Frame-Options "SAMEORIGIN" >> "drozario-blog-deployment\public_html\.htaccess"
echo     Header always set X-Content-Type-Options "nosniff" >> "drozario-blog-deployment\public_html\.htaccess"
echo     Header always set X-XSS-Protection "1; mode=block" >> "drozario-blog-deployment\public_html\.htaccess"
echo     Header always set Referrer-Policy "strict-origin-when-cross-origin" >> "drozario-blog-deployment\public_html\.htaccess"
echo     Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" >> "drozario-blog-deployment\public_html\.htaccess"
echo ^</IfModule^> >> "drozario-blog-deployment\public_html\.htaccess"
echo. >> "drozario-blog-deployment\public_html\.htaccess"
echo # Handle React Router (SPA routing) >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteCond %%{REQUEST_FILENAME} !-f >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteCond %%{REQUEST_FILENAME} !-d >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteCond %%{REQUEST_URI} !^^/api/ >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteRule . /index.html [L] >> "drozario-blog-deployment\public_html\.htaccess"
echo. >> "drozario-blog-deployment\public_html\.htaccess"
echo # API routing to FastAPI backend >> "drozario-blog-deployment\public_html\.htaccess"
echo RewriteRule ^^api/(.*) /backend/server.py/$1 [L,QSA] >> "drozario-blog-deployment\public_html\.htaccess"
echo. >> "drozario-blog-deployment\public_html\.htaccess"
echo # Performance Optimization >> "drozario-blog-deployment\public_html\.htaccess"
echo ^<IfModule mod_deflate.c^> >> "drozario-blog-deployment\public_html\.htaccess"
echo     AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json >> "drozario-blog-deployment\public_html\.htaccess"
echo ^</IfModule^> >> "drozario-blog-deployment\public_html\.htaccess"
echo. >> "drozario-blog-deployment\public_html\.htaccess"
echo # Browser Caching >> "drozario-blog-deployment\public_html\.htaccess"
echo ^<IfModule mod_expires.c^> >> "drozario-blog-deployment\public_html\.htaccess"
echo     ExpiresActive On >> "drozario-blog-deployment\public_html\.htaccess"
echo     ExpiresByType text/css "access plus 1 month" >> "drozario-blog-deployment\public_html\.htaccess"
echo     ExpiresByType application/javascript "access plus 1 month" >> "drozario-blog-deployment\public_html\.htaccess"
echo     ExpiresByType image/png "access plus 6 months" >> "drozario-blog-deployment\public_html\.htaccess"
echo     ExpiresByType image/jpeg "access plus 6 months" >> "drozario-blog-deployment\public_html\.htaccess"
echo ^</IfModule^> >> "drozario-blog-deployment\public_html\.htaccess"

echo ✅ Hostinger .htaccess optimized

REM Create personalized deployment instructions
echo # 🚀 drozario.blog - Your Deployment Steps > "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo **Generated for:** Julian D'Rozario >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo **Domain:** https://drozario.blog >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"  
echo **SSL:** Active (Premium plan) >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo **Database:** MySQL %DB_NAME% >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo **Generated:** %date% %time% >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ## 📋 Upload to Hostinger >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ### 1. File Manager Upload >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Log into Hostinger hPanel >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Go to File Manager >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Navigate to `/domains/drozario.blog/` >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Upload `public_html/` contents to `public_html/` folder >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Upload `backend/` folder outside public_html >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ### 2. MySQL Database Setup >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] hPanel → MySQL Databases >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [x] Database already configured: `%DB_NAME%` >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [x] User already configured: `%DB_USER%` >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [x] Password already set: Dataubius@2024 >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [x] Database ready for use! >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ### 3. Update Configuration >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [x] Configuration file pre-configured with your database credentials >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [x] No manual configuration needed! >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ### 4. Test Your Live Site >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Visit: https://drozario.blog >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] Admin panel: https://drozario.blog/julian_portfolio >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - [ ] API health: https://drozario.blog/api/ >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ## 🔐 Admin Access >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - **Julian:** juliandrozario@gmail.com >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - **Abir:** abirsabirhossain@gmail.com >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo. >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo ## 🆘 Support >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - **Hostinger Support:** 24/7 chat in hPanel >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"
echo - **Help Center:** help.hostinger.com >> "drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md"

REM Copy additional documentation
if exist "DROZARIO_BLOG_DEPLOYMENT_GUIDE.md" copy "DROZARIO_BLOG_DEPLOYMENT_GUIDE.md" "drozario-blog-deployment\docs\" >nul
if exist "HOSTINGER_COMPLETE_DEPLOYMENT_GUIDE.md" copy "HOSTINGER_COMPLETE_DEPLOYMENT_GUIDE.md" "drozario-blog-deployment\docs\" >nul
if exist "HOSTINGER_DEPLOYMENT_FAQ.md" copy "HOSTINGER_DEPLOYMENT_FAQ.md" "drozario-blog-deployment\docs\" >nul

echo ✅ Documentation created

REM Create ZIP file for easy upload
echo 📦 Creating ZIP package for Hostinger upload...
powershell -command "Compress-Archive -Path 'drozario-blog-deployment\*' -DestinationPath 'drozario-blog-ready-%date:~-4,4%%date:~-10,2%%date:~-7,2%.zip' -Force" 2>nul
if errorlevel 1 (
    echo ⚠️  ZIP creation failed, but folder is ready for manual upload
    set ZIP_CREATED=false
) else (
    echo ✅ ZIP package created: drozario-blog-ready-*.zip
    set ZIP_CREATED=true
)

echo.
echo 🎉 drozario.blog deployment package ready!
echo =============================================
echo.
echo 📦 Files created:
echo    📁 drozario-blog-deployment/ (complete package)
if "%ZIP_CREATED%"=="true" echo    📎 drozario-blog-ready-*.zip (upload this!)
echo.
echo 🚀 Next steps:
echo    1. 📤 Upload ZIP to Hostinger File Manager
echo    2. 📂 Extract in /domains/drozario.blog/ 
echo    3. 🗄️  Create MySQL database in hPanel
echo    4. ⚙️  Update backend/.env with MySQL password
echo    5. 🌐 Visit https://drozario.blog
echo.
echo 📖 Detailed guide: drozario-blog-deployment\docs\DEPLOYMENT_STEPS.md
echo.
echo 🌟 Your professional portfolio is ready to go live!
echo    Domain: https://drozario.blog (SSL active)
echo    Expires: September 19, 2027
echo    Admin: juliandrozario@gmail.com + abirsabirhossain@gmail.com
echo.
echo Good luck with your deployment! 🚀
echo.
pause
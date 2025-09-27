@echo off
echo ========================================
echo   HOSTINGER DEPLOYMENT FILE CHECKER
echo ========================================
echo.

echo Checking files in hostinger_complete_deploy folder...
echo.

echo [1] Main HTML file:
if exist "hostinger_complete_deploy\index.html" (
    echo     ✅ index.html - READY
    findstr "main.197ebe19.js" "hostinger_complete_deploy\index.html" >nul
    if %errorlevel%==0 (
        echo     ✅ References correct JS file: main.197ebe19.js
    ) else (
        echo     ❌ Wrong JS file reference
    )
) else (
    echo     ❌ index.html - MISSING
)

echo.
echo [2] Latest JavaScript file:
if exist "hostinger_complete_deploy\static\js\main.197ebe19.js" (
    echo     ✅ main.197ebe19.js - READY
) else (
    echo     ❌ main.197ebe19.js - MISSING
)

echo.
echo [3] PHP API file:
if exist "hostinger_complete_deploy\api\index.php" (
    echo     ✅ api/index.php - READY
) else (
    echo     ❌ api/index.php - MISSING
)

echo.
echo ========================================
echo   UPLOAD THESE FILES TO HOSTINGER:
echo ========================================
echo.
echo 1. hostinger_complete_deploy\index.html 
echo    → Upload to: public_html\index.html
echo.
echo 2. hostinger_complete_deploy\static\js\main.197ebe19.js
echo    → Upload to: public_html\static\js\main.197ebe19.js
echo.
echo 3. hostinger_complete_deploy\api\index.php
echo    → Upload to: public_html\api\index.php
echo.
echo After uploading, press Ctrl+Shift+R to refresh your website!
echo.
pause
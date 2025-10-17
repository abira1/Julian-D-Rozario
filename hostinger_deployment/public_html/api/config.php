<?php
/**
 * Database Configuration
 * Julian D'Rozario Portfolio API
 */

// Prevent direct access
if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'u691568332_Juliandrozario');
define('DB_PASS', 'Toiral185#4');
define('DB_NAME', 'u691568332_toiraldbhub');
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration
// IMPORTANT: Generate a secure secret key using: openssl rand -hex 32
// Default key provided below - CHANGE THIS for production security!
define('JWT_SECRET', '13c12eada01f9ebdff03d5735d8eac725835a064b21015a521d719941cfa56f5');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRY', 86400); // 24 hours

// Authorized Admin Emails
define('AUTHORIZED_ADMIN_EMAILS', [
    'juliandrozario@gmail.com',
    'abirsabirhossain@gmail.com'
]);

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'https://drozario.blog',
    'https://www.drozario.blog',
    'http://localhost:3000' // Development
]);

// Upload Configuration
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/blog_images/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Environment
define('ENVIRONMENT', 'production');
define('DEBUG_MODE', false);

// Error Reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('UTC');
?>
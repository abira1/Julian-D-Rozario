<?php
/**
 * Julian D'Rozario Portfolio API - Main Router
 * PHP Backend for Hostinger Shared Hosting
 * Domain: drozario.blog
 */

// Include configuration
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/');

// Get request body for POST/PUT requests
$input = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $input = json_decode(file_get_contents('php://input'), true);
}

// Route the request
try {
    // Health check
    if ($path === 'health' || $path === 'api/health') {
        sendJSON([
            'status' => 'healthy',
            'database' => 'MySQL',
            'timestamp' => date('c')
        ]);
    }
    
    // Root endpoint
    if (empty($path) || $path === 'api') {
        sendJSON([
            'message' => "Julian D'Rozario Portfolio API",
            'status' => 'running',
            'database' => 'MySQL',
            'version' => '2.0.0-PHP'
        ]);
    }
    
    // SEO Routes
    if ($path === 'sitemap.xml') {
        require_once __DIR__ . '/endpoints/seo.php';
        generateSitemap();
        exit();
    }
    
    if ($path === 'robots.txt') {
        require_once __DIR__ . '/endpoints/seo.php';
        generateRobotsTxt();
        exit();
    }
    
    // Authentication Routes
    if (preg_match('#^auth/(.+)$#', $path, $matches)) {
        require_once __DIR__ . '/endpoints/auth.php';
        handleAuthRoute($method, $matches[1], $input);
        exit();
    }
    
    // Blog Routes
    if (preg_match('#^blogs(/(.+))?$#', $path, $matches)) {
        require_once __DIR__ . '/endpoints/blogs.php';
        $subpath = isset($matches[2]) ? $matches[2] : '';
        handleBlogRoute($method, $subpath, $input);
        exit();
    }
    
    // Categories Route
    if ($path === 'categories') {
        require_once __DIR__ . '/endpoints/blogs.php';
        handleCategoriesRoute($method);
        exit();
    }
    
    // User Profile Routes
    if (preg_match('#^user/(.+)$#', $path, $matches)) {
        require_once __DIR__ . '/endpoints/user.php';
        handleUserRoute($method, $matches[1], $input);
        exit();
    }
    
    // Contact Info Routes
    if (preg_match('#^(admin/)?contact-info(/(\d+))?$#', $path, $matches)) {
        require_once __DIR__ . '/endpoints/contact.php';
        $isAdmin = !empty($matches[1]);
        $contactId = isset($matches[3]) ? (int)$matches[3] : null;
        handleContactRoute($method, $isAdmin, $contactId, $input);
        exit();
    }
    
    // Comments Routes
    if (preg_match('#^comments/(\d+)$#', $path, $matches)) {
        require_once __DIR__ . '/endpoints/comments.php';
        handleCommentRoute($method, (int)$matches[1], $input);
        exit();
    }
    
    // 404 Not Found
    sendJSON(['error' => 'Endpoint not found', 'path' => $path], 404);
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendJSON(['error' => 'Internal server error', 'message' => $e->getMessage()], 500);
}
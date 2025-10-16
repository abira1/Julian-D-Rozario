<?php
/**
 * API Entry Point
 * Julian D'Rozario Portfolio API
 */

define('API_ACCESS', true);

require_once 'config.php';
require_once 'cors.php';
require_once 'database.php';
require_once 'auth.php';

header('Content-Type: application/json');

// Simple router
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path = rtrim($path, '/');

// Health check
if ($path === '/' || $path === '') {
    echo json_encode([
        'message' => "Julian D'Rozario Portfolio API",
        'status' => 'running',
        'database' => 'MySQL',
        'version' => '2.0.0'
    ]);
    exit;
}

if ($path === '/health') {
    echo json_encode([
        'status' => 'healthy',
        'database' => 'MySQL',
        'timestamp' => date('c')
    ]);
    exit;
}

// Route to appropriate handler
if (strpos($path, '/blogs') === 0) {
    require_once 'blogs.php';
} elseif (strpos($path, '/categories') === 0) {
    require_once 'categories.php';
} elseif (strpos($path, '/contact-info') === 0) {
    require_once 'contact.php';
} elseif (strpos($path, '/auth') === 0) {
    require_once 'authentication.php';
} elseif (strpos($path, '/user') === 0) {
    require_once 'user.php';
} elseif (strpos($path, '/upload-image') === 0) {
    require_once 'upload.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
?>
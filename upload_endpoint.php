<?php
// Simple upload endpoint for banner images
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only handle POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Check if file was uploaded
if (!isset($_FILES['banner_image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
    exit();
}

$file = $_FILES['banner_image'];

// Validate file type
$allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
$file_type = strtolower($file['type']);
if (!in_array($file_type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, WebP allowed.']);
    exit();
}

// Validate file size (max 10MB)
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 10MB.']);
    exit();
}

// Create upload directories
$upload_base = 'uploads';
$dirs = ['banners', 'thumbnails', 'medium', 'large'];

foreach ($dirs as $dir) {
    $path = $upload_base . '/' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('banner_') . '.' . $ext;

// Save the uploaded file
$hero_path = $upload_base . '/banners/' . $filename;
if (move_uploaded_file($file['tmp_name'], $hero_path)) {
    // Return file paths (in production, you'd create different sized versions)
    $files = [
        'hero' => '/' . $hero_path,
        'large' => '/' . $hero_path,
        'medium' => '/' . $hero_path,
        'thumbnail' => '/' . $hero_path
    ];
    
    echo json_encode([
        'success' => true,
        'message' => 'Banner uploaded successfully!',
        'files' => $files,
        'original_name' => $file['name'],
        'size' => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
}
?>
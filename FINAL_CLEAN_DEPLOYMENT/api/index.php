<?php
// Force error reporting and display for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Catch fatal errors and return JSON
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_CORE_ERROR || $error['type'] === E_COMPILE_ERROR)) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Fatal error', 'details' => $error['message'], 'file' => $error['file'], 'line' => $error['line']]);
        exit();
    }
});
/**
 * Julian Portfolio - Hostinger PHP Backend
 * Complete backend with MySQL and Google Authentication
 */

// Enable CORS for your frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// Add debug header to identify response
header('X-API-Response: Julian-Portfolio-API');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration - UPDATE WITH YOUR HOSTINGER CREDENTIALS
$db_config = [
    'host' => 'localhost',
    'username' => 'u691568332_Juliandrozario',
    'password' => 'Genesis@2147',
    'database' => 'u691568332_julian_datahub'
];

// JWT Secret Key
$jwt_secret = 'julian-portfolio-super-secret-jwt-key-2024-hostinger';

// Authorized admin emails
$admin_emails = [
    'juliandrozario@gmail.com',
    'abirsabirhossain@gmail.com'
];

/**
 * Database Connection
 */
function getDatabase() {
    global $db_config;
    try {
        $pdo = new PDO(
            "mysql:host={$db_config['host']};dbname={$db_config['database']};charset=utf8mb4",
            $db_config['username'],
            $db_config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
}

/**
 * Simple JWT Token Generation
 */
function generateJWT($email) {
    global $jwt_secret;
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'email' => $email,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $jwt_secret, true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Verify Google Token
 */
function verifyGoogleToken($token) {
    $google_api_url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" . $token;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $google_api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        return json_decode($result, true);
    }
    
    // Try Firebase ID token verification
    $firebase_url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=AIzaSyCfY6LTtYomc_mTs8yu25g7dryXFsPpaAE";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $firebase_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['idToken' => $token]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $result = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $firebase_data = json_decode($result, true);
        $user_info = $firebase_data['users'][0] ?? [];
        
        return [
            'email' => $user_info['email'] ?? '',
            'name' => $user_info['displayName'] ?? '',
            'user_id' => $user_info['localId'] ?? ''
        ];
    }
    
    return false;
}

/**
 * Router
 */
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Debug logging
error_log("API Debug - Request URI: " . $request_uri);
error_log("API Debug - Parsed Path: " . $path);
error_log("API Debug - Method: " . $method);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);

error_log("API Debug - Final Path: " . $path);

// Routes
switch ($path) {
    case '/upload':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed. Use POST']);
            break;
        }
        // Check if file is uploaded
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            break;
        }
        $upload_dir = __DIR__ . '/uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $file = $_FILES['file'];
        $filename = uniqid('img_', true) . '_' . basename($file['name']);
        $target = $upload_dir . $filename;
        if (move_uploaded_file($file['tmp_name'], $target)) {
            $url = '/api/uploads/' . $filename;
            echo json_encode(['success' => true, 'url' => $url]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
        }
        break;
    case '/':
    case '':
        echo json_encode([
            'message' => 'Julian Portfolio API - Running on Hostinger!',
            'status' => 'active',
            'version' => '1.0.0'
        ]);
        break;
        
    case '/auth/firebase-login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['firebase_token'] ?? $_POST['firebase_token'] ?? '';
        
        if (!$token) {
            http_response_code(400);
            echo json_encode(['error' => 'Firebase token required']);
            break;
        }
        
        $user_data = verifyGoogleToken($token);
        if (!$user_data || !isset($user_data['email'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            break;
        }
        
        // Check if user is admin
        if (!in_array($user_data['email'], $admin_emails)) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            break;
        }
        
        // Store user in database
        try {
            $pdo = getDatabase();
            $stmt = $pdo->prepare("
                INSERT INTO admin_users (username, email, firebase_uid, last_login) 
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                last_login = NOW(), firebase_uid = VALUES(firebase_uid)
            ");
            
            $username = explode('@', $user_data['email'])[0];
            $stmt->execute([
                $username,
                $user_data['email'],
                $user_data['user_id'] ?? 'unknown'
            ]);
            
        } catch (Exception $e) {
            // Continue even if database update fails
        }
        
        // Generate JWT
        $jwt_token = generateJWT($user_data['email']);
        
        echo json_encode([
            'access_token' => $jwt_token,
            'token_type' => 'bearer',
            'user' => [
                'email' => $user_data['email'],
                'name' => $user_data['name'] ?? explode('@', $user_data['email'])[0]
            ],
            'expires_in' => 86400
        ]);
        break;
        
    case '/blogs':
        if ($method === 'GET') {
            try {
                $pdo = getDatabase();
                $stmt = $pdo->query("
                    SELECT id, title, excerpt, content, date, read_time, category, 
                           author, image_url, featured, tags, views, likes, created_at
                    FROM blogs 
                    ORDER BY created_at DESC
                ");
                
                $blogs = $stmt->fetchAll();
                
                // Parse JSON tags safely
                foreach ($blogs as &$blog) {
                    if (isset($blog['tags']) && is_string($blog['tags']) && $blog['tags'] !== '') {
                        $tags = json_decode($blog['tags'], true);
                        $blog['tags'] = is_array($tags) ? $tags : [];
                    } else {
                        $blog['tags'] = [];
                    }
                }
                
                echo json_encode(['blogs' => $blogs, 'total' => count($blogs)]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'error' => 'Failed to fetch blogs',
                    'details' => $e->getMessage()
                ]);
            }
        } elseif ($method === 'POST') {
            // Create new blog post
            $headers = getallheaders();
            $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$auth_header) {
                http_response_code(401);
                echo json_encode(['error' => 'Authorization required']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['title']) || !isset($input['content'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title and content are required']);
                break;
            }
            
            try {
                $pdo = getDatabase();
                $stmt = $pdo->prepare("
                    INSERT INTO blogs (title, excerpt, content, date, read_time, category, author, image_url, featured, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $input['title'],
                    $input['excerpt'] ?? '',
                    $input['content'],
                    $input['date'] ?? date('Y-m-d'),
                    $input['read_time'] ?? '5 min read',
                    $input['category'] ?? 'General',
                    $input['author'] ?? 'Julian D\'Rozario',
                    $input['image_url'] ?? null,
                    $input['featured'] ?? false,
                    json_encode($input['tags'] ?? [])
                ]);
                
                $blog_id = $pdo->lastInsertId();
                
                echo json_encode([
                    'message' => 'Blog created successfully',
                    'blog_id' => $blog_id
                ]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create blog']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    // Individual blog post endpoint
    case (preg_match('#^/blogs/(\d+)$#', $path, $matches) ? true : false):
        if ($method === 'GET') {
            $blog_id = $matches[1];
            try {
                $pdo = getDatabase();
                $stmt = $pdo->prepare("
                    SELECT id, title, excerpt, content, date, read_time, category, 
                           author, image_url, featured, tags, views, likes, created_at
                    FROM blogs 
                    WHERE id = ?
                ");
                
                $stmt->execute([$blog_id]);
                $blog = $stmt->fetch();
                
                if ($blog) {
                    // Parse JSON tags
                    $blog['tags'] = $blog['tags'] ? json_decode($blog['tags'], true) : [];
                    echo json_encode($blog);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Blog not found']);
                }
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch blog']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case '/admin/verify':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed. Use POST with Authorization header']);
            break;
        }
        
        // Check for authorization header
        $headers = getallheaders();
        $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!$auth_header) {
            http_response_code(401);
            echo json_encode(['error' => 'No authorization header provided']);
            break;
        }
        
        // Extract token
        if (!preg_match('/Bearer\s+(.*)$/i', $auth_header, $matches)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid authorization format']);
            break;
        }
        
        $token = $matches[1];
        
        // Verify token (simplified - in production, verify JWT properly)
        $user_data = verifyGoogleToken($token);
        if (!$user_data || !isset($user_data['email'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            break;
        }
        
        // Check if user is admin
        if (!in_array($user_data['email'], $admin_emails)) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required']);
            break;
        }
        
        echo json_encode([
            'valid' => true,
            'user' => [
                'email' => $user_data['email'],
                'name' => $user_data['name'] ?? explode('@', $user_data['email'])[0],
                'role' => 'admin'
            ]
        ]);
        break;
        
    case '/admin/stats':
        // Simple endpoint to check admin authentication without token
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        
        try {
            $pdo = getDatabase();
            
            // Get blog count
            $blog_count = $pdo->query("SELECT COUNT(*) as count FROM blogs")->fetch()['count'];
            
            // Get admin count
            $admin_count = $pdo->query("SELECT COUNT(*) as count FROM admin_users")->fetch()['count'];
            
            // Get total views
            $total_views = $pdo->query("SELECT SUM(views) as total FROM blogs")->fetch()['total'] ?? 0;
            
            echo json_encode([
                'stats' => [
                    'total_blogs' => (int)$blog_count,
                    'total_admins' => (int)$admin_count,
                    'total_views' => (int)$total_views,
                    'api_status' => 'active'
                ],
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch stats']);
        }
        break;
        
    case '/stats':
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        
        try {
            $pdo = getDatabase();
            
            // Get blog count
            $blog_count = $pdo->query("SELECT COUNT(*) as count FROM blogs")->fetch()['count'];
            
            // Get featured blogs count
            $featured_count = $pdo->query("SELECT COUNT(*) as count FROM blogs WHERE featured = 1")->fetch()['count'];
            
            // Get total views
            $total_views = $pdo->query("SELECT COALESCE(SUM(views), 0) as total FROM blogs")->fetch()['total'];
            
            // Get total likes
            $total_likes = $pdo->query("SELECT COALESCE(SUM(likes), 0) as total FROM blogs")->fetch()['total'];
            
            // Get categories count
            $categories_count = $pdo->query("SELECT COUNT(DISTINCT category) as count FROM blogs WHERE category IS NOT NULL AND category != ''")->fetch()['count'];
            
            echo json_encode([
                'total_blogs' => (int)$blog_count,
                'featured_blogs' => (int)$featured_count,
                'total_views' => (int)$total_views,
                'total_likes' => (int)$total_likes,
                'categories' => (int)$categories_count
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch stats']);
        }
        break;
        
    case '/categories':
        if ($method === 'GET') {
            // Return predefined categories for blog posts
            $categories = [
                ['id' => 1, 'name' => 'Technology', 'description' => 'Tech-related posts'],
                ['id' => 2, 'name' => 'Business Strategy', 'description' => 'Business and strategy content'],
                ['id' => 3, 'name' => 'UAE Business', 'description' => 'UAE business formation and consulting'],
                ['id' => 4, 'name' => 'Market Analysis', 'description' => 'Market research and analysis'],
                ['id' => 5, 'name' => 'Consulting', 'description' => 'Business consulting insights'],
                ['id' => 6, 'name' => 'Industry News', 'description' => 'Latest industry updates'],
                ['id' => 7, 'name' => 'Case Studies', 'description' => 'Real-world case studies'],
                ['id' => 8, 'name' => 'Tips & Guides', 'description' => 'Helpful tips and guides']
            ];
            
            echo json_encode($categories);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case '/test':
        echo json_encode([
            'message' => 'Test endpoint working',
            'timestamp' => date('Y-m-d H:i:s'),
            'server_info' => [
                'php_version' => PHP_VERSION,
                'request_method' => $method,
                'request_uri' => $_SERVER['REQUEST_URI'],
                'path' => $path
            ]
        ]);
        break;
    
    default:
        error_log("API Debug - Unmatched path: '" . $path . "'");
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'path' => $path, 'uri' => $request_uri]);
        break;
}
?>
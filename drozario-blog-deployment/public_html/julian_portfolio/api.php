<?php
/**
 * Julian D'Rozario Portfolio - PHP Backend for Hostinger
 * Simple PHP API that works with shared hosting
 * Database: u691568332_Dataubius
 */

// Enable error reporting for development
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set content type to JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$db_config = [
    'host' => 'localhost',
    'username' => 'u691568332_Dataubius',
    'password' => 'Dataubius@2024',
    'database' => 'u691568332_Dataubius'
];

// Connect to database
function getDBConnection() {
    global $db_config;
    
    try {
        $pdo = new PDO(
            "mysql:host={$db_config['host']};dbname={$db_config['database']};charset=utf8mb4",
            $db_config['username'],
            $db_config['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

// Get request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/');

// Route the request
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        handleGET($path);
        break;
    case 'POST':
        handlePOST($path);
        break;
    case 'PUT':
        handlePUT($path);
        break;
    case 'DELETE':
        handleDELETE($path);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function handleGET($path) {
    if (empty($path) || $path === '/') {
        // API health check
        echo json_encode([
            'message' => 'Julian D\'Rozario Portfolio API is running',
            'status' => 'success',
            'version' => '2.0',
            'timestamp' => date('c')
        ]);
        return;
    }
    
    switch ($path) {
        case 'blogs':
            getBlogs();
            break;
        case 'categories':
            getCategories();
            break;
        case 'contact':
            getContactInfo();
            break;
        default:
            // Check for blog interaction endpoints
            if (preg_match('#^blogs/(\d+)/comments$#', $path, $matches)) {
                getBlogComments($matches[1]);
            } elseif (preg_match('#^blogs/(\d+)/user-like-status$#', $path, $matches)) {
                getUserLikeStatus($matches[1]);
            } elseif (preg_match('#^blogs/(\d+)/user-save-status$#', $path, $matches)) {
                getUserSaveStatus($matches[1]);
            } elseif (preg_match('#^blogs/(.+)$#', $path, $matches)) {
                getBlogBySlug($matches[1]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;
    }
}

function handlePOST($path) {
    // Admin authentication would go here
    switch ($path) {
        case 'blogs':
            createBlog();
            break;
        case 'auth/google':
            handleGoogleAuth();
            break;
        case 'auth/firebase-admin-login':
            handleFirebaseAdminLogin();
            break;
        case 'auth/firebase-user-login':
            handleFirebaseUserLogin();
            break;
        default:
            // Check for blog interaction endpoints
            if (preg_match('#^blogs/(\d+)/like$#', $path, $matches)) {
                handleBlogLike($matches[1]);
            } elseif (preg_match('#^blogs/(\d+)/save$#', $path, $matches)) {
                handleBlogSave($matches[1]);
            } elseif (preg_match('#^blogs/(\d+)/comments$#', $path, $matches)) {
                handleBlogComment($matches[1]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;
    }
}

function handlePUT($path) {
    // Admin authentication would go here
    if (preg_match('#^blogs/(.+)$#', $path, $matches)) {
        updateBlog($matches[1]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

function handleDELETE($path) {
    // Admin authentication would go here
    if (preg_match('#^blogs/(.+)$#', $path, $matches)) {
        deleteBlog($matches[1]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
}

// API Functions
function getBlogs() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            SELECT b.*, c.name as category_name, c.color as category_color
            FROM blogs b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.is_published = 1 
            ORDER BY b.created_at DESC
        ");
        $stmt->execute();
        $blogs = $stmt->fetchAll();
        
        // Format the response
        foreach ($blogs as &$blog) {
            $blog['tags'] = json_decode($blog['tags'] ?? '[]', true);
            $blog['created_at'] = date('c', strtotime($blog['created_at']));
            $blog['updated_at'] = date('c', strtotime($blog['updated_at']));
        }
        
        echo json_encode([
            'blogs' => $blogs,
            'total' => count($blogs)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch blogs: ' . $e->getMessage()]);
    }
}

function getBlogBySlug($slug) {
    try {
        $pdo = getDBConnection();
        
        // Get blog by slug
        $stmt = $pdo->prepare("
            SELECT b.*, c.name as category_name, c.color as category_color
            FROM blogs b 
            LEFT JOIN categories c ON b.category_id = c.id 
            WHERE b.slug = ? AND b.is_published = 1
        ");
        $stmt->execute([$slug]);
        $blog = $stmt->fetch();
        
        if (!$blog) {
            http_response_code(404);
            echo json_encode(['error' => 'Blog not found']);
            return;
        }
        
        // Update view count
        $updateStmt = $pdo->prepare("UPDATE blogs SET views = views + 1 WHERE slug = ?");
        $updateStmt->execute([$slug]);
        $blog['views']++;
        
        // Format response
        $blog['tags'] = json_decode($blog['tags'] ?? '[]', true);
        $blog['created_at'] = date('c', strtotime($blog['created_at']));
        $blog['updated_at'] = date('c', strtotime($blog['updated_at']));
        
        echo json_encode($blog);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch blog: ' . $e->getMessage()]);
    }
}

function getCategories() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM categories ORDER BY name");
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        echo json_encode([
            'categories' => $categories,
            'total' => count($categories)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch categories: ' . $e->getMessage()]);
    }
}

function getContactInfo() {
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("
            SELECT * FROM contact_info 
            WHERE is_public = 1 
            ORDER BY sort_order, label
        ");
        $stmt->execute();
        $contacts = $stmt->fetchAll();
        
        echo json_encode([
            'contacts' => $contacts,
            'total' => count($contacts)
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch contact info: ' . $e->getMessage()]);
    }
}

function createBlog() {
    // Simple blog creation (admin auth would be added)
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['title']) || !isset($input['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title and content are required']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Generate slug from title
        $slug = generateSlug($input['title']);
        
        $stmt = $pdo->prepare("
            INSERT INTO blogs (title, slug, content, excerpt, author_email, category_id, tags, is_published, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        
        $stmt->execute([
            $input['title'],
            $slug,
            $input['content'],
            $input['excerpt'] ?? substr(strip_tags($input['content']), 0, 200),
            'juliandrozario@gmail.com',
            $input['category_id'] ?? 1,
            json_encode($input['tags'] ?? []),
            $input['is_published'] ?? true
        ]);
        
        $blogId = $pdo->lastInsertId();
        
        echo json_encode([
            'message' => 'Blog created successfully',
            'blog_id' => $blogId,
            'slug' => $slug
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create blog: ' . $e->getMessage()]);
    }
}

function updateBlog($slug) {
    // Simple blog update (admin auth would be added)
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'No data provided']);
            return;
        }
        
        $pdo = getDBConnection();
        
        // Build dynamic update query
        $fields = [];
        $values = [];
        
        if (isset($input['title'])) {
            $fields[] = 'title = ?';
            $values[] = $input['title'];
        }
        if (isset($input['content'])) {
            $fields[] = 'content = ?';
            $values[] = $input['content'];
        }
        if (isset($input['excerpt'])) {
            $fields[] = 'excerpt = ?';
            $values[] = $input['excerpt'];
        }
        if (isset($input['category_id'])) {
            $fields[] = 'category_id = ?';
            $values[] = $input['category_id'];
        }
        if (isset($input['tags'])) {
            $fields[] = 'tags = ?';
            $values[] = json_encode($input['tags']);
        }
        if (isset($input['is_published'])) {
            $fields[] = 'is_published = ?';
            $values[] = $input['is_published'];
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields to update']);
            return;
        }
        
        $fields[] = 'updated_at = NOW()';
        $values[] = $slug;
        
        $sql = "UPDATE blogs SET " . implode(', ', $fields) . " WHERE slug = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Blog updated successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Blog not found']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update blog: ' . $e->getMessage()]);
    }
}

function deleteBlog($slug) {
    // Simple blog deletion (admin auth would be added)
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("DELETE FROM blogs WHERE slug = ?");
        $stmt->execute([$slug]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['message' => 'Blog deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Blog not found']);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete blog: ' . $e->getMessage()]);
    }
}

function handleGoogleAuth() {
    // Simple Google OAuth placeholder
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['email'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        return;
    }
    
    // Check if email is authorized
    $authorizedEmails = ['juliandrozario@gmail.com', 'abirsabirhossain@gmail.com'];
    
    if (in_array($input['email'], $authorizedEmails)) {
        // Generate simple session token (in production, use proper JWT)
        $token = base64_encode(json_encode([
            'email' => $input['email'],
            'timestamp' => time(),
            'expires' => time() + (24 * 60 * 60) // 24 hours
        ]));
        
        echo json_encode([
            'access_token' => $token,
            'username' => $input['email'],
            'is_admin' => true,
            'expires_in' => 86400
        ]);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Email not authorized']);
    }
}

function generateSlug($title) {
    // Simple slug generation
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug;
}

// Firebase Authentication Functions
function handleFirebaseAdminLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['firebase_token']) || !isset($input['user_data'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Firebase token and user data are required']);
        return;
    }
    
    $userData = $input['user_data'];
    
    // Verify this is an admin user
    $authorizedAdmins = ['juliandrozario@gmail.com', 'abirsabirhossain@gmail.com'];
    
    if (!in_array($userData['email'], $authorizedAdmins)) {
        http_response_code(403);
        echo json_encode(['error' => 'Not authorized as admin']);
        return;
    }
    
    try {
        // Store/update admin user in database
        $pdo = getDBConnection();
        
        // Create users table if it doesn't exist
        createUsersTableIfNotExists($pdo);
        
        // Insert or update user
        $stmt = $pdo->prepare("
            INSERT INTO users (firebase_uid, email, name, picture, is_admin, created_at, updated_at) 
            VALUES (?, ?, ?, ?, 1, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            picture = VALUES(picture), 
            updated_at = NOW()
        ");
        
        $stmt->execute([
            $userData['uid'],
            $userData['email'],
            $userData['name'] ?? 'Admin User',
            $userData['picture'] ?? null
        ]);
        
        // Generate admin JWT token
        $token = createFirebaseJWT($userData['uid'], $userData['email'], true);
        
        echo json_encode([
            'access_token' => $token,
            'user' => [
                'uid' => $userData['uid'],
                'email' => $userData['email'],
                'name' => $userData['name'] ?? 'Admin User',
                'picture' => $userData['picture'] ?? null,
                'is_admin' => true
            ],
            'expires_in' => 86400
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to process admin login: ' . $e->getMessage()]);
    }
}

function handleFirebaseUserLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['firebase_token']) || !isset($input['user_data'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Firebase token and user data are required']);
        return;
    }
    
    $userData = $input['user_data'];
    
    try {
        // Store/update user in database
        $pdo = getDBConnection();
        
        // Create users table if it doesn't exist
        createUsersTableIfNotExists($pdo);
        
        // Insert or update user
        $stmt = $pdo->prepare("
            INSERT INTO users (firebase_uid, email, name, picture, is_admin, created_at, updated_at) 
            VALUES (?, ?, ?, ?, 0, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            picture = VALUES(picture), 
            updated_at = NOW()
        ");
        
        $stmt->execute([
            $userData['uid'],
            $userData['email'],
            $userData['name'] ?? 'User',
            $userData['picture'] ?? null
        ]);
        
        // Get user ID
        $stmt = $pdo->prepare("SELECT id FROM users WHERE firebase_uid = ?");
        $stmt->execute([$userData['uid']]);
        $user = $stmt->fetch();
        
        // Generate user JWT token
        $token = createFirebaseJWT($userData['uid'], $userData['email'], false);
        
        echo json_encode([
            'access_token' => $token,
            'user' => [
                'id' => $user['id'],
                'uid' => $userData['uid'],
                'email' => $userData['email'],
                'name' => $userData['name'] ?? 'User',
                'picture' => $userData['picture'] ?? null,
                'is_admin' => false
            ],
            'expires_in' => 86400
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to process user login: ' . $e->getMessage()]);
    }
}

function createFirebaseJWT($uid, $email, $isAdmin) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'uid' => $uid,
        'email' => $email,
        'is_admin' => $isAdmin,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, 'your-secret-key', true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyFirebaseJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $validSignature = hash_hmac('sha256', $header . "." . $payload, 'your-secret-key', true);
    $validBase64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));
    
    if ($signature !== $validBase64Signature) {
        return false;
    }
    
    $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    if ($decodedPayload['exp'] < time()) {
        return false;
    }
    
    return $decodedPayload;
}

function getCurrentFirebaseUser() {
    $headers = getAuthHeaders();
    if (!isset($headers['Authorization'])) {
        return null;
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $payload = verifyFirebaseJWT($token);
    
    if (!$payload) {
        return null;
    }
    
    try {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE firebase_uid = ?");
        $stmt->execute([$payload['uid']]);
        return $stmt->fetch();
    } catch (Exception $e) {
        return null;
    }
}

function getAuthHeaders() {
    $headers = array();
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers['Authorization'] = $requestHeaders['Authorization'];
        }
    }
    return $headers;
}

// Blog Interaction Functions
function handleBlogLike($blogId) {
    $user = getCurrentFirebaseUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Create user_likes table if it doesn't exist
        createUserLikesTableIfNotExists($pdo);
        
        // Check if user already liked this blog
        $stmt = $pdo->prepare("SELECT id FROM user_likes WHERE user_id = ? AND blog_id = ?");
        $stmt->execute([$user['id'], $blogId]);
        $existingLike = $stmt->fetch();
        
        if ($existingLike) {
            // Unlike the blog
            $stmt = $pdo->prepare("DELETE FROM user_likes WHERE user_id = ? AND blog_id = ?");
            $stmt->execute([$user['id'], $blogId]);
            
            // Update blog likes count
            $stmt = $pdo->prepare("UPDATE blogs SET likes = GREATEST(0, likes - 1) WHERE id = ?");
            $stmt->execute([$blogId]);
            
            $liked = false;
        } else {
            // Like the blog
            $stmt = $pdo->prepare("INSERT INTO user_likes (user_id, blog_id, created_at) VALUES (?, ?, NOW())");
            $stmt->execute([$user['id'], $blogId]);
            
            // Update blog likes count
            $stmt = $pdo->prepare("UPDATE blogs SET likes = likes + 1 WHERE id = ?");
            $stmt->execute([$blogId]);
            
            $liked = true;
        }
        
        // Get updated likes count
        $stmt = $pdo->prepare("SELECT likes FROM blogs WHERE id = ?");
        $stmt->execute([$blogId]);
        $blog = $stmt->fetch();
        
        echo json_encode([
            'liked' => $liked,
            'likes' => $blog['likes'] ?? 0
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to process like: ' . $e->getMessage()]);
    }
}

function handleBlogSave($blogId) {
    $user = getCurrentFirebaseUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Create saved_blogs table if it doesn't exist
        createSavedBlogsTableIfNotExists($pdo);
        
        // Check if user already saved this blog
        $stmt = $pdo->prepare("SELECT id FROM saved_blogs WHERE user_id = ? AND blog_id = ?");
        $stmt->execute([$user['id'], $blogId]);
        $existingSave = $stmt->fetch();
        
        if ($existingSave) {
            // Unsave the blog
            $stmt = $pdo->prepare("DELETE FROM saved_blogs WHERE user_id = ? AND blog_id = ?");
            $stmt->execute([$user['id'], $blogId]);
            $saved = false;
        } else {
            // Save the blog
            $stmt = $pdo->prepare("INSERT INTO saved_blogs (user_id, blog_id, created_at) VALUES (?, ?, NOW())");
            $stmt->execute([$user['id'], $blogId]);
            $saved = true;
        }
        
        echo json_encode(['saved' => $saved]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to process save: ' . $e->getMessage()]);
    }
}

function handleBlogComment($blogId) {
    $user = getCurrentFirebaseUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['comment'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Comment is required']);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        // Create comments table if it doesn't exist
        createCommentsTableIfNotExists($pdo);
        
        // Insert comment
        $stmt = $pdo->prepare("
            INSERT INTO comments (blog_id, user_id, comment, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$blogId, $user['id'], trim($input['comment'])]);
        
        $commentId = $pdo->lastInsertId();
        
        // Return the new comment
        $stmt = $pdo->prepare("
            SELECT c.*, u.name as user_name, u.picture as user_picture
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = ?
        ");
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();
        
        echo json_encode(['comment' => $comment]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to post comment: ' . $e->getMessage()]);
    }
}

function getBlogComments($blogId) {
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("
            SELECT c.*, u.name as user_name, u.picture as user_picture
            FROM comments c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.blog_id = ? 
            ORDER BY c.created_at DESC
        ");
        $stmt->execute([$blogId]);
        $comments = $stmt->fetchAll();
        
        echo json_encode(['comments' => $comments]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to get comments: ' . $e->getMessage()]);
    }
}

function getUserLikeStatus($blogId) {
    $user = getCurrentFirebaseUser();
    if (!$user) {
        echo json_encode(['liked' => false]);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("SELECT id FROM user_likes WHERE user_id = ? AND blog_id = ?");
        $stmt->execute([$user['id'], $blogId]);
        $liked = $stmt->fetch() ? true : false;
        
        echo json_encode(['liked' => $liked]);
        
    } catch (Exception $e) {
        echo json_encode(['liked' => false]);
    }
}

function getUserSaveStatus($blogId) {
    $user = getCurrentFirebaseUser();
    if (!$user) {
        echo json_encode(['saved' => false]);
        return;
    }
    
    try {
        $pdo = getDBConnection();
        
        $stmt = $pdo->prepare("SELECT id FROM saved_blogs WHERE user_id = ? AND blog_id = ?");
        $stmt->execute([$user['id'], $blogId]);
        $saved = $stmt->fetch() ? true : false;
        
        echo json_encode(['saved' => $saved]);
        
    } catch (Exception $e) {
        echo json_encode(['saved' => false]);
    }
}

// Database Table Creation Functions
function createUsersTableIfNotExists($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            firebase_uid VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            picture TEXT,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_firebase_uid (firebase_uid),
            INDEX idx_email (email)
        )
    ");
}

function createUserLikesTableIfNotExists($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_likes (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            blog_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_blog_like (user_id, blog_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_blog_id (blog_id)
        )
    ");
}

function createCommentsTableIfNotExists($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            blog_id INT NOT NULL,
            user_id INT NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_blog_id (blog_id),
            INDEX idx_user_id (user_id)
        )
    ");
}

function createSavedBlogsTableIfNotExists($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS saved_blogs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            blog_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_blog_save (user_id, blog_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_blog_id (blog_id)
        )
    ");
}

?>
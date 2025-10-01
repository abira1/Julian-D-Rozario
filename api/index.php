<?php
/**
 * Julian Portfolio - Hostinger PHP Backend
 * Complete backend with MySQL and Google Authentication
 */

// Enable CORS for your frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration - UPDATE WITH YOUR HOSTINGER CREDENTIALS
$db_config = [
    'host' => 'localhost',
    'username' => 'u691568332_Juliandrozario',
    'password' => 'Gupisisi@2022!',
    'database' => 'u691568332_Dataubius'
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
 * File Upload Handler
 */
function handleFileUpload($file, $type = 'general') {
    // Validate file
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowed_types)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }
    
    if ($file['size'] > $max_size) {
        throw new Exception('File too large. Maximum size is 5MB.');
    }
    
    // Create upload directory if it doesn't exist
    $upload_dir = '../uploads/' . $type . '/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid($type . '_') . '.' . $extension;
    $filepath = $upload_dir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Return relative URL for frontend
        return '/uploads/' . $type . '/' . $filename;
    } else {
        throw new Exception('Failed to upload file.');
    }
}

/**
 * Router
 */
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Remove /api prefix if present
$path = preg_replace('#^/api#', '', $path);

// Routes
switch ($path) {
    case '/':
    case '':
        echo json_encode([
            'message' => 'Julian Portfolio API - Running on Hostinger!',
            'status' => 'active',
            'version' => '1.0.0'
        ]);
        break;
        
    case '/auth/firebase-login':
    case '/auth/google-login':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['firebase_token'] ?? '';
        
        if (!$token) {
            http_response_code(400);
            echo json_encode(['error' => 'Token required']);
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
                
                // Parse JSON data and handle structured blogs
                foreach ($blogs as &$blog) {
                    $blog['tags'] = $blog['tags'] ? json_decode($blog['tags'], true) : [];
                    $blog['featured'] = (bool)$blog['featured'];
                    
                    // Handle structured data from excerpt field
                    if ($blog['excerpt'] && substr($blog['excerpt'], 0, 1) === '{') {
                        try {
                            $structuredData = json_decode($blog['excerpt'], true);
                            if ($structuredData && isset($structuredData['type']) && $structuredData['type'] === 'structured') {
                                // Merge structured data into blog object
                                $blog = array_merge($blog, $structuredData);
                                $blog['type'] = 'structured';
                                
                                // Keep original excerpt as subtitle if available
                                if (isset($structuredData['subtitle'])) {
                                    $blog['excerpt'] = $structuredData['subtitle'];
                                }
                            }
                        } catch (Exception $e) {
                            // If JSON parsing fails, keep as regular excerpt
                        }
                    }
                    
                    // Ensure featured_image is available
                    if (!isset($blog['featured_image']) && isset($blog['image_url'])) {
                        $blog['featured_image'] = $blog['image_url'];
                    }
                }
                
                echo json_encode(['blogs' => $blogs, 'total' => count($blogs)]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch blogs']);
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
            
            if (!$input || !isset($input['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                break;
            }
            
            try {
                $pdo = getDatabase();
                
                // Handle structured blog data
                $structuredData = [];
                $fullContent = '';
                $authorName = 'Julian D\'Rozario';
                
                if (isset($input['author']) && is_array($input['author'])) {
                    $authorName = $input['author']['name'] ?? 'Julian D\'Rozario';
                }
                
                // Build structured data from form
                if (isset($input['type']) && $input['type'] === 'structured') {
                    $structuredData = [
                        'type' => 'structured',
                        'subtitle' => $input['subtitle'] ?? '',
                        'introduction' => $input['introduction'] ?? '',
                        'key_takeaways' => $input['key_takeaways'] ?? [],
                        'quick_stats' => $input['quick_stats'] ?? [],
                        'main_content' => $input['main_content'] ?? [],
                        'quote_text' => $input['quote_text'] ?? '',
                        'quote_author' => $input['quote_author'] ?? '',
                        'implementation_framework' => $input['implementation_framework'] ?? '',
                        'phases' => $input['phases'] ?? [],
                        'featured_image' => $input['featured_image'] ?? ''
                    ];
                    
                    // Build content from structured fields
                    if (!empty($input['introduction'])) $fullContent .= $input['introduction'] . "\n\n";
                    if (!empty($input['main_content']) && is_array($input['main_content'])) {
                        $fullContent .= implode("\n\n", array_filter($input['main_content']));
                    }
                }
                
                if (isset($input['content'])) $fullContent .= $input['content'];
                
                // Use existing table structure
                $stmt = $pdo->prepare("
                    INSERT INTO blogs (title, excerpt, content, date, read_time, category, author, tags, featured, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ");
                
                $stmt->execute([
                    $input['title'] ?? '',
                    !empty($structuredData) ? json_encode($structuredData) : ($input['subtitle'] ?? $input['description'] ?? ''),
                    $fullContent ?: ($input['content'] ?? ''),
                    date('Y-m-d'),
                    $input['read_time'] ?? '5 min read',
                    $input['category'] ?? 'General',
                    $authorName,
                    json_encode($input['category_tags'] ?? $input['tags'] ?? []),
                    $input['featured'] ?? false
                ]);
                
                $blog_id = $pdo->lastInsertId();
                
                echo json_encode([
                    'success' => true,
                    'id' => $blog_id,
                    'message' => 'Blog created successfully'
                ]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create blog', 'details' => $e->getMessage()]);
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
        
    case '/worked-with':
        if ($method === 'GET') {
            // Get all companies
            try {
                $pdo = getDatabase();
                $stmt = $pdo->query("
                    SELECT id, name, logo_url, industry, description, website, 
                           display_order, is_featured, is_visible, created_at, updated_at
                    FROM worked_with 
                    WHERE is_visible = 1
                    ORDER BY display_order ASC, name ASC
                ");
                
                $companies = $stmt->fetchAll();
                
                echo json_encode([
                    'companies' => $companies, 
                    'total' => count($companies)
                ]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch companies']);
            }
            
        } elseif ($method === 'POST') {
            // Create new company
            $headers = getallheaders();
            $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$auth_header) {
                http_response_code(401);
                echo json_encode(['error' => 'Authorization required']);
                break;
            }
            
            // Handle multipart/form-data for file uploads
            $input_data = [];
            if (isset($_POST['name'])) {
                $input_data = $_POST;
            } else {
                $json_input = json_decode(file_get_contents('php://input'), true);
                $input_data = $json_input ?: [];
            }
            
            if (!$input_data || !isset($input_data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Company name is required']);
                break;
            }
            
            try {
                $pdo = getDatabase();
                
                // Handle file upload if present
                $logo_url = $input_data['logo_url'] ?? null;
                if (isset($_FILES['logo_file']) && $_FILES['logo_file']['error'] === UPLOAD_ERR_OK) {
                    $logo_url = handleFileUpload($_FILES['logo_file'], 'company_logo');
                }
                
                $stmt = $pdo->prepare("
                    INSERT INTO worked_with (name, logo_url, industry, description, website, 
                                           display_order, is_featured, is_visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $input_data['name'],
                    $logo_url,
                    $input_data['industry'] ?? '',
                    $input_data['description'] ?? '',
                    $input_data['website'] ?? '',
                    (int)($input_data['display_order'] ?? 0),
                    (bool)($input_data['is_featured'] ?? false),
                    (bool)($input_data['is_visible'] ?? true)
                ]);
                
                $company_id = $pdo->lastInsertId();
                
                echo json_encode([
                    'message' => 'Company created successfully',
                    'company_id' => $company_id
                ]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create company: ' . $e->getMessage()]);
            }
            
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    // Individual company endpoint
    case (preg_match('#^/worked-with/(\d+)$#', $path, $matches) ? true : false):
        $company_id = $matches[1];
        
        if ($method === 'GET') {
            // Get single company
            try {
                $pdo = getDatabase();
                $stmt = $pdo->prepare("
                    SELECT id, name, logo_url, industry, description, website, 
                           display_order, is_featured, is_visible, created_at, updated_at
                    FROM worked_with 
                    WHERE id = ?
                ");
                
                $stmt->execute([$company_id]);
                $company = $stmt->fetch();
                
                if ($company) {
                    echo json_encode($company);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Company not found']);
                }
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to fetch company']);
            }
            
        } elseif ($method === 'PUT') {
            // Update company
            $headers = getallheaders();
            $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$auth_header) {
                http_response_code(401);
                echo json_encode(['error' => 'Authorization required']);
                break;
            }
            
            // Handle multipart/form-data for file uploads
            $input_data = [];
            if (isset($_POST['name'])) {
                $input_data = $_POST;
            } else {
                $json_input = json_decode(file_get_contents('php://input'), true);
                $input_data = $json_input ?: [];
            }
            
            if (!$input_data || !isset($input_data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Company name is required']);
                break;
            }
            
            try {
                $pdo = getDatabase();
                
                // Handle file upload if present
                $logo_url = $input_data['logo_url'] ?? null;
                if (isset($_FILES['logo_file']) && $_FILES['logo_file']['error'] === UPLOAD_ERR_OK) {
                    $logo_url = handleFileUpload($_FILES['logo_file'], 'company_logo');
                }
                
                $stmt = $pdo->prepare("
                    UPDATE worked_with 
                    SET name = ?, logo_url = COALESCE(?, logo_url), industry = ?, 
                        description = ?, website = ?, display_order = ?, 
                        is_featured = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ");
                
                $stmt->execute([
                    $input_data['name'],
                    $logo_url,
                    $input_data['industry'] ?? '',
                    $input_data['description'] ?? '',
                    $input_data['website'] ?? '',
                    (int)($input_data['display_order'] ?? 0),
                    (bool)($input_data['is_featured'] ?? false),
                    (bool)($input_data['is_visible'] ?? true),
                    $company_id
                ]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['message' => 'Company updated successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Company not found']);
                }
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update company: ' . $e->getMessage()]);
            }
            
        } elseif ($method === 'DELETE') {
            // Delete company
            $headers = getallheaders();
            $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$auth_header) {
                http_response_code(401);
                echo json_encode(['error' => 'Authorization required']);
                break;
            }
            
            try {
                $pdo = getDatabase();
                $stmt = $pdo->prepare("DELETE FROM worked_with WHERE id = ?");
                $stmt->execute([$company_id]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['message' => 'Company deleted successfully']);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Company not found']);
                }
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete company']);
            }
            
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;
        
    case '/worked-with/bulk-delete':
        if ($method === 'DELETE') {
            $headers = getallheaders();
            $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$auth_header) {
                http_response_code(401);
                echo json_encode(['error' => 'Authorization required']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $ids = $input['ids'] ?? [];
            
            if (empty($ids) || !is_array($ids)) {
                http_response_code(400);
                echo json_encode(['error' => 'Company IDs are required']);
                break;
            }
            
            try {
                $pdo = getDatabase();
                $placeholders = str_repeat('?,', count($ids) - 1) . '?';
                $stmt = $pdo->prepare("DELETE FROM worked_with WHERE id IN ($placeholders)");
                $stmt->execute($ids);
                
                $deleted_count = $stmt->rowCount();
                echo json_encode([
                    'message' => "$deleted_count companies deleted successfully",
                    'deleted_count' => $deleted_count
                ]);
                
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete companies']);
            }
            
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        break;

    case '/upload':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        
        // Check authorization
        $headers = getallheaders();
        $token = isset($headers['Authorization']) 
            ? str_replace('Bearer ', '', $headers['Authorization'])
            : '';
            
        if (!$token || $token !== 'admin_token_2024') {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }
        
        try {
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['error' => 'No file uploaded or upload error']);
                break;
            }
            
            $file_url = handleFileUpload($_FILES['file'], 'blog_image');
            
            echo json_encode([
                'success' => true,
                'url' => $file_url,
                'message' => 'File uploaded successfully'
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
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
    
    case '/upload':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
        }
        
        // Handle banner image upload
        if (!isset($_FILES['banner_image'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No file uploaded']);
            break;
        }
        
        $file = $_FILES['banner_image'];
        
        // Validate file
        $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
        if (!in_array($file['type'], $allowed_types)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid file type']);
            break;
        }
        
        if ($file['size'] > 10 * 1024 * 1024) { // 10MB limit
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File too large']);
            break;
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
        
        $files = [];
        
        // Save original as hero size
        $hero_path = $upload_base . '/banners/' . $filename;
        if (move_uploaded_file($file['tmp_name'], $hero_path)) {
            $files['hero'] = '/' . $hero_path;
            
            // Create different sizes (simplified - would use image processing library in production)
            $files['large'] = '/' . $hero_path;
            $files['medium'] = '/' . $hero_path;
            $files['thumbnail'] = '/' . $hero_path;
            
            echo json_encode([
                'success' => true,
                'message' => 'Banner uploaded successfully',
                'files' => $files
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Upload failed']);
        }
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>
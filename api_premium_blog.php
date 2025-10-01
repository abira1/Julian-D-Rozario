<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$servername = "localhost";
$username = "u691568332_Dataubius";
$password = "Dataubius@2024";
$dbname = "u691568332_Dataubius";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit();
}

// Set charset
$conn->set_charset("utf8mb4");

// Helper function to get client IP
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    }
}

// Helper function to get user agent
function getUserAgent() {
    return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
}

// Helper function to ensure blog_stats exists for a blog
function ensureBlogStats($conn, $blog_id) {
    $check_sql = "SELECT id FROM blog_stats WHERE blog_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $blog_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows === 0) {
        $insert_sql = "INSERT INTO blog_stats (blog_id, views_count, likes_count, bookmarks_count, comments_count) VALUES (?, 0, 0, 0, 0)";
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param("i", $blog_id);
        $insert_stmt->execute();
        $insert_stmt->close();
    }
    $check_stmt->close();
}

// Get request URI and method
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Parse the URL
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Remove 'api' from path if present
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    array_shift($path_parts);
}

// Get the endpoint
$endpoint = $path_parts[0] ?? '';

try {
    switch ($endpoint) {
        
        case 'blogs':
            if ($request_method === 'GET') {
                if (isset($path_parts[1]) && is_numeric($path_parts[1])) {
                    // Get single blog with enhanced data
                    $blog_id = intval($path_parts[1]);
                    
                    // Check for specific sub-endpoints
                    $sub_endpoint = $path_parts[2] ?? '';
                    
                    if ($sub_endpoint === 'stats') {
                        // Get blog statistics
                        ensureBlogStats($conn, $blog_id);
                        
                        $sql = "SELECT 
                                    bs.views_count as views,
                                    bs.likes_count as likes,
                                    bs.bookmarks_count as bookmarks,
                                    bs.comments_count as comments,
                                    (SELECT COUNT(*) FROM blog_interactions bi WHERE bi.blog_id = ? AND bi.interaction_type = 'like' AND bi.user_ip = ?) as userLiked,
                                    (SELECT COUNT(*) FROM blog_interactions bi WHERE bi.blog_id = ? AND bi.interaction_type = 'bookmark' AND bi.user_ip = ?) as userBookmarked
                                FROM blog_stats bs 
                                WHERE bs.blog_id = ?";
                        
                        $stmt = $conn->prepare($sql);
                        $client_ip = getClientIP();
                        $stmt->bind_param("isisi", $blog_id, $client_ip, $blog_id, $client_ip, $blog_id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        
                        if ($result->num_rows > 0) {
                            $stats = $result->fetch_assoc();
                            $stats['userLiked'] = $stats['userLiked'] > 0;
                            $stats['userBookmarked'] = $stats['userBookmarked'] > 0;
                            echo json_encode($stats);
                        } else {
                            echo json_encode([
                                'views' => 0,
                                'likes' => 0,
                                'bookmarks' => 0,
                                'comments' => 0,
                                'userLiked' => false,
                                'userBookmarked' => false
                            ]);
                        }
                        $stmt->close();
                        
                    } elseif ($sub_endpoint === 'comments') {
                        // Get blog comments
                        $sql = "SELECT id, author_name, author_email, content, created_at, status 
                                FROM comments 
                                WHERE blog_id = ? AND status = 'approved' 
                                ORDER BY created_at DESC";
                        
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("i", $blog_id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        
                        $comments = [];
                        while ($row = $result->fetch_assoc()) {
                            $comments[] = $row;
                        }
                        
                        echo json_encode(['comments' => $comments]);
                        $stmt->close();
                        
                    } elseif ($sub_endpoint === 'like') {
                        // Handle like/unlike
                        if ($request_method === 'POST') {
                            $client_ip = getClientIP();
                            $user_agent = getUserAgent();
                            
                            // Check if user already liked this blog
                            $check_sql = "SELECT id FROM blog_interactions WHERE blog_id = ? AND user_ip = ? AND interaction_type = 'like'";
                            $check_stmt = $conn->prepare($check_sql);
                            $check_stmt->bind_param("is", $blog_id, $client_ip);
                            $check_stmt->execute();
                            $check_result = $check_stmt->get_result();
                            
                            $conn->begin_transaction();
                            
                            try {
                                if ($check_result->num_rows > 0) {
                                    // Unlike - remove the interaction
                                    $delete_sql = "DELETE FROM blog_interactions WHERE blog_id = ? AND user_ip = ? AND interaction_type = 'like'";
                                    $delete_stmt = $conn->prepare($delete_sql);
                                    $delete_stmt->bind_param("is", $blog_id, $client_ip);
                                    $delete_stmt->execute();
                                    $delete_stmt->close();
                                    
                                    // Update stats
                                    ensureBlogStats($conn, $blog_id);
                                    $update_sql = "UPDATE blog_stats SET likes_count = likes_count - 1 WHERE blog_id = ?";
                                    $update_stmt = $conn->prepare($update_sql);
                                    $update_stmt->bind_param("i", $blog_id);
                                    $update_stmt->execute();
                                    $update_stmt->close();
                                    
                                    $user_liked = false;
                                } else {
                                    // Like - add the interaction
                                    $insert_sql = "INSERT INTO blog_interactions (blog_id, user_ip, user_agent, interaction_type) VALUES (?, ?, ?, 'like')";
                                    $insert_stmt = $conn->prepare($insert_sql);
                                    $insert_stmt->bind_param("iss", $blog_id, $client_ip, $user_agent);
                                    $insert_stmt->execute();
                                    $insert_stmt->close();
                                    
                                    // Update stats
                                    ensureBlogStats($conn, $blog_id);
                                    $update_sql = "UPDATE blog_stats SET likes_count = likes_count + 1 WHERE blog_id = ?";
                                    $update_stmt = $conn->prepare($update_sql);
                                    $update_stmt->bind_param("i", $blog_id);
                                    $update_stmt->execute();
                                    $update_stmt->close();
                                    
                                    $user_liked = true;
                                }
                                
                                // Get updated like count
                                $count_sql = "SELECT likes_count FROM blog_stats WHERE blog_id = ?";
                                $count_stmt = $conn->prepare($count_sql);
                                $count_stmt->bind_param("i", $blog_id);
                                $count_stmt->execute();
                                $count_result = $count_stmt->get_result();
                                $likes = $count_result->fetch_assoc()['likes_count'];
                                $count_stmt->close();
                                
                                $conn->commit();
                                echo json_encode([
                                    'success' => true,
                                    'likes' => $likes,
                                    'userLiked' => $user_liked
                                ]);
                                
                            } catch (Exception $e) {
                                $conn->rollback();
                                throw $e;
                            }
                            
                            $check_stmt->close();
                        }
                        
                    } elseif ($sub_endpoint === 'bookmark') {
                        // Handle bookmark/unbookmark
                        if ($request_method === 'POST') {
                            $client_ip = getClientIP();
                            $user_agent = getUserAgent();
                            
                            // Check if user already bookmarked this blog
                            $check_sql = "SELECT id FROM blog_interactions WHERE blog_id = ? AND user_ip = ? AND interaction_type = 'bookmark'";
                            $check_stmt = $conn->prepare($check_sql);
                            $check_stmt->bind_param("is", $blog_id, $client_ip);
                            $check_stmt->execute();
                            $check_result = $check_stmt->get_result();
                            
                            $conn->begin_transaction();
                            
                            try {
                                if ($check_result->num_rows > 0) {
                                    // Remove bookmark
                                    $delete_sql = "DELETE FROM blog_interactions WHERE blog_id = ? AND user_ip = ? AND interaction_type = 'bookmark'";
                                    $delete_stmt = $conn->prepare($delete_sql);
                                    $delete_stmt->bind_param("is", $blog_id, $client_ip);
                                    $delete_stmt->execute();
                                    $delete_stmt->close();
                                    
                                    // Update stats
                                    ensureBlogStats($conn, $blog_id);
                                    $update_sql = "UPDATE blog_stats SET bookmarks_count = bookmarks_count - 1 WHERE blog_id = ?";
                                    $update_stmt = $conn->prepare($update_sql);
                                    $update_stmt->bind_param("i", $blog_id);
                                    $update_stmt->execute();
                                    $update_stmt->close();
                                    
                                    $bookmarked = false;
                                } else {
                                    // Add bookmark
                                    $insert_sql = "INSERT INTO blog_interactions (blog_id, user_ip, user_agent, interaction_type) VALUES (?, ?, ?, 'bookmark')";
                                    $insert_stmt = $conn->prepare($insert_sql);
                                    $insert_stmt->bind_param("iss", $blog_id, $client_ip, $user_agent);
                                    $insert_stmt->execute();
                                    $insert_stmt->close();
                                    
                                    // Update stats
                                    ensureBlogStats($conn, $blog_id);
                                    $update_sql = "UPDATE blog_stats SET bookmarks_count = bookmarks_count + 1 WHERE blog_id = ?";
                                    $update_stmt = $conn->prepare($update_sql);
                                    $update_stmt->bind_param("i", $blog_id);
                                    $update_stmt->execute();
                                    $update_stmt->close();
                                    
                                    $bookmarked = true;
                                }
                                
                                $conn->commit();
                                echo json_encode([
                                    'success' => true,
                                    'bookmarked' => $bookmarked
                                ]);
                                
                            } catch (Exception $e) {
                                $conn->rollback();
                                throw $e;
                            }
                            
                            $check_stmt->close();
                        }
                        
                    } else {
                        // Get single blog details
                        $sql = "SELECT b.*, 
                                       bs.views_count as views,
                                       bs.likes_count as likes,
                                       bs.bookmarks_count as bookmarks,
                                       bs.comments_count as comments
                                FROM blogs b
                                LEFT JOIN blog_stats bs ON b.id = bs.blog_id
                                WHERE b.id = ?";
                        
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("i", $blog_id);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        
                        if ($result->num_rows > 0) {
                            $blog = $result->fetch_assoc();
                            
                            // Parse tags if they exist
                            if ($blog['tags']) {
                                $blog['tags'] = explode(',', $blog['tags']);
                            } else {
                                $blog['tags'] = [];
                            }
                            
                            // Increment view count
                            $client_ip = getClientIP();
                            $user_agent = getUserAgent();
                            
                            // Check if this IP has viewed this blog recently (within 24 hours)
                            $view_check_sql = "SELECT id FROM blog_interactions 
                                             WHERE blog_id = ? AND user_ip = ? AND interaction_type = 'view'
                                             AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)";
                            $view_check_stmt = $conn->prepare($view_check_sql);
                            $view_check_stmt->bind_param("is", $blog_id, $client_ip);
                            $view_check_stmt->execute();
                            $view_check_result = $view_check_stmt->get_result();
                            
                            if ($view_check_result->num_rows === 0) {
                                // Record new view
                                $view_sql = "INSERT INTO blog_interactions (blog_id, user_ip, user_agent, interaction_type) VALUES (?, ?, ?, 'view')";
                                $view_stmt = $conn->prepare($view_sql);
                                $view_stmt->bind_param("iss", $blog_id, $client_ip, $user_agent);
                                $view_stmt->execute();
                                $view_stmt->close();
                                
                                // Update view count in stats
                                ensureBlogStats($conn, $blog_id);
                                $update_view_sql = "UPDATE blog_stats SET views_count = views_count + 1 WHERE blog_id = ?";
                                $update_view_stmt = $conn->prepare($update_view_sql);
                                $update_view_stmt->bind_param("i", $blog_id);
                                $update_view_stmt->execute();
                                $update_view_stmt->close();
                                
                                $blog['views'] = ($blog['views'] ?? 0) + 1;
                            }
                            $view_check_stmt->close();
                            
                            echo json_encode($blog);
                        } else {
                            http_response_code(404);
                            echo json_encode(['error' => 'Blog not found']);
                        }
                        $stmt->close();
                    }
                } else {
                    // Get all blogs with pagination
                    $page = $_GET['page'] ?? 1;
                    $limit = $_GET['limit'] ?? 10;
                    $offset = ($page - 1) * $limit;
                    
                    $sql = "SELECT b.*, 
                                   bs.views_count as views,
                                   bs.likes_count as likes,
                                   bs.bookmarks_count as bookmarks,
                                   bs.comments_count as comments
                            FROM blogs b
                            LEFT JOIN blog_stats bs ON b.id = bs.blog_id
                            WHERE b.status = 'published'
                            ORDER BY b.created_at DESC
                            LIMIT ? OFFSET ?";
                    
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("ii", $limit, $offset);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    
                    $blogs = [];
                    while ($row = $result->fetch_assoc()) {
                        if ($row['tags']) {
                            $row['tags'] = explode(',', $row['tags']);
                        } else {
                            $row['tags'] = [];
                        }
                        $blogs[] = $row;
                    }
                    
                    // Get total count
                    $count_sql = "SELECT COUNT(*) as total FROM blogs WHERE status = 'published'";
                    $count_result = $conn->query($count_sql);
                    $total = $count_result->fetch_assoc()['total'];
                    
                    echo json_encode([
                        'blogs' => $blogs,
                        'pagination' => [
                            'page' => intval($page),
                            'limit' => intval($limit),
                            'total' => intval($total),
                            'pages' => ceil($total / $limit)
                        ]
                    ]);
                    
                    $stmt->close();
                }
            }
            break;
            
        case 'comments':
            if ($request_method === 'POST') {
                // Add new comment
                $input = json_decode(file_get_contents('php://input'), true);
                
                $blog_id = $input['blog_id'] ?? null;
                $author_name = $input['name'] ?? '';
                $author_email = $input['email'] ?? '';
                $content = $input['message'] ?? '';
                
                if (!$blog_id || !$author_name || !$author_email || !$content) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing required fields']);
                    break;
                }
                
                $sql = "INSERT INTO comments (blog_id, author_name, author_email, content, status) VALUES (?, ?, ?, ?, 'approved')";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("isss", $blog_id, $author_name, $author_email, $content);
                
                if ($stmt->execute()) {
                    $comment_id = $conn->insert_id;
                    
                    // Update comment count in stats
                    ensureBlogStats($conn, $blog_id);
                    $update_sql = "UPDATE blog_stats SET comments_count = comments_count + 1 WHERE blog_id = ?";
                    $update_stmt = $conn->prepare($update_sql);
                    $update_stmt->bind_param("i", $blog_id);
                    $update_stmt->execute();
                    $update_stmt->close();
                    
                    // Return the new comment
                    $get_sql = "SELECT id, author_name, author_email, content, created_at FROM comments WHERE id = ?";
                    $get_stmt = $conn->prepare($get_sql);
                    $get_stmt->bind_param("i", $comment_id);
                    $get_stmt->execute();
                    $result = $get_stmt->get_result();
                    $new_comment = $result->fetch_assoc();
                    $get_stmt->close();
                    
                    echo json_encode($new_comment);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to add comment']);
                }
                $stmt->close();
            }
            break;
            
        case 'categories':
            if ($request_method === 'GET') {
                $sql = "SELECT * FROM blog_categories ORDER BY name ASC";
                $result = $conn->query($sql);
                
                $categories = [];
                while ($row = $result->fetch_assoc()) {
                    $categories[] = $row;
                }
                
                echo json_encode(['categories' => $categories]);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
            break;
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
<?php
/**
 * Blog API Endpoints
 */

if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

$db = Database::getInstance();

// Parse path
$pathParts = explode('/', trim($path, '/'));
array_shift($pathParts); // Remove 'blogs'

$blogId = isset($pathParts[0]) && is_numeric($pathParts[0]) ? (int)$pathParts[0] : null;
$action = isset($pathParts[1]) ? $pathParts[1] : null;

try {
    // GET /blogs - List all blogs
    if ($method === 'GET' && !$blogId) {
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $featured = isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        $sql = "SELECT * FROM blogs WHERE status = 'published'";
        $params = [];
        
        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        
        if ($featured !== null) {
            $sql .= " AND is_featured = ?";
            $params[] = $featured ? 1 : 0;
        }
        
        $sql .= " ORDER BY date DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $blogs = $db->fetchAll($sql, $params);
        
        // Parse tags
        foreach ($blogs as &$blog) {
            $blog['tags'] = json_decode($blog['tags'] ?? '[]');
        }
        
        echo json_encode(['blogs' => $blogs, 'total' => count($blogs)]);
    }
    // GET /blogs/:id - Get single blog
    elseif ($method === 'GET' && $blogId && !$action) {
        $blog = $db->fetchOne("SELECT * FROM blogs WHERE id = ? AND status = 'published'", [$blogId]);
        
        if (!$blog) {
            http_response_code(404);
            echo json_encode(['error' => 'Blog not found']);
            exit;
        }
        
        $blog['tags'] = json_decode($blog['tags'] ?? '[]');
        
        // Increment views
        $db->execute("UPDATE blogs SET views = views + 1 WHERE id = ?", [$blogId]);
        
        echo json_encode($blog);
    }
    // POST /blogs - Create blog (Admin only)
    elseif ($method === 'POST' && !$blogId) {
        $user = Auth::requireAdmin();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO blogs (title, excerpt, content, image_url, featured_image, date, read_time, category, author, tags, is_featured, status, slug, meta_title, meta_description, keywords, og_image, canonical_url) VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $params = [
            $data['title'],
            $data['excerpt'],
            $data['content'],
            $data['image_url'] ?? null,
            $data['featured_image'] ?? null,
            $data['read_time'] ?? '5 min read',
            $data['category'],
            $data['author'] ?? "Julian D'Rozario",
            json_encode($data['tags'] ?? []),
            $data['is_featured'] ?? false,
            $data['status'] ?? 'published',
            $data['slug'] ?? null,
            $data['meta_title'] ?? null,
            $data['meta_description'] ?? null,
            $data['keywords'] ?? null,
            $data['og_image'] ?? null,
            $data['canonical_url'] ?? null
        ];
        
        $db->execute($sql, $params);
        $id = $db->lastInsertId();
        
        echo json_encode(['id' => $id, 'message' => 'Blog created successfully']);
    }
    // PUT /blogs/:id - Update blog (Admin only)
    elseif ($method === 'PUT' && $blogId) {
        $user = Auth::requireAdmin();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updates = [];
        $params = [];
        
        $allowedFields = ['title', 'excerpt', 'content', 'image_url', 'featured_image', 'read_time', 'category', 'author', 'is_featured', 'status', 'slug', 'meta_title', 'meta_description', 'keywords', 'og_image', 'canonical_url'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (isset($data['tags'])) {
            $updates[] = "tags = ?";
            $params[] = json_encode($data['tags']);
        }
        
        if (!empty($updates)) {
            $params[] = $blogId;
            $sql = "UPDATE blogs SET " . implode(', ', $updates) . " WHERE id = ?";
            $db->execute($sql, $params);
        }
        
        echo json_encode(['message' => 'Blog updated successfully']);
    }
    // DELETE /blogs/:id - Delete blog (Admin only)
    elseif ($method === 'DELETE' && $blogId) {
        $user = Auth::requireAdmin();
        
        $db->execute("DELETE FROM blogs WHERE id = ?", [$blogId]);
        
        echo json_encode(['message' => 'Blog deleted successfully']);
    }
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
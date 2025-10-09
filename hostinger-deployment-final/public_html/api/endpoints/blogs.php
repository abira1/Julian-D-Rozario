<?php
/**
 * Blog Endpoints
 */

function handleBlogRoute($method, $subpath, $input) {
    if (empty($subpath)) {
        // /api/blogs
        if ($method === 'GET') {
            getBlogs();
        } elseif ($method === 'POST') {
            createBlog($input);
        } else {
            sendJSON(['error' => 'Method not allowed'], 405);
        }
    } elseif (preg_match('#^(\d+)$#', $subpath, $matches)) {
        // /api/blogs/{id}
        $blogId = (int)$matches[1];
        if ($method === 'GET') {
            getBlog($blogId);
        } elseif ($method === 'PUT') {
            updateBlog($blogId, $input);
        } elseif ($method === 'DELETE') {
            deleteBlog($blogId);
        } else {
            sendJSON(['error' => 'Method not allowed'], 405);
        }
    } elseif (preg_match('#^(\d+)/(like|save|comments)$#', $subpath, $matches)) {
        // /api/blogs/{id}/like, /api/blogs/{id}/save, /api/blogs/{id}/comments
        $blogId = (int)$matches[1];
        $action = $matches[2];
        
        if ($action === 'like' && $method === 'POST') {
            likeBlog($blogId);
        } elseif ($action === 'save' && $method === 'POST') {
            saveBlog($blogId);
        } elseif ($action === 'comments' && $method === 'GET') {
            getBlogComments($blogId);
        } elseif ($action === 'comments' && $method === 'POST') {
            createComment($blogId, $input);
        } else {
            sendJSON(['error' => 'Method not allowed'], 405);
        }
    } elseif (preg_match('#^(\d+)/user-(like|save)-status$#', $subpath, $matches)) {
        $blogId = (int)$matches[1];
        $type = $matches[2];
        if ($type === 'like') {
            getUserLikeStatus($blogId);
        } else {
            getUserSaveStatus($blogId);
        }
    } else {
        sendJSON(['error' => 'Blog endpoint not found'], 404);
    }
}

function getBlogs() {
    $pdo = getDBConnection();
    
    $category = $_GET['category'] ?? null;
    $featured = isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null;
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 10;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    $query = "SELECT * FROM blogs WHERE status = 'published'";
    $params = [];
    
    if ($category) {
        $query .= " AND category = ?";
        $params[] = $category;
    }
    
    if ($featured !== null) {
        $query .= " AND is_featured = ?";
        $params[] = $featured ? 1 : 0;
    }
    
    $query .= " ORDER BY date DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $blogs = $stmt->fetchAll();
    
    // Parse tags
    foreach ($blogs as &$blog) {
        $blog['tags'] = $blog['tags'] ? json_decode($blog['tags']) : [];
    }
    
    sendJSON(['blogs' => $blogs, 'total' => count($blogs)]);
}

function getBlog($blogId) {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM blogs WHERE id = ? AND status = 'published'");
    $stmt->execute([$blogId]);
    $blog = $stmt->fetch();
    
    if (!$blog) {
        sendJSON(['error' => 'Blog not found'], 404);
    }
    
    // Parse tags
    $blog['tags'] = $blog['tags'] ? json_decode($blog['tags']) : [];
    
    // Increment views
    $stmt = $pdo->prepare("UPDATE blogs SET views = views + 1 WHERE id = ?");
    $stmt->execute([$blogId]);
    
    sendJSON($blog);
}

function createBlog($input) {
    verifyAdmin();
    
    if (!isset($input['title'], $input['excerpt'], $input['content'], $input['category'])) {
        sendJSON(['error' => 'Missing required fields'], 400);
    }
    
    $pdo = getDBConnection();
    
    // Generate slug
    $slug = $input['slug'] ?? generateSlug($input['title']);
    $metaTitle = $input['meta_title'] ?? substr($input['title'], 0, 60);
    $metaDescription = $input['meta_description'] ?? substr($input['excerpt'], 0, 160);
    $keywords = $input['keywords'] ?? $input['category'];
    
    $stmt = $pdo->prepare("
        INSERT INTO blogs (
            title, excerpt, content, date, read_time, category, author, tags, 
            is_featured, status, slug, meta_title, meta_description, keywords, og_image, canonical_url
        ) VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $input['title'],
        $input['excerpt'],
        $input['content'],
        $input['read_time'] ?? '5 min read',
        $input['category'],
        $input['author'] ?? "Julian D'Rozario",
        json_encode($input['tags'] ?? []),
        $input['is_featured'] ?? false,
        $input['status'] ?? 'published',
        $slug,
        $metaTitle,
        $metaDescription,
        $keywords,
        $input['og_image'] ?? '',
        $input['canonical_url'] ?? "/blog/$slug"
    ]);
    
    sendJSON(['id' => $pdo->lastInsertId(), 'slug' => $slug, 'message' => 'Blog created successfully']);
}

function updateBlog($blogId, $input) {
    verifyAdmin();
    
    $pdo = getDBConnection();
    
    // Check if blog exists
    $stmt = $pdo->prepare("SELECT id FROM blogs WHERE id = ?");
    $stmt->execute([$blogId]);
    if (!$stmt->fetch()) {
        sendJSON(['error' => 'Blog not found'], 404);
    }
    
    // Build update query
    $updates = [];
    $params = [];
    
    $allowedFields = ['title', 'excerpt', 'content', 'category', 'read_time', 'author', 'is_featured', 'status', 'slug', 'meta_title', 'meta_description', 'keywords', 'og_image', 'canonical_url'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (isset($input['tags'])) {
        $updates[] = "tags = ?";
        $params[] = json_encode($input['tags']);
    }
    
    if (empty($updates)) {
        sendJSON(['message' => 'No fields to update']);
    }
    
    $params[] = $blogId;
    $query = "UPDATE blogs SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    sendJSON(['message' => 'Blog updated successfully']);
}

function deleteBlog($blogId) {
    verifyAdmin();
    
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("DELETE FROM blogs WHERE id = ?");
    $stmt->execute([$blogId]);
    
    if ($stmt->rowCount() === 0) {
        sendJSON(['error' => 'Blog not found'], 404);
    }
    
    sendJSON(['message' => 'Blog deleted successfully']);
}

function handleCategoriesRoute($method) {
    if ($method !== 'GET') {
        sendJSON(['error' => 'Method not allowed'], 405);
    }
    
    $pdo = getDBConnection();
    $stmt = $pdo->query("SELECT DISTINCT category FROM blogs ORDER BY category");
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    sendJSON($categories);
}

function likeBlog($blogId) {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    // Get user_id
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$user['firebase_uid']]);
    $userRow = $stmt->fetch();
    if (!$userRow) {
        sendJSON(['error' => 'User not found'], 404);
    }
    $userId = $userRow['id'];
    
    // Check if already liked
    $stmt = $pdo->prepare("SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?");
    $stmt->execute([$blogId, $userId]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        // Unlike
        $stmt = $pdo->prepare("DELETE FROM blog_likes WHERE blog_id = ? AND user_id = ?");
        $stmt->execute([$blogId, $userId]);
        $stmt = $pdo->prepare("UPDATE blogs SET likes = likes - 1 WHERE id = ?");
        $stmt->execute([$blogId]);
        sendJSON(['liked' => false, 'message' => 'Blog unliked']);
    } else {
        // Like
        $stmt = $pdo->prepare("INSERT INTO blog_likes (blog_id, user_id, firebase_uid) VALUES (?, ?, ?)");
        $stmt->execute([$blogId, $userId, $user['firebase_uid']]);
        $stmt = $pdo->prepare("UPDATE blogs SET likes = likes + 1 WHERE id = ?");
        $stmt->execute([$blogId]);
        sendJSON(['liked' => true, 'message' => 'Blog liked']);
    }
}

function saveBlog($blogId) {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$user['firebase_uid']]);
    $userRow = $stmt->fetch();
    if (!$userRow) {
        sendJSON(['error' => 'User not found'], 404);
    }
    $userId = $userRow['id'];
    
    $stmt = $pdo->prepare("SELECT id FROM blog_saves WHERE blog_id = ? AND user_id = ?");
    $stmt->execute([$blogId, $userId]);
    $existing = $stmt->fetch();
    
    if ($existing) {
        $stmt = $pdo->prepare("DELETE FROM blog_saves WHERE blog_id = ? AND user_id = ?");
        $stmt->execute([$blogId, $userId]);
        sendJSON(['saved' => false, 'message' => 'Blog unsaved']);
    } else {
        $stmt = $pdo->prepare("INSERT INTO blog_saves (blog_id, user_id, firebase_uid) VALUES (?, ?, ?)");
        $stmt->execute([$blogId, $userId, $user['firebase_uid']]);
        sendJSON(['saved' => true, 'message' => 'Blog saved']);
    }
}

function getUserLikeStatus($blogId) {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$user['firebase_uid']]);
    $userRow = $stmt->fetch();
    if (!$userRow) {
        sendJSON(['liked' => false]);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM blog_likes WHERE blog_id = ? AND user_id = ?");
    $stmt->execute([$blogId, $userRow['id']]);
    $liked = $stmt->fetch() !== false;
    
    sendJSON(['liked' => $liked]);
}

function getUserSaveStatus($blogId) {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$user['firebase_uid']]);
    $userRow = $stmt->fetch();
    if (!$userRow) {
        sendJSON(['saved' => false]);
    }
    
    $stmt = $pdo->prepare("SELECT id FROM blog_saves WHERE blog_id = ? AND user_id = ?");
    $stmt->execute([$blogId, $userRow['id']]);
    $saved = $stmt->fetch() !== false;
    
    sendJSON(['saved' => $saved]);
}

function getBlogComments($blogId) {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT 
            c.id, c.blog_id, c.parent_comment_id, c.comment_text,
            c.is_edited, c.is_deleted, c.created_at, c.updated_at,
            u.display_name, u.email, u.photo_url
        FROM blog_comments c
        INNER JOIN user_profiles u ON c.user_id = u.id
        WHERE c.blog_id = ? AND c.is_deleted = 0
        ORDER BY c.created_at ASC
    ");
    $stmt->execute([$blogId]);
    $comments = $stmt->fetchAll();
    
    sendJSON(['comments' => $comments]);
}

function createComment($blogId, $input) {
    $user = verifyToken();
    
    if (!isset($input['comment_text'])) {
        sendJSON(['error' => 'Missing comment text'], 400);
    }
    
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT id FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$user['firebase_uid']]);
    $userRow = $stmt->fetch();
    if (!$userRow) {
        sendJSON(['error' => 'User not found'], 404);
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO blog_comments (blog_id, user_id, firebase_uid, parent_comment_id, comment_text)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $blogId,
        $userRow['id'],
        $user['firebase_uid'],
        $input['parent_comment_id'] ?? null,
        $input['comment_text']
    ]);
    
    sendJSON(['id' => $pdo->lastInsertId(), 'message' => 'Comment created successfully']);
}

function generateSlug($title) {
    $slug = strtolower($title);
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s]+/', '-', $slug);
    $slug = trim($slug, '-');
    return substr($slug, 0, 100);
}
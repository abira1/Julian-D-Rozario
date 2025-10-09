<?php
/**
 * User Profile Endpoints
 */

function handleUserRoute($method, $endpoint, $input) {
    if ($endpoint === 'profile') {
        if ($method === 'GET') {
            getUserProfile();
        } elseif ($method === 'PUT') {
            updateUserProfile($input);
        } else {
            sendJSON(['error' => 'Method not allowed'], 405);
        }
    } elseif ($endpoint === 'liked-blogs' && $method === 'GET') {
        getUserLikedBlogs();
    } elseif ($endpoint === 'saved-blogs' && $method === 'GET') {
        getUserSavedBlogs();
    } elseif ($endpoint === 'comments' && $method === 'GET') {
        getUserComments();
    } else {
        sendJSON(['error' => 'User endpoint not found'], 404);
    }
}

function getUserProfile() {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$user['firebase_uid']]);
    $profile = $stmt->fetch();
    
    if (!$profile) {
        sendJSON(['error' => 'User not found'], 404);
    }
    
    // Parse preferences
    if ($profile['preferences']) {
        $profile['preferences'] = json_decode($profile['preferences'], true);
    } else {
        $profile['preferences'] = [];
    }
    
    sendJSON($profile);
}

function updateUserProfile($input) {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $updates = [];
    $params = [];
    
    $allowedFields = ['display_name', 'photo_url', 'bio'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (isset($input['preferences'])) {
        $updates[] = "preferences = ?";
        $params[] = json_encode($input['preferences']);
    }
    
    if (empty($updates)) {
        sendJSON(['message' => 'No fields to update']);
    }
    
    $params[] = $user['firebase_uid'];
    $query = "UPDATE user_profiles SET " . implode(', ', $updates) . " WHERE firebase_uid = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    sendJSON(['message' => 'Profile updated successfully']);
}

function getUserLikedBlogs() {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT b.* FROM blogs b
        INNER JOIN blog_likes bl ON b.id = bl.blog_id
        INNER JOIN user_profiles u ON bl.user_id = u.id
        WHERE u.firebase_uid = ? AND b.status = 'published'
        ORDER BY bl.created_at DESC
    ");
    $stmt->execute([$user['firebase_uid']]);
    $blogs = $stmt->fetchAll();
    
    // Parse tags
    foreach ($blogs as &$blog) {
        $blog['tags'] = $blog['tags'] ? json_decode($blog['tags']) : [];
    }
    
    sendJSON(['blogs' => $blogs]);
}

function getUserSavedBlogs() {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT b.* FROM blogs b
        INNER JOIN blog_saves bs ON b.id = bs.blog_id
        INNER JOIN user_profiles u ON bs.user_id = u.id
        WHERE u.firebase_uid = ? AND b.status = 'published'
        ORDER BY bs.created_at DESC
    ");
    $stmt->execute([$user['firebase_uid']]);
    $blogs = $stmt->fetchAll();
    
    // Parse tags
    foreach ($blogs as &$blog) {
        $blog['tags'] = $blog['tags'] ? json_decode($blog['tags']) : [];
    }
    
    sendJSON(['blogs' => $blogs]);
}

function getUserComments() {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT 
            c.id, c.blog_id, c.comment_text, c.is_edited,
            c.created_at, c.updated_at,
            b.title as blog_title, b.excerpt as blog_excerpt
        FROM blog_comments c
        INNER JOIN user_profiles u ON c.user_id = u.id
        INNER JOIN blogs b ON c.blog_id = b.id
        WHERE u.firebase_uid = ? AND c.is_deleted = 0
        ORDER BY c.created_at DESC
    ");
    $stmt->execute([$user['firebase_uid']]);
    $comments = $stmt->fetchAll();
    
    sendJSON(['comments' => $comments]);
}
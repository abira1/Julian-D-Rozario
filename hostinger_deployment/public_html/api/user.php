<?php
/**
 * User API
 */

if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

$db = Database::getInstance();

try {
    // GET /user/profile
    if ($method === 'GET' && $path === '/user/profile') {
        $user = Auth::requireAuth();
        $firebaseUid = $user['firebase_uid'];
        
        $profile = $db->fetchOne("SELECT * FROM user_profiles WHERE firebase_uid = ?", [$firebaseUid]);
        
        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        $profile['preferences'] = json_decode($profile['preferences'] ?? '{}');
        echo json_encode($profile);
    }
    // PUT /user/profile
    elseif ($method === 'PUT' && $path === '/user/profile') {
        $user = Auth::requireAuth();
        $firebaseUid = $user['firebase_uid'];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $updates = [];
        $params = [];
        
        if (isset($data['display_name'])) {
            $updates[] = "display_name = ?";
            $params[] = $data['display_name'];
        }
        if (isset($data['photo_url'])) {
            $updates[] = "photo_url = ?";
            $params[] = $data['photo_url'];
        }
        if (isset($data['bio'])) {
            $updates[] = "bio = ?";
            $params[] = $data['bio'];
        }
        if (isset($data['preferences'])) {
            $updates[] = "preferences = ?";
            $params[] = json_encode($data['preferences']);
        }
        
        if (!empty($updates)) {
            $params[] = $firebaseUid;
            $sql = "UPDATE user_profiles SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE firebase_uid = ?";
            $db->execute($sql, $params);
        }
        
        echo json_encode(['message' => 'Profile updated successfully']);
    }
    else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>
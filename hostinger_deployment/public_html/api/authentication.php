<?php
/**
 * Authentication API
 * Firebase login endpoints
 */

if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

$db = Database::getInstance();

// Parse subpath
$subPath = str_replace('/auth', '', $path);

try {
    // POST /auth/firebase-user-login
    if ($method === 'POST' && $subPath === '/firebase-user-login') {
        $data = json_decode(file_get_contents('php://input'), true);
        $userData = $data['user_data'];
        
        $firebaseUid = $userData['uid'];
        $email = $userData['email'];
        $displayName = $userData['name'] ?? null;
        $photoUrl = $userData['picture'] ?? null;
        
        // Check if user exists
        $user = $db->fetchOne("SELECT * FROM user_profiles WHERE firebase_uid = ?", [$firebaseUid]);
        
        if ($user) {
            // Update last login
            $db->execute("UPDATE user_profiles SET last_login = NOW() WHERE firebase_uid = ?", [$firebaseUid]);
        } else {
            // Create new user
            $isAdmin = in_array($email, AUTHORIZED_ADMIN_EMAILS) ? 1 : 0;
            
            $db->execute(
                "INSERT INTO user_profiles (firebase_uid, email, display_name, photo_url, is_admin, last_login) VALUES (?, ?, ?, ?, ?, NOW())",
                [$firebaseUid, $email, $displayName, $photoUrl, $isAdmin]
            );
            
            $user = $db->fetchOne("SELECT * FROM user_profiles WHERE firebase_uid = ?", [$firebaseUid]);
        }
        
        // Generate JWT token
        $isAdmin = in_array($email, AUTHORIZED_ADMIN_EMAILS);
        $token = Auth::generateToken($email, $firebaseUid, $isAdmin);
        
        echo json_encode([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user['id'],
                'email' => $email,
                'display_name' => $displayName,
                'photo_url' => $photoUrl,
                'is_admin' => $isAdmin
            ]
        ]);
    }
    // POST /auth/firebase-admin-login
    elseif ($method === 'POST' && $subPath === '/firebase-admin-login') {
        $data = json_decode(file_get_contents('php://input'), true);
        $userData = $data['user_data'];
        $email = $userData['email'];
        
        if (!in_array($email, AUTHORIZED_ADMIN_EMAILS)) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied - Not an admin']);
            exit;
        }
        
        // Same as user login
        $firebaseUid = $userData['uid'];
        $displayName = $userData['name'] ?? null;
        $photoUrl = $userData['picture'] ?? null;
        
        $user = $db->fetchOne("SELECT * FROM user_profiles WHERE firebase_uid = ?", [$firebaseUid]);
        
        if ($user) {
            $db->execute("UPDATE user_profiles SET last_login = NOW() WHERE firebase_uid = ?", [$firebaseUid]);
        } else {
            $db->execute(
                "INSERT INTO user_profiles (firebase_uid, email, display_name, photo_url, is_admin, last_login) VALUES (?, ?, ?, ?, 1, NOW())",
                [$firebaseUid, $email, $displayName, $photoUrl]
            );
            $user = $db->fetchOne("SELECT * FROM user_profiles WHERE firebase_uid = ?", [$firebaseUid]);
        }
        
        $token = Auth::generateToken($email, $firebaseUid, true);
        
        echo json_encode([
            'access_token' => $token,
            'token_type' => 'bearer',
            'user' => [
                'id' => $user['id'],
                'email' => $email,
                'display_name' => $displayName,
                'photo_url' => $photoUrl,
                'is_admin' => true
            ]
        ]);
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
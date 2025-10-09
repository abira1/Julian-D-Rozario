<?php
/**
 * Authentication Endpoints
 */

function handleAuthRoute($method, $endpoint, $input) {
    if ($endpoint === 'firebase-user-login' && $method === 'POST') {
        firebaseUserLogin($input);
    } elseif ($endpoint === 'firebase-admin-login' && $method === 'POST') {
        firebaseAdminLogin($input);
    } else {
        sendJSON(['error' => 'Auth endpoint not found'], 404);
    }
}

function firebaseUserLogin($input) {
    if (!isset($input['user_data'])) {
        sendJSON(['error' => 'Missing user_data'], 400);
    }
    
    $userData = $input['user_data'];
    $firebaseUid = $userData['uid'] ?? null;
    $email = $userData['email'] ?? null;
    $displayName = $userData['name'] ?? null;
    $photoUrl = $userData['picture'] ?? null;
    
    if (!$firebaseUid || !$email) {
        sendJSON(['error' => 'Missing required user data'], 400);
    }
    
    // Get or create user
    $user = getOrCreateUser($firebaseUid, $email, $displayName, $photoUrl);
    
    // Check if admin
    $adminEmails = explode(',', AUTHORIZED_ADMIN_EMAILS);
    $isAdmin = in_array($email, $adminEmails);
    
    // Create JWT token
    $token = createJWT($email, $firebaseUid, $isAdmin);
    
    sendJSON([
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

function firebaseAdminLogin($input) {
    if (!isset($input['user_data'])) {
        sendJSON(['error' => 'Missing user_data'], 400);
    }
    
    $email = $input['user_data']['email'] ?? null;
    $adminEmails = explode(',', AUTHORIZED_ADMIN_EMAILS);
    
    if (!in_array($email, $adminEmails)) {
        sendJSON(['error' => 'Access denied - Not an admin'], 403);
    }
    
    firebaseUserLogin($input);
}

function getOrCreateUser($firebaseUid, $email, $displayName = null, $photoUrl = null) {
    $pdo = getDBConnection();
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$firebaseUid]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Update last login
        $stmt = $pdo->prepare("UPDATE user_profiles SET last_login = NOW() WHERE firebase_uid = ?");
        $stmt->execute([$firebaseUid]);
        return $user;
    }
    
    // Create new user
    $adminEmails = explode(',', AUTHORIZED_ADMIN_EMAILS);
    $isAdmin = in_array($email, $adminEmails);
    
    $stmt = $pdo->prepare("
        INSERT INTO user_profiles (firebase_uid, email, display_name, photo_url, is_admin, last_login)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$firebaseUid, $email, $displayName, $photoUrl, $isAdmin]);
    
    // Get the newly created user
    $stmt = $pdo->prepare("SELECT * FROM user_profiles WHERE firebase_uid = ?");
    $stmt->execute([$firebaseUid]);
    return $stmt->fetch();
}
<?php
/**
 * JWT Helper Functions
 * Simple JWT implementation for PHP
 */

/**
 * Base64 URL Encode
 */
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64 URL Decode
 */
function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

/**
 * Create JWT Token
 */
function createJWT($email, $firebase_uid, $is_admin = false) {
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    $payload = json_encode([
        'email' => $email,
        'firebase_uid' => $firebase_uid,
        'is_admin' => $is_admin,
        'exp' => time() + (ACCESS_TOKEN_EXPIRE_HOURS * 3600)
    ]);
    
    $base64UrlHeader = base64url_encode($header);
    $base64UrlPayload = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64url_encode($signature);
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify JWT Token
 */
function verifyJWT($token) {
    if (!$token) {
        return null;
    }
    
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        return null;
    }
    
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $tokenParts;
    
    // Verify signature
    $signature = base64url_decode($base64UrlSignature);
    $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
    // Decode payload
    $payload = json_decode(base64url_decode($base64UrlPayload), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

/**
 * Verify User is Authenticated
 */
function verifyToken() {
    $token = getBearerToken();
    if (!$token) {
        sendJSON(['error' => 'Authentication required'], 401);
    }
    
    $payload = verifyJWT($token);
    if (!$payload) {
        sendJSON(['error' => 'Invalid or expired token'], 401);
    }
    
    return $payload;
}

/**
 * Verify User is Admin
 */
function verifyAdmin() {
    $user = verifyToken();
    if (!isset($user['is_admin']) || !$user['is_admin']) {
        sendJSON(['error' => 'Admin access required'], 403);
    }
    return $user;
}
<?php
/**
 * Categories API
 */

if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

$db = Database::getInstance();

try {
    if ($method === 'GET') {
        $categories = $db->fetchAll("SELECT DISTINCT category FROM blogs ORDER BY category");
        $result = array_column($categories, 'category');
        echo json_encode($result);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>
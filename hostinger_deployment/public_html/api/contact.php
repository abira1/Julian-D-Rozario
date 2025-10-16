<?php
/**
 * Contact Info API
 */

if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

$db = Database::getInstance();

try {
    if ($method === 'GET') {
        $contacts = $db->fetchAll("SELECT * FROM contact_info WHERE is_visible = 1 ORDER BY display_order");
        echo json_encode($contacts);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>
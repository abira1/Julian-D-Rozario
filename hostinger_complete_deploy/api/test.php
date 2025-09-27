<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

echo json_encode([
    'message' => 'Simple API test working',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'test_blogs' => [
        ['id' => 1, 'title' => 'Test Blog 1', 'excerpt' => 'Test excerpt'],
        ['id' => 2, 'title' => 'Test Blog 2', 'excerpt' => 'Test excerpt']
    ]
]);
?>
<?php
/**
 * Contact Info Endpoints
 */

function handleContactRoute($method, $isAdmin, $contactId, $input) {
    if ($isAdmin) {
        // Admin routes
        if ($method === 'GET' && $contactId === null) {
            getAllContactInfo();
        } elseif ($method === 'POST' && $contactId === null) {
            createContactInfo($input);
        } elseif ($method === 'PUT' && $contactId) {
            updateContactInfo($contactId, $input);
        } elseif ($method === 'DELETE' && $contactId) {
            deleteContactInfo($contactId);
        } else {
            sendJSON(['error' => 'Method not allowed'], 405);
        }
    } else {
        // Public route
        if ($method === 'GET' && $contactId === null) {
            getContactInfo();
        } else {
            sendJSON(['error' => 'Method not allowed'], 405);
        }
    }
}

function getContactInfo() {
    $pdo = getDBConnection();
    
    $stmt = $pdo->query("SELECT * FROM contact_info WHERE is_visible = 1 ORDER BY display_order ASC");
    $contacts = $stmt->fetchAll();
    
    sendJSON($contacts);
}

function getAllContactInfo() {
    verifyAdmin();
    $pdo = getDBConnection();
    
    $stmt = $pdo->query("SELECT * FROM contact_info ORDER BY display_order ASC");
    $contacts = $stmt->fetchAll();
    
    sendJSON($contacts);
}

function createContactInfo($input) {
    verifyAdmin();
    
    if (!isset($input['label'], $input['value'], $input['contact_type'])) {
        sendJSON(['error' => 'Missing required fields'], 400);
    }
    
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        INSERT INTO contact_info (label, value, contact_type, icon, is_visible, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $input['label'],
        $input['value'],
        $input['contact_type'],
        $input['icon'] ?? 'info',
        $input['is_visible'] ?? true,
        $input['display_order'] ?? 0
    ]);
    
    sendJSON(['id' => $pdo->lastInsertId(), 'message' => 'Contact info created successfully']);
}

function updateContactInfo($contactId, $input) {
    verifyAdmin();
    
    $pdo = getDBConnection();
    
    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM contact_info WHERE id = ?");
    $stmt->execute([$contactId]);
    if (!$stmt->fetch()) {
        sendJSON(['error' => 'Contact info not found'], 404);
    }
    
    $updates = [];
    $params = [];
    
    $allowedFields = ['label', 'value', 'contact_type', 'icon', 'is_visible', 'display_order'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($updates)) {
        sendJSON(['message' => 'No fields to update']);
    }
    
    $params[] = $contactId;
    $query = "UPDATE contact_info SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    sendJSON(['message' => 'Contact info updated successfully']);
}

function deleteContactInfo($contactId) {
    verifyAdmin();
    
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("DELETE FROM contact_info WHERE id = ?");
    $stmt->execute([$contactId]);
    
    if ($stmt->rowCount() === 0) {
        sendJSON(['error' => 'Contact info not found'], 404);
    }
    
    sendJSON(['message' => 'Contact info deleted successfully']);
}
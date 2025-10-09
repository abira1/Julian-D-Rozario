<?php
/**
 * Comments Endpoints
 */

function handleCommentRoute($method, $commentId, $input) {
    if ($method === 'PUT') {
        updateComment($commentId, $input);
    } elseif ($method === 'DELETE') {
        deleteComment($commentId);
    } else {
        sendJSON(['error' => 'Method not allowed'], 405);
    }
}

function updateComment($commentId, $input) {
    $user = verifyToken();
    
    if (!isset($input['comment_text'])) {
        sendJSON(['error' => 'Missing comment text'], 400);
    }
    
    $pdo = getDBConnection();
    
    // Verify ownership
    $stmt = $pdo->prepare("SELECT id FROM blog_comments WHERE id = ? AND firebase_uid = ?");
    $stmt->execute([$commentId, $user['firebase_uid']]);
    if (!$stmt->fetch()) {
        sendJSON(['error' => 'Not authorized to update this comment'], 403);
    }
    
    // Update comment
    $stmt = $pdo->prepare("
        UPDATE blog_comments 
        SET comment_text = ?, is_edited = 1, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$input['comment_text'], $commentId]);
    
    sendJSON(['message' => 'Comment updated successfully']);
}

function deleteComment($commentId) {
    $user = verifyToken();
    $pdo = getDBConnection();
    
    // Verify ownership
    $stmt = $pdo->prepare("SELECT id FROM blog_comments WHERE id = ? AND firebase_uid = ?");
    $stmt->execute([$commentId, $user['firebase_uid']]);
    if (!$stmt->fetch()) {
        sendJSON(['error' => 'Not authorized to delete this comment'], 403);
    }
    
    // Soft delete
    $stmt = $pdo->prepare("UPDATE blog_comments SET is_deleted = 1 WHERE id = ?");
    $stmt->execute([$commentId]);
    
    sendJSON(['message' => 'Comment deleted successfully']);
}
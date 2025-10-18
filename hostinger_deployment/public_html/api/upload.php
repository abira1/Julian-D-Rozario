<?php
/**
 * Image Upload API
 */

if (!defined('API_ACCESS')) {
    die('Direct access not permitted');
}

try {
    if ($method === 'POST') {
        // Verify admin (optional - uncomment to require admin)
        // $user = Auth::requireAdmin();
        
        if (!isset($_FILES['image'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit;
        }
        
        $file = $_FILES['image'];
        
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Upload failed']);
            exit;
        }
        
        // Check file size
        if ($file['size'] > MAX_FILE_SIZE) {
            http_response_code(400);
            echo json_encode(['error' => 'File too large. Maximum size: ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB']);
            exit;
        }
        
        // Check file extension
        $filename = $file['name'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        if (!in_array($ext, ALLOWED_EXTENSIONS)) {
            http_response_code(400);
            echo json_encode(['error' => 'File type not allowed. Allowed: ' . implode(', ', ALLOWED_EXTENSIONS)]);
            exit;
        }
        
        // Generate unique filename
        $uniqueFilename = uniqid() . '-' . time() . '.' . $ext;
        $targetPath = UPLOAD_DIR . $uniqueFilename;
        
        // Create upload directory if it doesn't exist
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            exit;
        }
        
        // Optimize image (optional)
        if (function_exists('imagecreatefromjpeg') || function_exists('imagecreatefrompng')) {
            try {
                $image = null;
                if ($ext === 'jpg' || $ext === 'jpeg') {
                    $image = imagecreatefromjpeg($targetPath);
                } elseif ($ext === 'png') {
                    $image = imagecreatefrompng($targetPath);
                }
                
                if ($image) {
                    $width = imagesx($image);
                    $height = imagesy($image);
                    $maxWidth = 1920;
                    $maxHeight = 1080;
                    
                    if ($width > $maxWidth || $height > $maxHeight) {
                        $ratio = min($maxWidth / $width, $maxHeight / $height);
                        $newWidth = floor($width * $ratio);
                        $newHeight = floor($height * $ratio);
                        
                        $resized = imagecreatetruecolor($newWidth, $newHeight);
                        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                        
                        if ($ext === 'jpg' || $ext === 'jpeg') {
                            imagejpeg($resized, $targetPath, 85);
                        } elseif ($ext === 'png') {
                            imagepng($resized, $targetPath, 8);
                        }
                        
                        imagedestroy($resized);
                    }
                    imagedestroy($image);
                }
            } catch (Exception $e) {
                // Image optimization failed, but file is saved
            }
        }
        
        // Generate URL
        $imageUrl = '/uploads/blog_images/' . $uniqueFilename;
        
        echo json_encode([
            'success' => true,
            'filename' => $uniqueFilename,
            'url' => $imageUrl,
            'size' => $file['size']
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Upload failed: ' . $e->getMessage()]);
}
?>
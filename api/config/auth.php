<?php
require_once 'database.php';

function getAuthenticatedUser() {
    // Get the token from the Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader)) {
        return null;
    }

    // Extract the token (remove 'Bearer ' if present)
    $token = str_replace('Bearer ', '', $authHeader);

    try {
        $conn = getConnection();
        
        // Get user by token
        $stmt = $conn->prepare("
            SELECT 
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.role,
                u.status,
                u.school_id,
                u.department_id,
                s.id as student_id,
                s.student_id as student_number
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            WHERE u.token = :token AND u.status = 'active'
        ");
        
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return null;
        }
        
        return $user;
    } catch (Exception $e) {
        error_log("Authentication error: " . $e->getMessage());
        return null;
    }
}

function generateToken() {
    return bin2hex(random_bytes(32));
}

function updateUserToken($userId, $token) {
    try {
        $conn = getConnection();
        $stmt = $conn->prepare("UPDATE users SET token = :token WHERE id = :user_id");
        $stmt->execute([
            ':token' => $token,
            ':user_id' => $userId
        ]);
        return true;
    } catch (Exception $e) {
        error_log("Token update error: " . $e->getMessage());
        return false;
    }
}
?> 
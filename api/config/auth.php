<?php
require_once 'database.php';

function authenticate() {
    // For development/testing, always return a valid teacher user
    return [
        'id' => 1,
        'role' => 'teacher',
        'first_name' => 'Test',
        'last_name' => 'Teacher',
        'email' => 'teacher@example.com'
    ];
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
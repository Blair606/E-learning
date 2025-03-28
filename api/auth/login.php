<?php
require_once '../config/database.php';
require_once '../config/cors.php';

// Handle CORS
handleCORS();

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Email and password are required');
    }

    // Get database connection
    $conn = getConnection();
    if (!$conn) {
        throw new Exception('Failed to connect to database');
    }

    // Get user by email
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('Invalid email or password');
    }

    // Verify password
    if (!password_verify($data['password'], $user['password'])) {
        throw new Exception('Invalid email or password');
    }

    // Check if user is active
    if ($user['status'] !== 'active') {
        throw new Exception('Account is not active');
    }

    // Generate token
    $token = bin2hex(random_bytes(32));

    // Update user token in database
    $stmt = $conn->prepare("UPDATE users SET token = ? WHERE id = ?");
    $stmt->execute([$token, $user['id']]);

    // Remove password from response
    unset($user['password']);

    // Return success response with user data and token
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => $user
    ]);

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 
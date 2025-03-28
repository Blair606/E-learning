<?php
require_once '../config/cors.php';
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    // Validate required fields
    if (!isset($data->email) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }
    
    // Get user by email
    $stmt = $conn->prepare("SELECT id, email, password, first_name, last_name, role, status FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if user is active
    if ($user['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(['error' => 'Account is not active']);
        exit;
    }
    
    // Verify password
    if (!password_verify($data->password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit;
    }
    
    // Generate new token
    $token = bin2hex(random_bytes(32));
    
    // Update user token
    $stmt = $conn->prepare("UPDATE users SET token = ? WHERE id = ?");
    $stmt->execute([$token, $user['id']]);
    
    // Remove password from user data
    unset($user['password']);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'user' => $user,
        'token' => $token
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
} catch (Exception $e) {
    error_log("Server error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
?> 
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
    if (!isset($data->email) || !isset($data->password) || !isset($data->firstName) || !isset($data->lastName) || !isset($data->role)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
    
    // Prepare insert query
    $query = "INSERT INTO users (email, password, first_name, last_name, role, status) 
              VALUES (:email, :password, :firstName, :lastName, :role, 'active')";
    
    $stmt = $conn->prepare($query);
    
    // Bind parameters
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':firstName', $data->firstName);
    $stmt->bindParam(':lastName', $data->lastName);
    $stmt->bindParam(':role', $data->role);
    
    // Execute query
    if (!$stmt->execute()) {
        throw new Exception("Failed to create user");
    }
    
    // Get the created user
    $userId = $conn->lastInsertId();
    $stmt = $conn->prepare("SELECT id, email, first_name, last_name, role, status FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Generate JWT token
    $token = bin2hex(random_bytes(32));
    
    // Update user with token
    $stmt = $conn->prepare("UPDATE users SET token = ? WHERE id = ?");
    $stmt->execute([$token, $userId]);
    
    // Return success response with user data and token
    echo json_encode([
        'success' => true,
        'user' => $user,
        'token' => $token
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Server error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?> 
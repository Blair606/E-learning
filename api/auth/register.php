<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Handle CORS first
handleCORS();

// Set content type
header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();
    
    // Get posted data
    $rawData = file_get_contents("php://input");
    error_log("Received data: " . $rawData);
    
    $data = json_decode($rawData);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    // Log received data for debugging
    error_log("Received registration data: " . print_r($data, true));
    
    // Validate required fields
    $requiredFields = ['email', 'password', 'firstName', 'lastName', 'role'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data->$field)) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        error_log("Missing required fields: " . implode(', ', $missingFields));
        http_response_code(400);
        echo json_encode([
            'error' => 'Missing required fields',
            'missing_fields' => $missingFields
        ]);
        exit;
    }
    
    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        error_log("Invalid email format: " . $data->email);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }
    
    // Validate role
    $validRoles = ['admin', 'teacher', 'student', 'parent'];
    if (!in_array($data->role, $validRoles)) {
        error_log("Invalid role: " . $data->role);
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid role',
            'valid_roles' => $validRoles
        ]);
        exit;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    if ($stmt->rowCount() > 0) {
        error_log("Email already exists: " . $data->email);
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
        error_log("Failed to create user: " . print_r($stmt->errorInfo(), true));
        throw new Exception("Failed to create user");
    }
    
    // Get the created user with role-specific ID
    $userId = $conn->lastInsertId();
    $stmt = $conn->prepare("
        SELECT id, email, first_name, last_name, role, status, 
               student_id, teacher_id, admin_id, parent_id 
        FROM users 
        WHERE id = ?
    ");
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
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Server error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?> 
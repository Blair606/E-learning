<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Function to send JSON response
function sendJsonResponse($status, $message, $data = null, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

require_once '../config/cors.php';
require_once '../config/database.php';

// Log request method and headers
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request Headers: " . print_r(getallheaders(), true));

try {
    error_log("Starting user creation process");
    
    // Get JSON data from request body
    $input = file_get_contents('php://input');
    error_log("Raw input received: " . $input);
    
    if (empty($input)) {
        error_log("No input received");
        sendJsonResponse('error', 'No data received', null, 400);
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        sendJsonResponse('error', 'Invalid JSON data: ' . json_last_error_msg(), null, 400);
    }

    // Log the received data
    error_log("Received data: " . print_r($data, true));

    // Validate required fields
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['first_name']) || 
        !isset($data['last_name']) || !isset($data['role']) || !isset($data['national_id'])) {
        throw new Exception("Missing required fields");
    }

    // Validate role
    if ($data['role'] !== 'parent') {
        throw new Exception("Invalid role. Only 'parent' role is allowed for guardian registration.");
    }

    // Get database connection
    error_log("Attempting to connect to database");
    $conn = getConnection();
    if (!$conn) {
        error_log("Database connection failed");
        throw new Exception("Failed to connect to database");
    }
    error_log("Database connection successful");

    // Start transaction
    $conn->beginTransaction();
    try {
        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->rowCount() > 0) {
            error_log("Email already exists: " . $data['email']);
            throw new Exception("Email already exists");
        }

        // Insert new user
        $stmt = $conn->prepare("
            INSERT INTO users (
                email, password, first_name, last_name, role, 
                phone, address, national_id, status, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, NOW()
            )
        ");

        // Hash the password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // Execute the insert
        $stmt->execute([
            $data['email'],
            $hashedPassword,
            $data['first_name'],
            $data['last_name'],
            $data['role'],
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['national_id'],
            $data['status'] ?? 'active'
        ]);

        // Get the new user's ID
        $userId = $conn->lastInsertId();
        error_log("User created successfully with ID: " . $userId);

        // Commit transaction
        $conn->commit();

        sendJsonResponse('success', 'Guardian registered successfully', ['id' => $userId]);

    } catch (Exception $e) {
        // Rollback transaction on error
        if ($conn) {
            $conn->rollBack();
        }
        error_log("Transaction error: " . $e->getMessage());
        sendJsonResponse('error', $e->getMessage(), null, 500);
    }

} catch (Exception $e) {
    error_log("Error in create.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJsonResponse('error', $e->getMessage(), null, 500);
}
?> 
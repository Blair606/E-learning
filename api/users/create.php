<?php
// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Function to send JSON response
function sendJsonResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

require_once '../config/cors.php';
require_once '../config/database.php';

// Handle CORS first
handleCORS();

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
        sendJsonResponse(false, 'No data received', null, 400);
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        sendJsonResponse(false, 'Invalid JSON data: ' . json_last_error_msg(), null, 400);
    }

    // Log the received data
    error_log("Received data: " . print_r($data, true));

    // Validate required fields
    $requiredFields = ['email', 'password', 'firstName', 'lastName', 'role'];
    if ($data['role'] === 'parent') {
        $requiredFields[] = 'national_id';
    }
    if (in_array($data['role'], ['student', 'teacher'])) {
        $requiredFields[] = 'school_id';
        $requiredFields[] = 'department_id';
    }

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            error_log("Missing required field: " . $field);
            throw new Exception("Missing required field: $field");
        }
    }

    // Validate role
    $validRoles = ['admin', 'teacher', 'student', 'parent'];
    if (!in_array($data['role'], $validRoles)) {
        error_log("Invalid role: " . $data['role']);
        throw new Exception("Invalid role. Must be one of: " . implode(', ', $validRoles));
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

        // Log the SQL query and parameters
        $sql = "INSERT INTO users (
            email, password, first_name, last_name, role, 
            phone, address, national_id, status, created_at,
            school_id, department_id, student_id, teacher_id,
            admin_id, parent_id
        ) VALUES (
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, NOW(),
            ?, ?, NULL, NULL,
            NULL, NULL
        )";
        error_log("SQL Query: " . $sql);
        error_log("Parameters: " . print_r([
            $data['email'],
            '[HASHED_PASSWORD]',
            $data['firstName'],
            $data['lastName'],
            $data['role'],
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['national_id'] ?? null,
            $data['status'] ?? 'active',
            $data['school_id'] ?? null,
            $data['department_id'] ?? null
        ], true));

        // Insert new user
        $stmt = $conn->prepare($sql);

        // Hash the password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // Execute the insert
        $params = [
            $data['email'],
            $hashedPassword,
            $data['firstName'],
            $data['lastName'],
            $data['role'],
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['national_id'] ?? null,
            $data['status'] ?? 'active',
            $data['school_id'] ?? null,
            $data['department_id'] ?? null
        ];
        
        error_log("Executing query with parameters: " . print_r($params, true));
        
        if (!$stmt->execute($params)) {
            error_log("SQL Error: " . print_r($stmt->errorInfo(), true));
            throw new Exception("Failed to insert user: " . implode(", ", $stmt->errorInfo()));
        }

        // Get the new user's ID
        $userId = $conn->lastInsertId();
        error_log("User created successfully with ID: " . $userId);

        // Commit transaction
        $conn->commit();
        error_log("Transaction committed successfully");

        // Fetch the created user with all fields
        $query = "SELECT * FROM users WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        error_log("Fetched user data: " . print_r($user, true));

        sendJsonResponse(true, 'User created successfully', $user);

    } catch (Exception $e) {
        // Rollback transaction on error
        if ($conn) {
            $conn->rollBack();
            error_log("Transaction rolled back due to error");
        }
        error_log("Transaction error: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        sendJsonResponse(false, $e->getMessage(), null, 500);
    }

} catch (Exception $e) {
    error_log("Error in create.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    sendJsonResponse(false, $e->getMessage(), null, 500);
}
?> 
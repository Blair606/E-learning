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
            throw new Exception("Missing required field: $field");
        }
    }

    // Validate role
    $validRoles = ['admin', 'teacher', 'student', 'parent'];
    if (!in_array($data['role'], $validRoles)) {
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

        // Insert new user
        $stmt = $conn->prepare("
            INSERT INTO users (
                email, password, first_name, last_name, role, 
                phone, address, national_id, status, created_at,
                school_id, department_id
            ) VALUES (
                ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, NOW(),
                ?, ?
            )
        ");

        // Hash the password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // Execute the insert
        $stmt->execute([
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
        ]);

        // Get the new user's ID
        $userId = $conn->lastInsertId();
        error_log("User created successfully with ID: " . $userId);

        // If it's a student or teacher, insert role-specific data
        if (in_array($data['role'], ['student', 'teacher'])) {
            if ($data['role'] === 'student') {
                $stmt = $conn->prepare("
                    INSERT INTO students (
                        user_id, grade, enrollment_date, specialization, education
                    ) VALUES (?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $userId,
                    $data['grade'] ?? null,
                    $data['enrollmentDate'] ?? date('Y-m-d'),
                    $data['specialization'] ?? null,
                    $data['education'] ?? null
                ]);
            } else {
                $stmt = $conn->prepare("
                    INSERT INTO teachers (
                        user_id, specialization, education, experience
                    ) VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $userId,
                    $data['specialization'] ?? null,
                    $data['education'] ?? null,
                    $data['experience'] ?? null
                ]);
            }
        }

        // Commit transaction
        $conn->commit();

        // Fetch the created user with role-specific data
        $query = "SELECT u.*, ";
        if ($data['role'] === 'student') {
            $query .= "s.grade, s.enrollment_date, s.specialization, s.education ";
        } elseif ($data['role'] === 'teacher') {
            $query .= "t.specialization, t.education, t.experience ";
        }
        $query .= "FROM users u ";
        if ($data['role'] === 'student') {
            $query .= "LEFT JOIN students s ON u.id = s.user_id ";
        } elseif ($data['role'] === 'teacher') {
            $query .= "LEFT JOIN teachers t ON u.id = t.user_id ";
        }
        $query .= "WHERE u.id = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse('success', 'User created successfully', $user);

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
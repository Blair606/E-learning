<?php
require_once __DIR__ . '/../config/cors.php';
require_once '../config/database.php';

// Set content type
header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();
    
    // Get posted data
    $rawData = file_get_contents("php://input");
    error_log("Raw input received: " . $rawData);
    
    $data = json_decode($rawData, true); // Decode as associative array
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("JSON decode error: " . json_last_error_msg());
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Log the decoded data
    error_log("Decoded data: " . print_r($data, true));
    error_log("Data type: " . gettype($data));
    error_log("Data properties: " . implode(', ', array_keys($data)));
    
    // Validate request method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
    
    // Log received data for debugging
    error_log("Received registration data: " . print_r($data, true));
    
    // Validate required fields
    $requiredFields = ['email', 'password', 'first_name', 'last_name', 'role'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
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
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        error_log("Invalid email format: " . $data['email']);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }
    
    // Validate role
    $validRoles = ['admin', 'teacher', 'student', 'parent'];
    if (!in_array($data['role'], $validRoles)) {
        error_log("Invalid role: " . $data['role']);
        http_response_code(400);
        echo json_encode([
            'error' => 'Invalid role',
            'valid_roles' => $validRoles
        ]);
        exit;
    }
    
    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->rowCount() > 0) {
        error_log("Email already exists: " . $data['email']);
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists']);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Prepare insert query
    $query = "INSERT INTO users (email, password, first_name, last_name, role, status) 
              VALUES (:email, :password, :first_name, :last_name, :role, 'pending')";
    
    $stmt = $conn->prepare($query);
    
    // Bind parameters
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':first_name', $data['first_name']);
    $stmt->bindParam(':last_name', $data['last_name']);
    $stmt->bindParam(':role', $data['role']);
    
    // Execute query
    if (!$stmt->execute()) {
        error_log("Failed to create user: " . print_r($stmt->errorInfo(), true));
        throw new Exception("Failed to create user");
    }
    
    // Get the created user with role-specific ID
    $userId = $conn->lastInsertId();
    
    // If role is student, create a student record
    if ($data['role'] === 'student') {
        // Generate a unique student ID (you can modify this format as needed)
        $studentId = 'STU' . date('Y') . str_pad($userId, 4, '0', STR_PAD_LEFT);
        
        $studentQuery = "INSERT INTO students (user_id, student_id) VALUES (:user_id, :student_id)";
        $studentStmt = $conn->prepare($studentQuery);
        $studentStmt->bindParam(':user_id', $userId);
        $studentStmt->bindParam(':student_id', $studentId);
        
        if (!$studentStmt->execute()) {
            error_log("Failed to create student record: " . print_r($studentStmt->errorInfo(), true));
            throw new Exception("Failed to create student record");
        }
    }
    
    // Notify admin(s) of new registration
    // Find all admin users
    $adminStmt = $conn->prepare("SELECT id FROM users WHERE role = 'admin'");
    $adminStmt->execute();
    $admins = $adminStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($admins as $admin) {
        $notification = [
            'user_id' => $admin['id'],
            'title' => 'New User Registration',
            'message' => 'A new user (' . $data['email'] . ') has registered and is awaiting approval.',
            'type' => 'info'
        ];
        // Call notification creation endpoint internally
        $notificationUrl = __DIR__ . '/../notifications/create.php';
        $ch = curl_init('http://localhost/E-learning/api/notifications/create.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notification));
        curl_exec($ch);
        curl_close($ch);
    }
    
    $stmt = $conn->prepare("
        SELECT id, email, first_name, last_name, role, status, token
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Return success response with user data and token
    echo json_encode([
        'success' => true,
        'user' => $user,
        'token' => $user['token']
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
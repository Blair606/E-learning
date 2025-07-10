<?php
require_once __DIR__ . '/../config/cors.php';
if (function_exists('handleCORS')) { handleCORS(); }
require_once '../config/database.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();
    if (!$conn) {
        throw new Exception('Failed to connect to database');
    }

    // Check if student_id is provided
    if (!isset($_GET['student_id'])) {
        throw new Exception('Student ID is required');
    }

    $student_id = $_GET['student_id'];
    
    // Log the student ID for debugging
    error_log("Fetching user data for student_id: " . $student_id);

    // Prepare the query to get user data by student ID
    $stmt = $conn->prepare("
        SELECT id, email, first_name, last_name, role, status, phone, address, 
               national_id, school_id, department_id, student_id, teacher_id, 
               admin_id, parent_id, created_at, updated_at
        FROM users 
        WHERE role = 'student'
        AND (
            student_id = :student_id
            OR student_id LIKE :student_id_pattern
            OR id IN (
                SELECT user_id 
                FROM student_profiles 
                WHERE registration_number = :student_id
            )
        )
    ");

    // Bind the parameters with the correct type
    $stmt->bindParam(':student_id', $student_id, PDO::PARAM_STR);
    $student_id_pattern = "%" . $student_id . "%";
    $stmt->bindParam(':student_id_pattern', $student_id_pattern, PDO::PARAM_STR);
    
    // Execute the query
    if (!$stmt->execute()) {
        $error = $stmt->errorInfo();
        error_log("Database error: " . print_r($error, true));
        throw new Exception('Database error: ' . $error[2]);
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Log the result for debugging
    error_log("Query result: " . ($user ? "User found" : "User not found"));

    if (!$user) {
        // If no user found, try to get the user ID from the session
        session_start();
        if (isset($_SESSION['user_id'])) {
            $user_id = $_SESSION['user_id'];
            $stmt = $conn->prepare("
                SELECT id, email, first_name, last_name, role, status, phone, address, 
                       national_id, school_id, department_id, student_id, teacher_id, 
                       admin_id, parent_id, created_at, updated_at
                FROM users 
                WHERE id = :user_id
            ");
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }

    if (!$user) {
        // If still no user found, try to get the user ID from localStorage
        $userData = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        if ($userData) {
            $stmt = $conn->prepare("
                SELECT id, email, first_name, last_name, role, status, phone, address, 
                       national_id, school_id, department_id, student_id, teacher_id, 
                       admin_id, parent_id, created_at, updated_at
                FROM users 
                WHERE id = :user_id
            ");
            $stmt->bindParam(':user_id', $userData, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }

    if (!$user) {
        throw new Exception('User not found');
    }

    // Return the user data
    echo json_encode([
        'status' => 'success',
        'message' => 'User data retrieved successfully',
        'data' => $user
    ]);

} catch (Exception $e) {
    error_log("Error in read.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
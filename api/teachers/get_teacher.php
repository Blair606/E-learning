<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../middleware/AuthMiddleware.php';

header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();
    if (!$conn) {
        throw new Exception('Failed to connect to database');
    }

    // Get teacher ID from query parameter
    $teacher_id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$teacher_id) {
        throw new Exception('Teacher ID is required');
    }

    // Log the teacher ID for debugging
    error_log("Fetching teacher data for ID: " . $teacher_id);

    // Prepare the query to get teacher data
    $stmt = $conn->prepare("
        SELECT id, email, first_name, last_name, role, status, phone, address, 
               school_id, department_id, specialization, education, experience,
               created_at, updated_at
        FROM users 
        WHERE id = :teacher_id
        AND role = 'teacher'
    ");

    if (!$stmt) {
        throw new Exception('Failed to prepare query: ' . implode(' ', $conn->errorInfo()));
    }

    $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute query: ' . implode(' ', $stmt->errorInfo()));
    }
    
    $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$teacher) {
        throw new Exception('Teacher not found');
    }

    // Return the teacher data
    echo json_encode([
        'status' => 'success',
        'message' => 'Teacher data retrieved successfully',
        'data' => $teacher
    ]);

} catch (Exception $e) {
    error_log("Error in get_teacher.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
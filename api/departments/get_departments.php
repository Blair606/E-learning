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

    // Get school ID from query parameter
    $school_id = isset($_GET['school_id']) ? $_GET['school_id'] : null;
    
    if (!$school_id) {
        throw new Exception('School ID is required');
    }

    // Prepare the query to get departments
    $stmt = $conn->prepare("
        SELECT id, name, description, school_id, created_at, updated_at
        FROM departments 
        WHERE school_id = :school_id
        ORDER BY name ASC
    ");

    if (!$stmt) {
        throw new Exception('Failed to prepare query: ' . implode(' ', $conn->errorInfo()));
    }

    $stmt->bindParam(':school_id', $school_id, PDO::PARAM_INT);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute query: ' . implode(' ', $stmt->errorInfo()));
    }
    
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return the departments data
    echo json_encode([
        'status' => 'success',
        'message' => 'Departments retrieved successfully',
        'data' => $departments
    ]);

} catch (Exception $e) {
    error_log("Error in departments/get_departments.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
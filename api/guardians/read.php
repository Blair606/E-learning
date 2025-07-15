<?php
require_once '../config/cors.php';
require_once '../config/database.php';

// Handle CORS
handleCORS();

// Disable error display for production
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');

try {
    // Get student_id from query parameters
    $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;

    if (!$student_id) {
        throw new Exception('Student ID is required');
    }

    // Get database connection
    $conn = getConnection();

    // Prepare the SQL query to get guardians for the student
    $query = "SELECT u.*, gs.relationship 
              FROM users u 
              JOIN guardian_students gs ON u.id = gs.guardian_id 
              WHERE gs.student_id = :student_id AND u.role = 'parent'";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->execute();

    $guardians = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the response in the expected format
    echo json_encode([
        'status' => 'success',
        'data' => $guardians
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
?> 
<?php
require_once '../config/cors.php';
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get guardian_id from query parameters
    $guardian_id = isset($_GET['guardian_id']) ? $_GET['guardian_id'] : null;
    $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;

    if (!$guardian_id || !$student_id) {
        throw new Exception('Guardian ID and Student ID are required');
    }

    // Get database connection
    $conn = getConnection();

    // Prepare the SQL query to get notifications for the guardian
    $query = "SELECT * FROM guardian_notifications 
              WHERE guardian_id = :guardian_id 
              AND student_id = :student_id 
              ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':guardian_id', $guardian_id);
    $stmt->bindParam(':student_id', $student_id);
    $stmt->execute();

    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array(
        'status' => 'success',
        'data' => $notifications
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'status' => 'error',
        'message' => $e->getMessage()
    ));
}
?> 
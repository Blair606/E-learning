<?php
require_once '../config/cors.php';
require_once '../config/database.php';

try {
    // Get query parameters
    $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;
    $guardian_email = isset($_GET['guardian_email']) ? $_GET['guardian_email'] : null;

    if (!$student_id || !$guardian_email) {
        throw new Exception('Student ID and Guardian Email are required');
    }

    // First, get the guardian ID from the email
    $query = "SELECT id FROM users WHERE email = ? AND role = 'parent'";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $guardian_email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Guardian not found');
    }
    
    $guardian = $result->fetch_assoc();
    $guardian_id = $guardian['id'];
    $stmt->close();

    // Then, delete the guardian-student relationship
    $query = "DELETE FROM guardian_students WHERE guardian_id = ? AND student_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("is", $guardian_id, $student_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to delete guardian relationship');
    }

    echo json_encode(array(
        'status' => 'success',
        'message' => 'Guardian relationship deleted successfully'
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'status' => 'error',
        'message' => $e->getMessage()
    ));
}

$stmt->close();
$conn->close();
?> 
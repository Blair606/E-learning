<?php
require_once '../config/database.php';
require_once '../config/cors.php';

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($data['guardian_id']) || !isset($data['student_id']) || !isset($data['relationship'])) {
        throw new Exception('Missing required fields: guardian_id, student_id, and relationship are required');
    }

    // Get database connection
    $conn = getConnection();
    if (!$conn) {
        throw new Exception('Failed to connect to database');
    }

    // Check if relationship already exists
    $checkStmt = $conn->prepare("SELECT id FROM guardian_students WHERE guardian_id = ? AND student_id = ?");
    $checkStmt->execute([$data['guardian_id'], $data['student_id']]);
    
    if ($checkStmt->rowCount() > 0) {
        throw new Exception('This guardian is already registered for this student');
    }

    // Insert new guardian-student relationship
    $stmt = $conn->prepare("
        INSERT INTO guardian_students (
            guardian_id, 
            student_id, 
            relationship,
            is_primary,
            created_at
        ) VALUES (
            :guardian_id,
            :student_id,
            :relationship,
            :is_primary,
            NOW()
        )
    ");

    $params = [
        ':guardian_id' => $data['guardian_id'],
        ':student_id' => $data['student_id'],
        ':relationship' => $data['relationship'],
        ':is_primary' => $data['is_primary'] ?? false
    ];

    if (!$stmt->execute($params)) {
        throw new Exception('Failed to create guardian-student relationship');
    }

    // Get the newly created relationship
    $id = $conn->lastInsertId();
    $fetchStmt = $conn->prepare("
        SELECT gs.*, 
               u.first_name, 
               u.last_name, 
               u.email, 
               u.phone
        FROM guardian_students gs
        JOIN users u ON gs.guardian_id = u.id
        WHERE gs.id = ?
    ");
    $fetchStmt->execute([$id]);
    $relationship = $fetchStmt->fetch(PDO::FETCH_ASSOC);

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Guardian-student relationship created successfully',
        'data' => $relationship
    ]);

} catch (Exception $e) {
    error_log("Error in create.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
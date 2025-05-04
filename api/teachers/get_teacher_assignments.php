<?php
require_once '../config/cors.php';
header('Content-Type: application/json');
require_once '../config/database.php';
$conn = getConnection();
require_once '../middleware/auth.php';

try {
    // Verify JWT token and require teacher role
    $user = AuthMiddleware::requireRole(['teacher']);
    
    if (!$user) {
        throw new Exception('Authentication failed');
    }

    $teacher_id = $user['sub'];
    
    // Get assignments with submission statistics
    $query = "
        SELECT 
            a.id,
            a.title,
            a.description,
            a.due_date,
            c.name as course_name,
            a.status,
            a.total_points
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE c.instructor_id = ?
        ORDER BY a.due_date DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute([$teacher_id]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $assignments
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 
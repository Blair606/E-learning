<?php
require_once '../config/cors.php';
header('Content-Type: application/json');
require_once '../config/database.php';
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
            COUNT(DISTINCT s.id) as total_students,
            COUNT(DISTINCT sa.id) as submissions
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id
        JOIN students s ON e.student_id = s.id
        LEFT JOIN student_assignments sa ON a.id = sa.assignment_id
        WHERE c.teacher_id = ?
        GROUP BY a.id
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
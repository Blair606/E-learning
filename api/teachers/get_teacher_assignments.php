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
    $course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : null;
    
    // Get assignments with submission statistics
    $query = "
        SELECT 
            a.id,
            a.title,
            a.description,
            a.due_date as dueDate,
            c.name as course,
            c.id as courseId,
            a.status,
            a.type,
            COUNT(DISTINCT s.id) as submissions,
            COUNT(DISTINCT e.id) as totalStudents
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN submissions s ON a.id = s.assignment_id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.id = ?
        GROUP BY a.id, c.id
        ORDER BY a.due_date DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute([$course_id]);
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
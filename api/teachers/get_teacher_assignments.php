<?php
require_once '../config/cors.php';
handleCORS();
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
    
    // Get course_id from query parameters
    $course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : null;
    
    // Validate course_id
    if ($course_id === null || $course_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid course ID. Please provide a valid course ID.'
        ]);
        exit();
    }

    $conn = getConnection();
    
    // First verify that the teacher has access to this course
    $verifyQuery = "SELECT c.id FROM courses c 
                   WHERE c.id = ? 
                   AND (c.instructor_id = ? 
                   OR EXISTS (
                       SELECT 1 FROM course_teachers ct 
                       WHERE ct.course_id = c.id 
                       AND ct.teacher_id = ?
                   ))";
    $verifyStmt = $conn->prepare($verifyQuery);
    $verifyStmt->execute([$course_id, $teacher_id, $teacher_id]);
    
    if (!$verifyStmt->fetch()) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'You do not have access to this course'
        ]);
        exit();
    }
    
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

    // Format the response
    $formattedAssignments = array_map(function($assignment) {
        return [
            'id' => $assignment['id'],
            'title' => $assignment['title'],
            'description' => $assignment['description'],
            'dueDate' => $assignment['dueDate'],
            'course' => $assignment['course'],
            'courseId' => $assignment['courseId'],
            'status' => $assignment['status'],
            'type' => $assignment['type'],
            'submissions' => (int)$assignment['submissions'],
            'totalStudents' => (int)$assignment['totalStudents']
        ];
    }, $assignments);

    echo json_encode([
        'success' => true,
        'data' => $formattedAssignments
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 
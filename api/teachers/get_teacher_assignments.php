<?php
require_once '../config/cors.php';
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../middleware/auth.php';

// Verify JWT token
$auth = new Auth();
$user = $auth->verifyToken();

if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $teacher_id = $user['id'];
    
    // Get assignments with submission statistics
    $assignments_query = "
        SELECT 
            a.id,
            a.title,
            a.description,
            a.due_date,
            c.title as course_name,
            COUNT(DISTINCT e.student_id) as total_students,
            COUNT(DISTINCT g.id) as submissions,
            CASE 
                WHEN a.due_date < NOW() THEN 'Completed'
                WHEN COUNT(DISTINCT g.id) > 0 THEN 'Active'
                ELSE 'Draft'
            END as status
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN grades g ON a.id = g.assignment_id
        WHERE c.teacher_id = ?
        GROUP BY a.id
        ORDER BY a.due_date DESC
    ";
    
    $stmt = $conn->prepare($assignments_query);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $assignments = [];
    while ($row = $result->fetch_assoc()) {
        $assignments[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'course' => $row['course_name'],
            'dueDate' => $row['due_date'],
            'type' => 'Assignment', // You can add a type column to the assignments table if needed
            'status' => $row['status'],
            'submissions' => $row['submissions'],
            'totalStudents' => $row['total_students']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'assignments' => $assignments
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
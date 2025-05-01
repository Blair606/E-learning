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
    
    // Get teacher's courses with student count
    $courses_query = "
        SELECT 
            c.id,
            c.title,
            c.description,
            COUNT(e.id) as student_count,
            MAX(a.due_date) as next_class
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN assignments a ON c.id = a.course_id
        WHERE c.teacher_id = ?
        GROUP BY c.id
    ";
    
    $stmt = $conn->prepare($courses_query);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = [
            'id' => $row['id'],
            'name' => $row['title'],
            'description' => $row['description'],
            'students' => $row['student_count'],
            'nextClass' => $row['next_class'] ? date('h:i A', strtotime($row['next_class'])) . ' Today' : 'No upcoming class'
        ];
    }
    
    // Get overall statistics
    $stats_query = "
        SELECT 
            COUNT(DISTINCT e.student_id) as total_students,
            AVG(g.score) as average_grade,
            COUNT(DISTINCT a.id) as active_assignments
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN grades g ON a.id = g.assignment_id
        WHERE c.teacher_id = ?
    ";
    
    $stmt = $conn->prepare($stats_query);
    $stmt->bind_param("i", $teacher_id);
    $stmt->execute();
    $stats = $stmt->get_result()->fetch_assoc();
    
    // Format the response
    $response = [
        'success' => true,
        'courses' => $courses,
        'stats' => [
            'totalStudents' => $stats['total_students'] ?? 0,
            'averageGrade' => $stats['average_grade'] ? round($stats['average_grade'], 1) : 0,
            'activeAssignments' => $stats['active_assignments'] ?? 0
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
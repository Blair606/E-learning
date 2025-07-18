<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../middleware/auth.php';

// Verify JWT token
$user = AuthMiddleware::authenticate();

if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $conn = getConnection();
    $teacher_id = $user['sub'];
    
    // Get teacher's courses with student count
    $courses_query = "
        SELECT 
            c.id,
            c.name,
            c.description,
            COUNT(e.id) as student_count,
            MAX(a.due_date) as next_class
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN assignments a ON c.id = a.course_id
        WHERE c.instructor_id = :teacher_id1 
        OR EXISTS (
            SELECT 1 FROM course_teachers ct 
            WHERE ct.course_id = c.id 
            AND ct.teacher_id = :teacher_id2
        )
        GROUP BY c.id
    ";
    
    $stmt = $conn->prepare($courses_query);
    $stmt->bindParam(':teacher_id1', $teacher_id, PDO::PARAM_INT);
    $stmt->bindParam(':teacher_id2', $teacher_id, PDO::PARAM_INT);
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $formatted_courses = [];
    foreach ($courses as $row) {
        $formatted_courses[] = [
            'id' => $row['id'],
            'name' => $row['name'],
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
        WHERE c.instructor_id = :teacher_id
    ";
    
    $stmt = $conn->prepare($stats_query);
    $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
    $stmt->execute();
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = [
        'success' => true,
        'courses' => $formatted_courses,
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
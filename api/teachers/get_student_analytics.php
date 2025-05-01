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
    $course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : null;
    
    // Get student analytics
    $analytics_query = "
        SELECT 
            u.id as student_id,
            CONCAT(u.first_name, ' ', u.last_name) as student_name,
            c.id as course_id,
            c.title as course_name,
            COUNT(DISTINCT a.id) as total_assignments,
            COUNT(DISTINCT g.id) as completed_assignments,
            AVG(g.score) as average_grade,
            COUNT(DISTINCT CASE WHEN g.score >= 90 THEN g.id END) as a_grades,
            COUNT(DISTINCT CASE WHEN g.score >= 80 AND g.score < 90 THEN g.id END) as b_grades,
            COUNT(DISTINCT CASE WHEN g.score >= 70 AND g.score < 80 THEN g.id END) as c_grades,
            COUNT(DISTINCT CASE WHEN g.score >= 60 AND g.score < 70 THEN g.id END) as d_grades,
            COUNT(DISTINCT CASE WHEN g.score < 60 THEN g.id END) as f_grades
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN assignments a ON c.id = a.course_id
        LEFT JOIN grades g ON a.id = g.assignment_id AND u.id = g.student_id
        WHERE c.teacher_id = ?
        " . ($course_id ? "AND c.id = ?" : "") . "
        GROUP BY u.id, c.id
    ";
    
    $stmt = $conn->prepare($analytics_query);
    if ($course_id) {
        $stmt->bind_param("ii", $teacher_id, $course_id);
    } else {
        $stmt->bind_param("i", $teacher_id);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $analytics = [];
    while ($row = $result->fetch_assoc()) {
        $total_grades = $row['a_grades'] + $row['b_grades'] + $row['c_grades'] + $row['d_grades'] + $row['f_grades'];
        $grade_distribution = [
            ['name' => 'A (90-100)', 'value' => $row['a_grades']],
            ['name' => 'B (80-89)', 'value' => $row['b_grades']],
            ['name' => 'C (70-79)', 'value' => $row['c_grades']],
            ['name' => 'D (60-69)', 'value' => $row['d_grades']],
            ['name' => 'F (<60)', 'value' => $row['f_grades']]
        ];
        
        $analytics[] = [
            'studentId' => $row['student_id'],
            'studentName' => $row['student_name'],
            'courseId' => $row['course_id'],
            'courseName' => $row['course_name'],
            'totalAssignments' => $row['total_assignments'],
            'completedAssignments' => $row['completed_assignments'],
            'averageGrade' => $row['average_grade'] ? round($row['average_grade'], 1) : 0,
            'gradeDistribution' => $grade_distribution,
            'performance' => [
                'average' => $row['average_grade'] ? round($row['average_grade'], 1) : 0,
                'completionRate' => $row['total_assignments'] > 0 
                    ? round(($row['completed_assignments'] / $row['total_assignments']) * 100, 1) 
                    : 0
            ]
        ];
    }
    
    echo json_encode([
        'success' => true,
        'analytics' => $analytics
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
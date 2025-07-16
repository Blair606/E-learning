<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../config/database.php';
require_once '../middleware/auth.php';

header('Content-Type: application/json');

// Verify token and get user
$user = AuthMiddleware::authenticate();
if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Get class analytics
    $classQuery = "SELECT 
        c.id as class_id,
        c.name as class_name,
        COUNT(DISTINCT sc.student_id) as total_students,
        AVG(sc.progress) as average_progress,
        AVG(sc.attendance) as average_attendance,
        AVG(sc.grade) as average_grade
    FROM classes c
    LEFT JOIN student_classes sc ON c.id = sc.class_id
    WHERE c.teacher_id = :teacher_id
    GROUP BY c.id";

    $stmt = $conn->prepare($classQuery);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    $classAnalytics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get student analytics for each class
    $studentQuery = "SELECT 
        sc.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sc.class_id,
        sc.progress,
        sc.attendance,
        sc.grade,
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT sa.id) as submitted_assignments
    FROM student_classes sc
    JOIN students s ON sc.student_id = s.id
    LEFT JOIN assignments a ON sc.class_id = a.class_id
    LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sc.student_id = sa.student_id
    WHERE sc.class_id IN (SELECT id FROM classes WHERE teacher_id = :teacher_id)
    GROUP BY sc.student_id, sc.class_id";

    $stmt = $conn->prepare($studentQuery);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    $studentAnalytics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get assignment analytics
    $assignmentQuery = "SELECT 
        a.id as assignment_id,
        a.title,
        a.class_id,
        COUNT(DISTINCT sa.student_id) as total_submissions,
        AVG(sa.grade) as average_grade,
        COUNT(DISTINCT CASE WHEN sa.submitted_at IS NOT NULL THEN sa.student_id END) as submitted_count
    FROM assignments a
    LEFT JOIN student_assignments sa ON a.id = sa.assignment_id
    WHERE a.class_id IN (SELECT id FROM classes WHERE teacher_id = :teacher_id)
    GROUP BY a.id";

    $stmt = $conn->prepare($assignmentQuery);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    $assignmentAnalytics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get discussion analytics
    $discussionQuery = "SELECT 
        d.id as discussion_id,
        d.title,
        d.class_id,
        COUNT(DISTINCT p.id) as total_posts,
        COUNT(DISTINCT p.student_id) as participating_students
    FROM discussions d
    LEFT JOIN posts p ON d.id = p.discussion_id
    WHERE d.class_id IN (SELECT id FROM classes WHERE teacher_id = :teacher_id)
    GROUP BY d.id";

    $stmt = $conn->prepare($discussionQuery);
    $stmt->bindParam(':teacher_id', $user['id']);
    $stmt->execute();
    $discussionAnalytics = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'classAnalytics' => $classAnalytics,
            'studentAnalytics' => $studentAnalytics,
            'assignmentAnalytics' => $assignmentAnalytics,
            'discussionAnalytics' => $discussionAnalytics
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]); 
<?php
require_once '../config/cors.php';
handleCORS();
require_once '../config/database.php';
require_once '../middleware/auth.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Authenticate user
    $payload = AuthMiddleware::authenticate();
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $conn = getConnection();
    $courseFilter = '';
    $params = [];
    if (isset($_GET['course_id']) && is_numeric($_GET['course_id'])) {
        $courseFilter = 'WHERE a.course_id = ?';
        $params[] = $_GET['course_id'];
    }
    
    // If user is a teacher, get all assignments (optionally filtered by course)
    if ($payload['role'] === 'teacher') {
        $stmt = $conn->prepare("
            SELECT a.*, c.name as course_name, 
                   COUNT(s.id) as total_submissions,
                   COUNT(CASE WHEN s.status = 'graded' THEN 1 END) as graded_submissions
            FROM assignments a
            LEFT JOIN courses c ON a.course_id = c.id
            LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
            $courseFilter
            GROUP BY a.id
            ORDER BY a.created_at DESC
        ");
        $stmt->execute($params);
    } 
    // If user is a student, get assignments with their submission status (optionally filtered by course)
    else if ($payload['role'] === 'student') {
        $studentParams = $params;
        $studentParams[] = $payload['sub'];
        $stmt = $conn->prepare("
            SELECT a.*, c.name as course_name, 
                   s.status as submission_status,
                   s.marks_obtained,
                   s.submitted_at,
                   s.graded_at,
                   s.submission_text,
                   s.file_path as student_file_path,
                   s.feedback
            FROM assignments a
            LEFT JOIN courses c ON a.course_id = c.id
            LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?
            $courseFilter
            ORDER BY a.created_at DESC
        ");
        $stmt->execute($studentParams);
    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit();
    }

    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    $formattedAssignments = array_map(function($assignment) {
        return [
            'id' => $assignment['id'],
            'title' => $assignment['title'],
            'description' => $assignment['description'],
            'course_id' => $assignment['course_id'],
            'course_name' => $assignment['course_name'] ?? '',
            'due_date' => $assignment['due_date'],
            'total_marks' => $assignment['total_marks'],
            'type' => $assignment['type'],
            'assignment_file_path' => array_key_exists('file_path', $assignment) ? $assignment['file_path'] : null,
            'created_at' => $assignment['created_at'],
            'updated_at' => $assignment['updated_at'],
            'submission_status' => $assignment['submission_status'] ?? null,
            'marks_obtained' => $assignment['marks_obtained'] ?? null,
            'submitted_at' => $assignment['submitted_at'] ?? null,
            'graded_at' => $assignment['graded_at'] ?? null,
            'total_submissions' => $assignment['total_submissions'] ?? null,
            'graded_submissions' => $assignment['graded_submissions'] ?? null,
            'submission_text' => array_key_exists('submission_text', $assignment) ? $assignment['submission_text'] : null,
            'student_file_path' => array_key_exists('student_file_path', $assignment) ? $assignment['student_file_path'] : null,
            'feedback' => $assignment['feedback'] ?? null,
        ];
    }, $assignments);

    echo json_encode([
        'success' => true,
        'assignments' => $formattedAssignments
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 
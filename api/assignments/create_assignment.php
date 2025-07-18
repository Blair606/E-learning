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
    // Authenticate teacher
    $payload = AuthMiddleware::authenticate();
    if (!$payload || $payload['role'] !== 'teacher') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized - Teachers only']);
        exit();
    }

    // Validate required fields
    if (!isset($_POST['title']) || !isset($_POST['description']) || 
        !isset($_POST['due_date']) || !isset($_POST['total_marks']) || 
        !isset($_POST['course_id']) || !isset($_POST['type'])) {
        http_response_code(400);
        $msg = 'Missing required fields.';
        error_log('[create_assignment.php] 400: ' . $msg . ' POST: ' . json_encode($_POST));
        echo json_encode(['success' => false, 'message' => $msg]);
        exit();
    }

    // Validate data types
    if (!is_string($_POST['title']) || !is_string($_POST['description']) || 
        !is_numeric($_POST['total_marks']) || !strtotime($_POST['due_date']) || 
        !is_numeric($_POST['course_id']) || !in_array($_POST['type'], ['text', 'file', 'quiz'])) {
        http_response_code(400);
        $msg = 'Invalid data types.';
        error_log('[create_assignment.php] 400: ' . $msg . ' POST: ' . json_encode($_POST));
        echo json_encode(['success' => false, 'message' => $msg]);
        exit();
    }

    $conn = getConnection();

    // Check if course exists
    $stmt = $conn->prepare('SELECT id FROM courses WHERE id = ?');
    $stmt->execute([$_POST['course_id']]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found']);
        exit();
    }

    // Handle file upload if type is 'file'
    $filePath = null;
    $fileName = null;
    if ($_POST['type'] === 'file') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File upload required for file type assignments']);
            exit();
        }

        $uploadDir = '../uploads/assignments/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = basename($_FILES['file']['name']);
        $filePath = $uploadDir . uniqid() . '_' . $fileName;

        if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to upload file']);
            exit();
        }
    }

    $stmt = $conn->prepare("
        INSERT INTO assignments (
            course_id, title, description, due_date, total_marks, 
            type, file_path, file_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $_POST['course_id'],
        $_POST['title'],
        $_POST['description'],
        $_POST['due_date'],
        $_POST['total_marks'],
        $_POST['type'],
        $filePath,
        $fileName
    ]);

    $assignmentId = $conn->lastInsertId();

    // Notify all enrolled students
    $notifTitle = 'New Assignment: ' . $_POST['title'];
    $notifMsg = 'A new assignment "' . $_POST['title'] . '" has been posted in your course.';
    $notifType = 'assignment';
    $courseId = $_POST['course_id'];
    // Get all students enrolled in this course
    $enrollStmt = $conn->prepare('SELECT s.user_id FROM enrollments e INNER JOIN students s ON (e.student_id = s.id OR e.student_id = s.user_id) WHERE e.course_id = ?');
    $enrollStmt->execute([$courseId]);
    $students = $enrollStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($students as $student) {
        $userId = $student['user_id'];
        error_log("Creating assignment notification for user_id: $userId, title: $notifTitle");
        $notifStmt = $conn->prepare('INSERT INTO notifications (user_id, title, message, type, created_at) VALUES (?, ?, ?, ?, NOW())');
        $notifStmt->execute([$userId, $notifTitle, $notifMsg, $notifType]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Assignment created successfully',
        'assignment_id' => $assignmentId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('[create_assignment.php] PDOException: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('[create_assignment.php] Exception: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 
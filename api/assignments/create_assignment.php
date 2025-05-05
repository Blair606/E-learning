<?php
require_once '../config/database.php';
require_once '../middleware/auth.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

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
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }

    // Validate data types
    if (!is_string($_POST['title']) || !is_string($_POST['description']) || 
        !is_numeric($_POST['total_marks']) || !strtotime($_POST['due_date']) || 
        !is_numeric($_POST['course_id']) || !in_array($_POST['type'], ['text', 'file', 'quiz'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid data types']);
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

    echo json_encode([
        'success' => true,
        'message' => 'Assignment created successfully',
        'assignment_id' => $assignmentId
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
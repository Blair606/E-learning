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

    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($data['title']) || !isset($data['description']) || 
        !isset($data['due_date']) || !isset($data['total_marks']) || !isset($data['course_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }

    // Validate data types
    if (!is_string($data['title']) || !is_string($data['description']) || 
        !is_numeric($data['total_marks']) || !strtotime($data['due_date']) || !is_numeric($data['course_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid data types']);
        exit();
    }

    $conn = getConnection();

    // Check if course exists
    $stmt = $conn->prepare('SELECT id FROM courses WHERE id = ?');
    $stmt->execute([$data['course_id']]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found']);
        exit();
    }

    $stmt = $conn->prepare("
        INSERT INTO assignments (course_id, title, description, due_date, total_marks)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['course_id'],
        $data['title'],
        $data['description'],
        $data['due_date'],
        $data['total_marks']
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
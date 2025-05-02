<?php
require_once '../config/database.php';
require_once '../middleware/auth.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Authenticate teacher
$auth = new Auth();
$user = $auth->verifyToken();
if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (
    !isset($data['title']) || !isset($data['content']) ||
    !isset($data['questions']) || !is_array($data['questions'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

try {
    $conn = getConnection();
    // Insert course content
    $stmt = $conn->prepare("INSERT INTO course_contents (teacher_id, title, content) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], $data['title'], $data['content']]);
    $contentId = $conn->lastInsertId();

    // Insert questions
    $questionStmt = $conn->prepare("INSERT INTO course_questions (content_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)");
    foreach ($data['questions'] as $q) {
        $optionsJson = json_encode($q['options']);
        $questionStmt->execute([$contentId, $q['text'], $optionsJson, $q['correctAnswer']]);
    }

    echo json_encode(['success' => true, 'message' => 'Content saved']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 
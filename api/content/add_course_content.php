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
$payload = AuthMiddleware::authenticate();
if (!$payload || $payload['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (
    !isset($data['title']) || !isset($data['content']) ||
    !isset($data['questions']) || !is_array($data['questions']) ||
    !isset($data['course_id'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input: course_id, title, content, and questions are required']);
    exit();
}

try {
    $conn = getConnection();
    $conn->beginTransaction();

    // Insert course content
    $stmt = $conn->prepare("INSERT INTO course_content (course_id, title, content) VALUES (?, ?, ?)");
    $stmt->execute([$data['course_id'], $data['title'], $data['content']]);
    $contentId = $conn->lastInsertId();

    // Insert questions
    $stmt = $conn->prepare("INSERT INTO course_questions (content_id, question_text, option1, option2, option3, option4, correct_answer) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($data['questions'] as $question) {
        if (!isset($question['text']) || !isset($question['options']) || !is_array($question['options']) || 
            count($question['options']) !== 4 || !isset($question['correctAnswer'])) {
            throw new Exception('Invalid question format');
        }
        
        $stmt->execute([
            $contentId,
            $question['text'],
            $question['options'][0],
            $question['options'][1],
            $question['options'][2],
            $question['options'][3],
            $question['correctAnswer']
        ]);
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Course content added successfully']);
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?> 
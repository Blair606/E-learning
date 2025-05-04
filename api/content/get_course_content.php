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

try {
    $conn = getConnection();
    // Fetch all course content for this teacher
    $stmt = $conn->prepare("SELECT * FROM course_content ORDER BY created_at DESC");
    $stmt->execute();
    $contents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch questions for each content
    foreach ($contents as &$content) {
        $stmt = $conn->prepare("SELECT * FROM course_questions WHERE content_id = ?");
        $stmt->execute([$content['id']]);
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format questions to match frontend expectations
        $content['questions'] = array_map(function($q) {
            return [
                'id' => $q['id'],
                'question_text' => $q['question_text'],
                'options' => [$q['option1'], $q['option2'], $q['option3'], $q['option4']],
                'correct_answer' => $q['correct_answer']
            ];
        }, $questions);
    }

    echo json_encode(['success' => true, 'contents' => $contents]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?> 
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

try {
    $conn = getConnection();
    // Fetch all course content for this teacher
    $stmt = $conn->prepare("SELECT * FROM course_contents WHERE teacher_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    $contents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch questions for each content
    foreach ($contents as &$content) {
        $qstmt = $conn->prepare("SELECT id, question_text, options, correct_answer FROM course_questions WHERE content_id = ?");
        $qstmt->execute([$content['id']]);
        $questions = $qstmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($questions as &$q) {
            $q['options'] = json_decode($q['options'], true);
        }
        $content['questions'] = $questions;
    }

    echo json_encode(['success' => true, 'contents' => $contents]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?> 
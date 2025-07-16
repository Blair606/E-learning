<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/cors.php';

handleCORS();

header('Content-Type: application/json');

$pdo = getConnection(); // <-- Add this line to get the PDO connection

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Auth check (teacher only)
$user = authenticate();
if (!$user || $user['role'] !== 'teacher') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$submission_id = isset($data['submission_id']) ? intval($data['submission_id']) : 0;
$marks_obtained = isset($data['grade']) ? floatval($data['grade']) : null;
$feedback = isset($data['feedback']) ? trim($data['feedback']) : null;

if (!$submission_id || $marks_obtained === null) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing submission_id or marks_obtained']);
    exit;
}

// Fetch the assignment's total_marks
try {
    $stmt = $pdo->prepare('SELECT a.total_marks FROM assignment_submissions s JOIN assignments a ON s.assignment_id = a.id WHERE s.id = :submission_id');
    $stmt->execute(['submission_id' => $submission_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Assignment not found for this submission']);
        exit;
    }
    $total_marks = floatval($row['total_marks']);
    if ($marks_obtained > $total_marks) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Marks cannot exceed the assignment total (' . $total_marks . ')']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error', 'details' => $e->getMessage()]);
    exit;
}

try {
    $stmt = $pdo->prepare('UPDATE assignment_submissions SET marks_obtained = :marks_obtained, feedback = :feedback, graded_at = NOW(), status = "graded" WHERE id = :submission_id');
    $stmt->execute([
        'marks_obtained' => $marks_obtained,
        'feedback' => $feedback,
        'submission_id' => $submission_id
    ]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error', 'details' => $e->getMessage()]);
    exit;
} 
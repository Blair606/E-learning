<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/cors.php';

handleCORS();

header('Content-Type: application/json');

$pdo = getConnection(); // <-- Add this line to get the PDO connection

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

$assignment_id = isset($_GET['assignment_id']) ? intval($_GET['assignment_id']) : 0;
if (!$assignment_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing assignment_id']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT s.id as submission_id, s.student_id, u.first_name, u.last_name, u.email, s.submission_text, s.file_path, s.submitted_at, s.marks_obtained, s.feedback, s.graded_at
         FROM assignment_submissions s
         JOIN users u ON s.student_id = u.id
         WHERE s.assignment_id = :assignment_id
         ORDER BY s.submitted_at DESC'
    );
    $stmt->execute(['assignment_id' => $assignment_id]);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'submissions' => $submissions]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error', 'details' => $e->getMessage()]);
    exit;
} 
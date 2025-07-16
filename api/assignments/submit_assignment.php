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
    // Authenticate student
    $payload = AuthMiddleware::authenticate();
    if (!$payload || $payload['role'] !== 'student') {
        http_response_code(401);
        $msg = 'Unauthorized - Students only';
        error_log('[submit_assignment.php] 401: ' . $msg . ' PAYLOAD: ' . json_encode($payload));
        echo json_encode(['success' => false, 'message' => $msg]);
        exit();
    }
    $student_id = $payload['sub'];

    // Accept POST data
    $assignment_id = isset($_POST['assignment_id']) ? intval($_POST['assignment_id']) : null;
    $submission_text = isset($_POST['submission_text']) ? trim($_POST['submission_text']) : null;
    $type = isset($_POST['type']) ? $_POST['type'] : null;

    if (!$assignment_id || !$type || ($type === 'text' && !$submission_text && empty($_FILES['file']))) {
        http_response_code(400);
        $msg = 'Missing required fields.';
        error_log('[submit_assignment.php] 400: ' . $msg . ' POST: ' . json_encode($_POST));
        echo json_encode(['success' => false, 'message' => $msg]);
        exit();
    }

    $conn = getConnection();

    // Check if assignment exists and get type
    $stmt = $conn->prepare('SELECT id, type FROM assignments WHERE id = ?');
    $stmt->execute([$assignment_id]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$assignment) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Assignment not found.']);
        exit();
    }
    if ($assignment['type'] !== $type) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Assignment type mismatch.']);
        exit();
    }

    // Prevent duplicate submissions
    $stmt = $conn->prepare('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?');
    $stmt->execute([$assignment_id, $student_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You have already submitted this assignment.']);
        exit();
    }

    $file_path = null;
    if ($type === 'file') {
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File upload required for file type assignments.']);
            exit();
        }
        $uploadDir = '../uploads/assignments/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $fileName = basename($_FILES['file']['name']);
        $file_path = $uploadDir . uniqid() . '_' . $fileName;
        if (!move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to upload file.']);
            exit();
        }
    }

    $stmt = $conn->prepare('INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, file_path, status, submitted_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $status = 'submitted';
    $stmt->execute([
        $assignment_id,
        $student_id,
        $type === 'text' ? $submission_text : null,
        $type === 'file' ? $file_path : null,
        $status
    ]);

    echo json_encode(['success' => true, 'message' => 'Assignment submitted successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    error_log('[submit_assignment.php] PDOException: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    error_log('[submit_assignment.php] Exception: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 
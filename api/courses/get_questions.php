<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../config/auth.php';

header('Content-Type: application/json');

try {
    // Get authenticated user
    $user = getAuthenticatedUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }

    // Get content ID from query parameters
    $contentId = isset($_GET['content_id']) ? intval($_GET['content_id']) : null;
    if (!$contentId) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Content ID is required'
        ]);
        exit;
    }

    $conn = getConnection();

    // Check if user has access to this content
    $stmt = $conn->prepare("
        SELECT cc.id 
        FROM course_content cc
        JOIN courses c ON cc.course_id = c.id
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.student_id = :student_id
        WHERE cc.id = :content_id 
        AND (
            c.instructor_id = :user_id 
            OR e.status = 'active'
            OR :is_admin = 1
        )
    ");
    
    $stmt->execute([
        ':content_id' => $contentId,
        ':user_id' => $user['id'],
        ':student_id' => $user['student_id'] ?? null,
        ':is_admin' => $user['role'] === 'admin' ? 1 : 0
    ]);

    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'You do not have access to this content'
        ]);
        exit;
    }

    // Fetch questions
    $stmt = $conn->prepare("
        SELECT 
            id,
            question_text,
            option1,
            option2,
            option3,
            option4,
            correct_answer,
            created_at,
            updated_at
        FROM course_questions
        WHERE content_id = :content_id
        ORDER BY created_at ASC
    ");

    $stmt->execute([':content_id' => $contentId]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format questions for response
    $formattedQuestions = array_map(function($question) use ($user) {
        $data = [
            'id' => $question['id'],
            'question_text' => $question['question_text'],
            'options' => [
                $question['option1'],
                $question['option2'],
                $question['option3'],
                $question['option4']
            ],
            'created_at' => $question['created_at'],
            'updated_at' => $question['updated_at']
        ];

        // Only include correct answer for teachers and admins
        if ($user['role'] === 'teacher' || $user['role'] === 'admin') {
            $data['correct_answer'] = $question['correct_answer'];
        }

        return $data;
    }, $questions);

    echo json_encode([
        'status' => 'success',
        'data' => $formattedQuestions
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
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

    // Check if user is a teacher
    if ($user['role'] !== 'teacher') {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only teachers can add questions'
        ]);
        exit;
    }

    // Get request data
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $required_fields = ['content_id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_answer'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => "Missing required field: $field"
            ]);
            exit;
        }
    }

    // Validate correct_answer is between 1 and 4
    if (!in_array($data['correct_answer'], [1, 2, 3, 4])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Correct answer must be between 1 and 4'
        ]);
        exit;
    }

    $conn = getConnection();

    // Start transaction
    $conn->beginTransaction();

    try {
        // Verify content exists and belongs to a course taught by this teacher
        $stmt = $conn->prepare("
            SELECT cc.id 
            FROM course_content cc
            JOIN courses c ON cc.course_id = c.id
            WHERE cc.id = :content_id 
            AND c.instructor_id = :teacher_id
        ");
        
        $stmt->execute([
            ':content_id' => $data['content_id'],
            ':teacher_id' => $user['id']
        ]);

        if (!$stmt->fetch()) {
            throw new Exception('Content not found or you do not have permission to add questions to it');
        }

        // Insert the question
        $stmt = $conn->prepare("
            INSERT INTO course_questions (
                content_id,
                question_text,
                option1,
                option2,
                option3,
                option4,
                correct_answer
            ) VALUES (
                :content_id,
                :question_text,
                :option1,
                :option2,
                :option3,
                :option4,
                :correct_answer
            )
        ");

        $stmt->execute([
            ':content_id' => $data['content_id'],
            ':question_text' => $data['question_text'],
            ':option1' => $data['option1'],
            ':option2' => $data['option2'],
            ':option3' => $data['option3'],
            ':option4' => $data['option4'],
            ':correct_answer' => $data['correct_answer']
        ]);

        $questionId = $conn->lastInsertId();

        // Commit transaction
        $conn->commit();

        // Return success response
        echo json_encode([
            'status' => 'success',
            'message' => 'Question added successfully',
            'data' => [
                'id' => $questionId,
                'content_id' => $data['content_id'],
                'question_text' => $data['question_text'],
                'options' => [
                    $data['option1'],
                    $data['option2'],
                    $data['option3'],
                    $data['option4']
                ],
                'correct_answer' => $data['correct_answer']
            ]
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
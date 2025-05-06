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
            'message' => 'Only teachers can add course content'
        ]);
        exit;
    }

    // Get request data
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($data['course_id']) || !isset($data['title']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Course ID, title, and content are required'
        ]);
        exit;
    }

    $conn = getConnection();

    // Start transaction
    $conn->beginTransaction();

    try {
        // Verify course exists and user is the instructor
        $stmt = $conn->prepare("
            SELECT id 
            FROM courses 
            WHERE id = :course_id 
            AND instructor_id = :instructor_id
        ");
        
        $stmt->execute([
            ':course_id' => $data['course_id'],
            ':instructor_id' => $user['id']
        ]);

        if (!$stmt->fetch()) {
            throw new Exception('Course not found or you do not have permission to add content to it');
        }

        // Insert the content
        $stmt = $conn->prepare("
            INSERT INTO course_content (
                course_id,
                title,
                content
            ) VALUES (
                :course_id,
                :title,
                :content
            )
        ");

        $stmt->execute([
            ':course_id' => $data['course_id'],
            ':title' => $data['title'],
            ':content' => $data['content']
        ]);

        $contentId = $conn->lastInsertId();

        // If there are questions, add them
        if (isset($data['questions']) && is_array($data['questions'])) {
            $questionStmt = $conn->prepare("
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

            foreach ($data['questions'] as $question) {
                if (
                    isset($question['question_text']) &&
                    isset($question['options']) &&
                    is_array($question['options']) &&
                    count($question['options']) === 4 &&
                    isset($question['correct_answer']) &&
                    in_array($question['correct_answer'], [1, 2, 3, 4])
                ) {
                    $questionStmt->execute([
                        ':content_id' => $contentId,
                        ':question_text' => $question['question_text'],
                        ':option1' => $question['options'][0],
                        ':option2' => $question['options'][1],
                        ':option3' => $question['options'][2],
                        ':option4' => $question['options'][3],
                        ':correct_answer' => $question['correct_answer']
                    ]);
                }
            }
        }

        // Commit transaction
        $conn->commit();

        // Fetch the created content with questions
        $stmt = $conn->prepare("
            SELECT 
                cc.*,
                c.name as course_name,
                (SELECT COUNT(*) FROM course_questions WHERE content_id = cc.id) as question_count
            FROM course_content cc
            JOIN courses c ON cc.course_id = c.id
            WHERE cc.id = :content_id
        ");

        $stmt->execute([':content_id' => $contentId]);
        $content = $stmt->fetch(PDO::FETCH_ASSOC);

        // Return success response
        echo json_encode([
            'status' => 'success',
            'message' => 'Course content added successfully',
            'data' => $content
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
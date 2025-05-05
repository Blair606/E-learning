<?php
require_once '../config/cors.php';
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../middleware/auth.php';

// Verify JWT token
$user = AuthMiddleware::authenticate();

if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$conn = getConnection();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['title']) || !isset($data['course_id']) || !isset($data['scheduled_date']) || 
                !isset($data['scheduled_time']) || !isset($data['duration'])) {
                throw new Exception('Missing required fields');
            }

            // Verify the course belongs to the teacher
            $verify_query = "SELECT id FROM courses WHERE id = :course_id AND instructor_id = :instructor_id";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':course_id' => $data['course_id'],
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to schedule class for this course');
            }

            // Insert the new class
            $query = "
                INSERT INTO online_classes (
                    title, course_id, instructor_id, scheduled_date, 
                    scheduled_time, duration, meeting_link, description
                ) VALUES (
                    :title, :course_id, :instructor_id, :scheduled_date,
                    :scheduled_time, :duration, :meeting_link, :description
                )
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([
                ':title' => $data['title'],
                ':course_id' => $data['course_id'],
                ':instructor_id' => $user['sub'],
                ':scheduled_date' => $data['scheduled_date'],
                ':scheduled_time' => $data['scheduled_time'],
                ':duration' => $data['duration'],
                ':meeting_link' => $data['meeting_link'] ?? null,
                ':description' => $data['description'] ?? null
            ]);
            
            $class_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Class scheduled successfully',
                'class_id' => $class_id
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error scheduling class: ' . $e->getMessage()
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}
?> 
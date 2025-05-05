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
    case 'GET':
        // Get online classes
        try {
            $teacher_id = $user['sub'];
            $query = "
                SELECT 
                    oc.*,
                    c.name as course_name,
                    COUNT(DISTINCT cp.id) as participant_count,
                    cr.recording_url,
                    cr.thumbnail_url
                FROM online_classes oc
                LEFT JOIN courses c ON oc.course_id = c.id
                LEFT JOIN class_participants cp ON oc.id = cp.class_id
                LEFT JOIN class_recordings cr ON oc.id = cr.class_id
                WHERE oc.instructor_id = :teacher_id
                GROUP BY oc.id
                ORDER BY oc.scheduled_date DESC, oc.scheduled_time DESC
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $stmt->execute();
            $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'classes' => $classes
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching online classes: ' . $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        // Create new online class
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title']) || !isset($data['course_id']) || !isset($data['scheduled_date']) || 
                !isset($data['scheduled_time']) || !isset($data['duration'])) {
                throw new Exception('Missing required fields');
            }

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
                'message' => 'Online class created successfully',
                'class_id' => $class_id
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error creating online class: ' . $e->getMessage()
            ]);
        }
        break;

    case 'PUT':
        // Update online class
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('Class ID is required');
            }

            // Verify the class belongs to the teacher
            $verify_query = "SELECT id FROM online_classes WHERE id = :id AND instructor_id = :instructor_id";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':id' => $data['id'],
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to update this class');
            }

            $update_fields = [];
            $params = [':id' => $data['id']];
            
            $allowed_fields = ['title', 'scheduled_date', 'scheduled_time', 'duration', 'meeting_link', 'description', 'status'];
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $update_fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }
            
            if (empty($update_fields)) {
                throw new Exception('No fields to update');
            }

            $query = "UPDATE online_classes SET " . implode(', ', $update_fields) . " WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Online class updated successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error updating online class: ' . $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        // Delete online class
        try {
            $class_id = $_GET['id'] ?? null;
            
            if (!$class_id) {
                throw new Exception('Class ID is required');
            }

            // Verify the class belongs to the teacher
            $verify_query = "SELECT id FROM online_classes WHERE id = :id AND instructor_id = :instructor_id";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':id' => $class_id,
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to delete this class');
            }

            $query = "DELETE FROM online_classes WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':id' => $class_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Online class deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting online class: ' . $e->getMessage()
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
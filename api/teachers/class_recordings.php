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
        // Get recordings for a class
        try {
            $class_id = $_GET['class_id'] ?? null;
            
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
                throw new Exception('Unauthorized to access this class');
            }

            $query = "
                SELECT 
                    cr.*,
                    u.name as uploaded_by_name
                FROM class_recordings cr
                LEFT JOIN users u ON cr.uploaded_by = u.id
                WHERE cr.class_id = :class_id
                ORDER BY cr.created_at DESC
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':class_id', $class_id, PDO::PARAM_INT);
            $stmt->execute();
            $recordings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'recordings' => $recordings
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching recordings: ' . $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        // Add a new recording
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['class_id']) || !isset($data['recording_url'])) {
                throw new Exception('Missing required fields');
            }

            // Verify the class belongs to the teacher
            $verify_query = "SELECT id FROM online_classes WHERE id = :id AND instructor_id = :instructor_id";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':id' => $data['class_id'],
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to add recording to this class');
            }

            $query = "
                INSERT INTO class_recordings (
                    class_id, recording_url, duration, thumbnail_url
                ) VALUES (
                    :class_id, :recording_url, :duration, :thumbnail_url
                )
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([
                ':class_id' => $data['class_id'],
                ':recording_url' => $data['recording_url'],
                ':duration' => $data['duration'] ?? null,
                ':thumbnail_url' => $data['thumbnail_url'] ?? null
            ]);
            
            $recording_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Recording added successfully',
                'recording_id' => $recording_id
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error adding recording: ' . $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        // Delete a recording
        try {
            $recording_id = $_GET['id'] ?? null;
            
            if (!$recording_id) {
                throw new Exception('Recording ID is required');
            }

            // Verify the recording belongs to a class owned by the teacher
            $verify_query = "
                SELECT cr.id 
                FROM class_recordings cr
                JOIN online_classes oc ON cr.class_id = oc.id
                WHERE cr.id = :recording_id AND oc.instructor_id = :instructor_id
            ";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':recording_id' => $recording_id,
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to delete this recording');
            }

            $query = "DELETE FROM class_recordings WHERE id = :id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':id' => $recording_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Recording deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting recording: ' . $e->getMessage()
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
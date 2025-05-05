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
            if (!isset($data['class_id']) || !isset($data['title']) || !isset($data['type'])) {
                throw new Exception('Missing required fields');
            }

            // Verify the class belongs to the teacher
            $verify_query = "SELECT id FROM online_classes WHERE id = :class_id AND instructor_id = :instructor_id";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':class_id' => $data['class_id'],
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to add materials to this class');
            }

            // Insert the material
            $query = "
                INSERT INTO class_materials (
                    class_id, title, description, file_url, file_type, 
                    file_size, uploader_id, material_type
                ) VALUES (
                    :class_id, :title, :description, :file_url, :file_type,
                    :file_size, :uploader_id, :material_type
                )
            ";
            
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([
                ':class_id' => $data['class_id'],
                ':title' => $data['title'],
                ':description' => $data['description'] ?? null,
                ':file_url' => $data['file_url'] ?? null,
                ':file_type' => $data['file_type'] ?? null,
                ':file_size' => $data['file_size'] ?? null,
                ':uploader_id' => $user['sub'],
                ':material_type' => $data['type']
            ]);

            if (!$result) {
                throw new Exception('Failed to insert material into database');
            }
            
            $material_id = $conn->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Material added successfully',
                'material_id' => $material_id
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error adding material: ' . $e->getMessage()
            ]);
        }
        break;

    case 'GET':
        try {
            if (!isset($_GET['class_id'])) {
                throw new Exception('Class ID is required');
            }

            // Verify the class belongs to the teacher
            $verify_query = "SELECT id FROM online_classes WHERE id = :class_id AND instructor_id = :instructor_id";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':class_id' => $_GET['class_id'],
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to view materials for this class');
            }

            // Get materials for the class
            $query = "
                SELECT * FROM class_materials 
                WHERE class_id = :class_id 
                ORDER BY created_at DESC
            ";
            
            $stmt = $conn->prepare($query);
            $stmt->execute([':class_id' => $_GET['class_id']]);
            
            $materials = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'materials' => $materials
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching materials: ' . $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['material_id'])) {
                throw new Exception('Material ID is required');
            }

            // Verify the material belongs to a class taught by the teacher
            $verify_query = "
                SELECT cm.id 
                FROM class_materials cm
                JOIN online_classes oc ON cm.class_id = oc.id
                WHERE cm.id = :material_id 
                AND oc.instructor_id = :instructor_id
            ";
            $verify_stmt = $conn->prepare($verify_query);
            $verify_stmt->execute([
                ':material_id' => $data['material_id'],
                ':instructor_id' => $user['sub']
            ]);
            
            if (!$verify_stmt->fetch()) {
                throw new Exception('Unauthorized to delete this material');
            }

            // Delete the material
            $query = "DELETE FROM class_materials WHERE id = :material_id";
            $stmt = $conn->prepare($query);
            $stmt->execute([':material_id' => $data['material_id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Material deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting material: ' . $e->getMessage()
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
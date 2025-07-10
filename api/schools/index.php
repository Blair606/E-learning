<?php
file_put_contents(__DIR__ . '/../debug_schools.txt', 'schools endpoint hit at ' . date('c') . PHP_EOL, FILE_APPEND);
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Include CORS configuration first
include_once '../config/cors.php';

// Handle CORS before any other operations
// handleCORS();

// Set content type
header('Content-Type: application/json');

// Include database configuration
include_once '../config/database.php';

try {
    // Ensure database and tables exist
    ensureDatabaseExists();
    
    // Get database connection
    $db = getConnection();
    
    // Log the request
    error_log("Received " . $_SERVER['REQUEST_METHOD'] . " request to /schools/index.php");
    error_log("Request headers: " . print_r(getallheaders(), true));
    error_log("Request body: " . file_get_contents("php://input"));
} catch (Exception $e) {
    error_log("Error in schools/index.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Verify token for all requests except OPTIONS and GET
if ($method !== 'OPTIONS' && $method !== 'GET') {
    $headers = getallheaders();
    if(!isset($headers['Authorization'])) {
        error_log("No Authorization header found");
        http_response_code(401);
        echo json_encode(array("message" => "No token provided."));
        exit();
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    error_log("Token received: " . $token);

    // Verify token
    $stmt = $db->prepare("SELECT id, role FROM users WHERE token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        error_log("Invalid token: " . $token);
        http_response_code(401);
        echo json_encode(array("message" => "Invalid token."));
        exit();
    }

    // Verify admin role
    if ($user['role'] !== 'admin') {
        error_log("User does not have admin role");
        http_response_code(403);
        echo json_encode(array("message" => "Access denied. Admin role required."));
        exit();
    }
}

switch($method) {
    case 'GET':
        try {
            // Fetch all schools with their departments
            $query = "SELECT s.id, s.name, s.code, s.description, s.status, 
                     GROUP_CONCAT(d.id) as department_ids,
                     GROUP_CONCAT(d.name) as department_names
                     FROM schools s 
                     LEFT JOIN departments d ON s.id = d.school_id 
                     WHERE s.status = 'active'
                     GROUP BY s.id";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the departments data
            $formattedSchools = array_map(function($school) {
                $departmentIds = $school['department_ids'] ? explode(',', $school['department_ids']) : [];
                $departmentNames = $school['department_names'] ? explode(',', $school['department_names']) : [];
                $departments = array_map(function($id, $name) {
                    return ['id' => $id, 'name' => $name];
                }, $departmentIds, $departmentNames);
                
                unset($school['department_ids']);
                unset($school['department_names']);
                $school['departments'] = $departments;
                
                return $school;
            }, $schools);
            
            echo json_encode([
                'success' => true,
                'schools' => $formattedSchools
            ]);
        } catch (Exception $e) {
            error_log("Error in GET request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error retrieving schools: " . $e->getMessage()));
        }
        break;
        
    case 'POST':
        try {
            // Create new school
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data || !isset($data['name'])) {
                throw new Exception('School name is required');
            }

            $query = "INSERT INTO schools (name, code, description, status) VALUES (:name, :code, :description, :status)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':code', $data['code']);
            $stmt->bindParam(':description', $data['description']);
            $status = isset($data['status']) ? $data['status'] : 'active';
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                $schoolId = $db->lastInsertId();
                echo json_encode([
                    'success' => true,
                    'message' => 'School created successfully',
                    'school_id' => $schoolId
                ]);
            } else {
                throw new Exception('Failed to create school');
            }
        } catch (Exception $e) {
            error_log("Error in POST request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error creating school: " . $e->getMessage()));
        }
        break;
        
    case 'PUT':
        try {
            // Update school
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!$data || !isset($data['id'])) {
                throw new Exception('School ID is required');
            }

            $query = "UPDATE schools SET 
                     name = :name,
                     code = :code,
                     description = :description,
                     status = :status
                     WHERE id = :id";
            
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':code', $data['code']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':status', $data['status']);

            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'School updated successfully'
                ]);
            } else {
                throw new Exception('Failed to update school');
            }
        } catch (Exception $e) {
            error_log("Error in PUT request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error updating school: " . $e->getMessage()));
        }
        break;
        
    case 'DELETE':
        try {
            // Delete school
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            
            if (!$id) {
                throw new Exception('School ID is required');
            }

            $query = "DELETE FROM schools WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'School deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete school');
            }
        } catch (Exception $e) {
            error_log("Error in DELETE request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error deleting school: " . $e->getMessage()));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?>
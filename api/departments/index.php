<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Include CORS configuration first
include_once '../config/cors.php';

// Handle CORS before any other operations
handleCORS();

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
    error_log("Received " . $_SERVER['REQUEST_METHOD'] . " request to /departments/index.php");
    error_log("Request headers: " . print_r(getallheaders(), true));
    error_log("Request body: " . file_get_contents("php://input"));
} catch (Exception $e) {
    error_log("Error in departments/index.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Verify token for all requests except OPTIONS
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
            if(isset($_GET['id'])) {
                // Get single department
                $stmt = $db->prepare("SELECT d.*, s.name as school_name FROM departments d 
                                    LEFT JOIN schools s ON d.school_id = s.id 
                                    WHERE d.id = ?");
                $stmt->execute([$_GET['id']]);
                $department = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if($department) {
                    http_response_code(200);
                    echo json_encode($department);
                } else {
                    http_response_code(404);
                    echo json_encode(array("message" => "Department not found."));
                }
            } else if(isset($_GET['school_id'])) {
                // Get departments by school
                $stmt = $db->prepare("SELECT d.*, s.name as school_name FROM departments d 
                                    LEFT JOIN schools s ON d.school_id = s.id 
                                    WHERE d.school_id = ?");
                $stmt->execute([$_GET['school_id']]);
                $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                http_response_code(200);
                echo json_encode($departments);
            } else {
                // Get all departments
                $stmt = $db->prepare("SELECT d.*, s.name as school_name FROM departments d 
                                    LEFT JOIN schools s ON d.school_id = s.id");
                $stmt->execute();
                $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                http_response_code(200);
                echo json_encode($departments);
            }
        } catch (Exception $e) {
            error_log("Error getting departments: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error getting departments: " . $e->getMessage()));
        }
        break;

    case 'POST':
        try {
            // Create new department
            $data = json_decode(file_get_contents("php://input"));
            error_log("Received data for department creation: " . print_r($data, true));

            if(!isset($data->name) || !isset($data->code) || !isset($data->school_id)) {
                http_response_code(400);
                echo json_encode(array("message" => "Name, code, and school_id are required."));
                exit();
            }

            // Check if school exists
            $stmt = $db->prepare("SELECT id FROM schools WHERE id = ?");
            $stmt->execute([$data->school_id]);
            if($stmt->rowCount() === 0) {
                http_response_code(400);
                echo json_encode(array("message" => "Invalid school_id."));
                exit();
            }

            // Check if code is unique
            $stmt = $db->prepare("SELECT id FROM departments WHERE code = ?");
            $stmt->execute([$data->code]);
            if($stmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(array("message" => "Department code already exists."));
                exit();
            }

            // Insert department
            $stmt = $db->prepare("INSERT INTO departments (name, code, school_id, description, status) 
                                VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data->name,
                $data->code,
                $data->school_id,
                $data->description ?? '',
                $data->status ?? 'active'
            ]);

            $departmentId = $db->lastInsertId();

            http_response_code(201);
            echo json_encode(array(
                "message" => "Department created successfully.",
                "id" => $departmentId
            ));

        } catch (Exception $e) {
            error_log("Error creating department: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error creating department: " . $e->getMessage()));
        }
        break;

    case 'PUT':
        try {
            // Update department
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->id)) {
                http_response_code(400);
                echo json_encode(array("message" => "Department ID is required."));
                exit();
            }

            // Check if department exists
            $stmt = $db->prepare("SELECT id FROM departments WHERE id = ?");
            $stmt->execute([$data->id]);
            if($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(array("message" => "Department not found."));
                exit();
            }

            // If code is being updated, check if it's unique
            if(isset($data->code)) {
                $stmt = $db->prepare("SELECT id FROM departments WHERE code = ? AND id != ?");
                $stmt->execute([$data->code, $data->id]);
                if($stmt->rowCount() > 0) {
                    http_response_code(400);
                    echo json_encode(array("message" => "Department code already exists."));
                    exit();
                }
            }

            // Update department
            $updateFields = array();
            $params = array();

            if(isset($data->name)) {
                $updateFields[] = "name = ?";
                $params[] = $data->name;
            }
            if(isset($data->code)) {
                $updateFields[] = "code = ?";
                $params[] = $data->code;
            }
            if(isset($data->school_id)) {
                $updateFields[] = "school_id = ?";
                $params[] = $data->school_id;
            }
            if(isset($data->description)) {
                $updateFields[] = "description = ?";
                $params[] = $data->description;
            }
            if(isset($data->status)) {
                $updateFields[] = "status = ?";
                $params[] = $data->status;
            }

            if(count($updateFields) > 0) {
                $params[] = $data->id;
                $sql = "UPDATE departments SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $stmt = $db->prepare($sql);
                $stmt->execute($params);

                http_response_code(200);
                echo json_encode(array("message" => "Department updated successfully."));
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "No fields to update."));
            }

        } catch (Exception $e) {
            error_log("Error updating department: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error updating department: " . $e->getMessage()));
        }
        break;

    case 'DELETE':
        try {
            // Delete department
            $data = json_decode(file_get_contents("php://input"));
            
            if(!isset($data->id)) {
                http_response_code(400);
                echo json_encode(array("message" => "Department ID is required."));
                exit();
            }

            // Check if department exists
            $stmt = $db->prepare("SELECT id FROM departments WHERE id = ?");
            $stmt->execute([$data->id]);
            if($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(array("message" => "Department not found."));
                exit();
            }

            // Delete department
            $stmt = $db->prepare("DELETE FROM departments WHERE id = ?");
            $stmt->execute([$data->id]);

            http_response_code(200);
            echo json_encode(array("message" => "Department deleted successfully."));

        } catch (Exception $e) {
            error_log("Error deleting department: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error deleting department: " . $e->getMessage()));
        }
        break;
}

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

// Skip token verification for OPTIONS requests
if ($method !== 'OPTIONS') {
    // Verify token for all other requests
    $headers = getallheaders();
    if(!isset($headers['Authorization'])) {
        error_log("No Authorization header found");
        http_response_code(401);
        echo json_encode(array("message" => "No token provided."));
        exit();
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    error_log("Token received: " . $token);

    try {
        $query = "SELECT id, role FROM users WHERE token = :token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":token", $token);
        $stmt->execute();

        if($stmt->rowCount() === 0) {
            error_log("Invalid token provided");
            http_response_code(401);
            echo json_encode(array("message" => "Invalid token."));
            exit();
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if($user['role'] !== 'admin') {
            error_log("User is not an admin. Role: " . $user['role']);
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. Admin privileges required."));
            exit();
        }
    } catch (PDOException $e) {
        error_log("Database error during token verification: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(array("message" => "Internal server error during authentication."));
        exit();
    }
}

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get single department
            $query = "SELECT d.*, s.name as school_name 
                     FROM departments d 
                     LEFT JOIN school_departments sd ON d.id = sd.department_id 
                     LEFT JOIN schools s ON sd.school_id = s.id 
                     WHERE d.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $_GET['id']);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                http_response_code(200);
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Department not found."));
            }
        } else if(isset($_GET['school_id'])) {
            // Get departments by school ID
            $query = "SELECT d.*, s.name as school_name 
                     FROM departments d 
                     INNER JOIN school_departments sd ON d.id = sd.department_id 
                     INNER JOIN schools s ON sd.school_id = s.id 
                     WHERE sd.school_id = :school_id
                     ORDER BY d.name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":school_id", $_GET['school_id']);
            $stmt->execute();
            
            $departments = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($departments, $row);
            }
            
            http_response_code(200);
            echo json_encode($departments);
        } else if(isset($_GET['school_code'])) {
            // Get departments by school code
            $query = "SELECT d.*, s.name as school_name 
                     FROM departments d 
                     LEFT JOIN school_departments sd ON d.id = sd.department_id 
                     LEFT JOIN schools s ON sd.school_id = s.id 
                     WHERE s.code = :school_code
                     ORDER BY d.name";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":school_code", $_GET['school_code']);
            $stmt->execute();
            
            $departments = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($departments, $row);
            }
            
            http_response_code(200);
            echo json_encode($departments);
        } else {
            // Get all departments with their school names
            $query = "SELECT d.*, s.name as school_name 
                     FROM departments d 
                     LEFT JOIN school_departments sd ON d.id = sd.department_id 
                     LEFT JOIN schools s ON sd.school_id = s.id 
                     ORDER BY d.name";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $departments = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($departments, $row);
            }
            
            http_response_code(200);
            echo json_encode($departments);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        error_log("Received department data: " . print_r($data, true));
        
        if(!empty($data->name) && !empty($data->code) && !empty($data->school_id)) {
            try {
                $db->beginTransaction();
                
                // Check if code already exists
                $checkQuery = "SELECT id FROM departments WHERE code = :code";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->bindParam(":code", $data->code);
                $checkStmt->execute();
                
                if($checkStmt->rowCount() > 0) {
                    error_log("Department code already exists: " . $data->code);
                    throw new Exception("Department code already exists. Please try again.");
                }
                
                // Insert department
                $query = "INSERT INTO departments (name, code, school_id, description, status) 
                         VALUES (:name, :code, :school_id, :description, :status)";
                $stmt = $db->prepare($query);
                
                $status = isset($data->status) ? $data->status : 'active';
                $description = isset($data->description) ? $data->description : '';
                
                error_log("Attempting to insert department with values: " . print_r([
                    'name' => $data->name,
                    'code' => $data->code,
                    'school_id' => $data->school_id,
                    'description' => $description,
                    'status' => $status
                ], true));
                
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":school_id", $data->school_id);
                $stmt->bindParam(":description", $description);
                $stmt->bindParam(":status", $status);
                
                if($stmt->execute()) {
                    $departmentId = $db->lastInsertId();
                    error_log("Department created successfully with ID: " . $departmentId);
                    
                    $db->commit();
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "Department created successfully.",
                        "id" => $departmentId
                    ));
                } else {
                    error_log("Failed to execute department insert query");
                    throw new Exception("Failed to create department");
                }
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Error creating department: " . $e->getMessage());
                error_log("Stack trace: " . $e->getTraceAsString());
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create department: " . $e->getMessage()));
            }
        } else {
            error_log("Missing required fields. Received data: " . print_r($data, true));
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create department. Data is incomplete."));
        }
        break;
        
    case 'PUT':
        // Update department
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            try {
                $db->beginTransaction();
                
                // Update department
                $query = "UPDATE departments SET name = :name, code = :code, school_id = :school_id, 
                         description = :description, status = :status WHERE id = :id";
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":id", $data->id);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":school_id", $data->school_id);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":status", $data->status);
                
                if($stmt->execute()) {
                    $db->commit();
                    http_response_code(200);
                    echo json_encode(array("message" => "Department updated successfully."));
                } else {
                    throw new Exception("Failed to update department");
                }
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Error updating department: " . $e->getMessage());
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update department: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update department. Data is incomplete."));
        }
        break;
        
    case 'DELETE':
        // Delete department
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            try {
                $db->beginTransaction();
                
                // Delete department (cascade will handle related records)
                $query = "DELETE FROM departments WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    $db->commit();
                    http_response_code(200);
                    echo json_encode(array("message" => "Department deleted successfully."));
                } else {
                    throw new Exception("Failed to delete department");
                }
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Error deleting department: " . $e->getMessage());
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete department: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete department. Data is incomplete."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 

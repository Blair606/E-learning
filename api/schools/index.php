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

// Verify token for all requests except OPTIONS
if ($method !== 'OPTIONS') {
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
                // Get single school with its departments
                $query = "SELECT s.*, GROUP_CONCAT(d.name) as departments 
                         FROM schools s 
                         LEFT JOIN school_departments sd ON s.id = sd.school_id 
                         LEFT JOIN departments d ON sd.department_id = d.id 
                         WHERE s.id = :id 
                         GROUP BY s.id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $_GET['id']);
                $stmt->execute();
                
                if($stmt->rowCount() > 0) {
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    $row['departments'] = $row['departments'] ? explode(',', $row['departments']) : [];
                    http_response_code(200);
                    echo json_encode($row);
                } else {
                    http_response_code(404);
                    echo json_encode(array("message" => "School not found."));
                }
            } else {
                // Get all schools with their departments
                $query = "SELECT s.*, GROUP_CONCAT(d.name) as departments 
                         FROM schools s 
                         LEFT JOIN school_departments sd ON s.id = sd.school_id 
                         LEFT JOIN departments d ON sd.department_id = d.id 
                         GROUP BY s.id";
                $stmt = $db->prepare($query);
                $stmt->execute();
                
                $schools = array();
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $row['departments'] = $row['departments'] ? explode(',', $row['departments']) : [];
                    $schools[] = $row;
                }
                
                http_response_code(200);
                echo json_encode($schools);
            }
        } catch (Exception $e) {
            error_log("Error in GET request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error retrieving schools: " . $e->getMessage()));
        }
        break;
        
    case 'POST':
        try {
            // Create new school
            $data = json_decode(file_get_contents("php://input"));
            error_log("Received data for school creation: " . print_r($data, true));
            
            if(!empty($data->name) && !empty($data->code)) {
                // Check if code already exists
                $query = "SELECT id FROM schools WHERE code = :code";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":code", $data->code);
                $stmt->execute();
                
                if($stmt->rowCount() > 0) {
                    http_response_code(400);
                    echo json_encode(array("message" => "School code already exists."));
                    exit();
                }
                
                // Insert new school
                $query = "INSERT INTO schools (name, code, description, status) VALUES (:name, :code, :description, :status)";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":description", $data->description);
                $status = isset($data->status) ? $data->status : 'active';
                $stmt->bindParam(":status", $status);
                
                if($stmt->execute()) {
                    $schoolId = $db->lastInsertId();
                    
                    // Add departments if provided
                    if(!empty($data->departments)) {
                        foreach($data->departments as $deptName) {
                            // Check if department exists
                            $query = "SELECT id FROM departments WHERE name = :name";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":name", $deptName);
                            $stmt->execute();
                            
                            if($stmt->rowCount() > 0) {
                                $dept = $stmt->fetch(PDO::FETCH_ASSOC);
                                // Link department to school
                                $query = "INSERT INTO school_departments (school_id, department_id) VALUES (:school_id, :dept_id)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(":school_id", $schoolId);
                                $stmt->bindParam(":dept_id", $dept['id']);
                                $stmt->execute();
                            }
                        }
                    }
                    
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "School created successfully.",
                        "id" => $schoolId
                    ));
                }
            } else {
                error_log("Missing required fields. Received data: " . print_r($data, true));
                http_response_code(400);
                echo json_encode(array("message" => "Unable to create school. Data is incomplete."));
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
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->id)) {
                // Check if school exists
                $query = "SELECT id FROM schools WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                $stmt->execute();
                
                if($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(array("message" => "School not found."));
                    exit();
                }
                
                // Update school
                $query = "UPDATE schools SET 
                         name = :name,
                         code = :code,
                         description = :description,
                         status = :status,
                         updated_at = CURRENT_TIMESTAMP
                         WHERE id = :id";
                         
                $stmt = $db->prepare($query);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":status", $data->status);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    // Update departments if provided
                    if(isset($data->departments)) {
                        // Remove existing department links
                        $query = "DELETE FROM school_departments WHERE school_id = :school_id";
                        $stmt = $db->prepare($query);
                        $stmt->bindParam(":school_id", $data->id);
                        $stmt->execute();
                        
                        // Add new department links
                        foreach($data->departments as $deptName) {
                            $query = "SELECT id FROM departments WHERE name = :name";
                            $stmt = $db->prepare($query);
                            $stmt->bindParam(":name", $deptName);
                            $stmt->execute();
                            
                            if($stmt->rowCount() > 0) {
                                $dept = $stmt->fetch(PDO::FETCH_ASSOC);
                                $query = "INSERT INTO school_departments (school_id, department_id) VALUES (:school_id, :dept_id)";
                                $stmt = $db->prepare($query);
                                $stmt->bindParam(":school_id", $data->id);
                                $stmt->bindParam(":dept_id", $dept['id']);
                                $stmt->execute();
                            }
                        }
                    }
                    
                    http_response_code(200);
                    echo json_encode(array("message" => "School updated successfully."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Unable to update school. Missing ID."));
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
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->id)) {
                // Check if school exists
                $query = "SELECT id FROM schools WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                $stmt->execute();
                
                if($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(array("message" => "School not found."));
                    exit();
                }
                
                // Delete school (will cascade delete school_departments entries)
                $query = "DELETE FROM schools WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "School deleted successfully."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Unable to delete school. Missing ID."));
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
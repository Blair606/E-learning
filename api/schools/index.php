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

// Verify token for all requests
$headers = getallheaders();
if(!isset($headers['Authorization'])) {
    error_log("No Authorization header found");
    http_response_code(401);
    echo json_encode(array("message" => "No token provided."));
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
error_log("Token received: " . $token);

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

switch($method) {
    case 'GET':
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
                array_push($schools, $row);
            }
            
            http_response_code(200);
            echo json_encode($schools);
        }
        break;
        
    case 'POST':
        // Create new school
        $data = json_decode(file_get_contents("php://input"));
        error_log("Received data for school creation: " . print_r($data, true));
        
        if(!empty($data->name) && !empty($data->code)) {
            try {
                $db->beginTransaction();
                
                // Check if code already exists
                $checkQuery = "SELECT id FROM schools WHERE code = :code";
                $checkStmt = $db->prepare($checkQuery);
                $checkStmt->bindParam(":code", $data->code);
                $checkStmt->execute();
                
                if($checkStmt->rowCount() > 0) {
                    error_log("School code already exists: " . $data->code);
                    throw new Exception("School code already exists. Please try again.");
                }
                
                // Insert school
                $query = "INSERT INTO schools (name, code, description, status) 
                         VALUES (:name, :code, :description, :status)";
                $stmt = $db->prepare($query);
                
                $status = isset($data->status) ? $data->status : 'active';
                $description = isset($data->description) ? $data->description : '';
                
                error_log("Attempting to insert school with values: " . print_r([
                    'name' => $data->name,
                    'code' => $data->code,
                    'description' => $description,
                    'status' => $status
                ], true));
                
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":description", $description);
                $stmt->bindParam(":status", $status);
                
                if($stmt->execute()) {
                    $schoolId = $db->lastInsertId();
                    error_log("School created successfully with ID: " . $schoolId);
                    
                    // Handle departments if provided
                    if(!empty($data->departments)) {
                        error_log("Processing departments: " . print_r($data->departments, true));
                        foreach($data->departments as $deptName) {
                            // Generate unique department code
                            $deptCode = strtoupper(substr($deptName, 0, 3));
                            $deptCode .= str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
                            
                            // Insert department
                            $deptQuery = "INSERT INTO departments (name, code, description, status) 
                                        VALUES (:name, :code, :description, :status)";
                            $deptStmt = $db->prepare($deptQuery);
                            
                            $deptStmt->bindParam(":name", $deptName);
                            $deptStmt->bindParam(":code", $deptCode);
                            $deptStmt->bindParam(":description", $description);
                            $deptStmt->bindParam(":status", $status);
                            $deptStmt->execute();
                            
                            $deptId = $db->lastInsertId();
                            error_log("Department created with ID: " . $deptId);
                            
                            // Link department to school using the junction table
                            $linkQuery = "INSERT INTO school_departments (school_id, department_id) 
                                        VALUES (:school_id, :department_id)";
                            $linkStmt = $db->prepare($linkQuery);
                            $linkStmt->bindParam(":school_id", $schoolId);
                            $linkStmt->bindParam(":department_id", $deptId);
                            $linkStmt->execute();
                            
                            error_log("Department linked to school");
                        }
                    }
                    
                    $db->commit();
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "School created successfully.",
                        "id" => $schoolId
                    ));
                } else {
                    error_log("Failed to execute school insert query");
                    throw new Exception("Failed to create school");
                }
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Error creating school: " . $e->getMessage());
                error_log("Stack trace: " . $e->getTraceAsString());
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create school: " . $e->getMessage()));
            }
        } else {
            error_log("Missing required fields. Received data: " . print_r($data, true));
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create school. Data is incomplete."));
        }
        break;
        
    case 'PUT':
        // Update school
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            try {
                $db->beginTransaction();
                
                // Update school
                $query = "UPDATE schools SET name = :name, code = :code, description = :description, status = :status 
                         WHERE id = :id";
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":id", $data->id);
                $stmt->bindParam(":name", $data->name);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":status", $data->status);
                
                if($stmt->execute()) {
                    // Handle departments if provided
                    if(isset($data->departments)) {
                        // Remove existing department links
                        $deleteQuery = "DELETE FROM school_departments WHERE school_id = :school_id";
                        $deleteStmt = $db->prepare($deleteQuery);
                        $deleteStmt->bindParam(":school_id", $data->id);
                        $deleteStmt->execute();
                        
                        // Add new departments
                        foreach($data->departments as $deptName) {
                            // Insert department
                            $deptQuery = "INSERT INTO departments (name, code, description, status) 
                                        VALUES (:name, :code, :description, :status)";
                            $deptStmt = $db->prepare($deptQuery);
                            
                            $deptCode = strtoupper(substr($deptName, 0, 3));
                            $deptCode .= str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
                            $deptStmt->bindParam(":name", $deptName);
                            $deptStmt->bindParam(":code", $deptCode);
                            $deptStmt->bindParam(":description", $data->description);
                            $deptStmt->bindParam(":status", $data->status);
                            $deptStmt->execute();
                            
                            $deptId = $db->lastInsertId();
                            
                            // Link department to school using the junction table
                            $linkQuery = "INSERT INTO school_departments (school_id, department_id) 
                                        VALUES (:school_id, :department_id)";
                            $linkStmt = $db->prepare($linkQuery);
                            $linkStmt->bindParam(":school_id", $data->id);
                            $linkStmt->bindParam(":department_id", $deptId);
                            $linkStmt->execute();
                            
                            error_log("Department created and linked to school");
                        }
                    }
                    
                    $db->commit();
                    http_response_code(200);
                    echo json_encode(array("message" => "School updated successfully."));
                } else {
                    throw new Exception("Failed to update school");
                }
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Error updating school: " . $e->getMessage());
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update school: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update school. Data is incomplete."));
        }
        break;
        
    case 'DELETE':
        // Delete school
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            try {
                $db->beginTransaction();
                
                // Delete school (cascade will handle related records)
                $query = "DELETE FROM schools WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    $db->commit();
                    http_response_code(200);
                    echo json_encode(array("message" => "School deleted successfully."));
                } else {
                    throw new Exception("Failed to delete school");
                }
            } catch (Exception $e) {
                $db->rollBack();
                error_log("Error deleting school: " . $e->getMessage());
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete school: " . $e->getMessage()));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete school. Data is incomplete."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 
<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Include CORS configuration first
include_once '../config/cors.php';

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
    error_log("Received " . $_SERVER['REQUEST_METHOD'] . " request to /courses/index.php");
    error_log("Request headers: " . print_r(getallheaders(), true));
    error_log("Request body: " . file_get_contents("php://input"));
} catch (Exception $e) {
    error_log("Error in courses/index.php: " . $e->getMessage());
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
                // Get single course with related data
                $query = "SELECT c.*, s.name as school_name, d.name as department_name, u.first_name as instructor_name 
                         FROM courses c 
                         LEFT JOIN schools s ON c.school_id = s.id 
                         LEFT JOIN departments d ON c.department_id = d.id 
                         LEFT JOIN users u ON c.instructor_id = u.id 
                         WHERE c.id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $_GET['id']);
                $stmt->execute();
                
                if($stmt->rowCount() > 0) {
                    $row = $stmt->fetch(PDO::FETCH_ASSOC);
                    $row['schedule'] = $row['schedule'] ? json_decode($row['schedule'], true) : null;
                    $row['prerequisites'] = $row['prerequisites'] ? json_decode($row['prerequisites'], true) : null;
                    http_response_code(200);
                    echo json_encode($row);
                } else {
                    http_response_code(404);
                    echo json_encode(array("message" => "Course not found."));
                }
            } else if(isset($_GET['school_id'])) {
                // Get courses by school
                $query = "SELECT c.*, s.name as school_name, d.name as department_name, u.first_name as instructor_name 
                         FROM courses c 
                         LEFT JOIN schools s ON c.school_id = s.id 
                         LEFT JOIN departments d ON c.department_id = d.id 
                         LEFT JOIN users u ON c.instructor_id = u.id 
                         WHERE c.school_id = :school_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":school_id", $_GET['school_id']);
                $stmt->execute();
                
                $courses = array();
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $row['schedule'] = $row['schedule'] ? json_decode($row['schedule'], true) : null;
                    $row['prerequisites'] = $row['prerequisites'] ? json_decode($row['prerequisites'], true) : null;
                    $courses[] = $row;
                }
                
                http_response_code(200);
                echo json_encode($courses);
            } else if(isset($_GET['department_id'])) {
                // Get courses by department
                $query = "SELECT c.*, s.name as school_name, d.name as department_name, u.first_name as instructor_name 
                         FROM courses c 
                         LEFT JOIN schools s ON c.school_id = s.id 
                         LEFT JOIN departments d ON c.department_id = d.id 
                         LEFT JOIN users u ON c.instructor_id = u.id 
                         WHERE c.department_id = :department_id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":department_id", $_GET['department_id']);
                $stmt->execute();
                
                $courses = array();
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $row['schedule'] = $row['schedule'] ? json_decode($row['schedule'], true) : null;
                    $row['prerequisites'] = $row['prerequisites'] ? json_decode($row['prerequisites'], true) : null;
                    $courses[] = $row;
                }
                
                http_response_code(200);
                echo json_encode($courses);
            } else {
                // Get all courses with related data
                $query = "SELECT c.*, s.name as school_name, d.name as department_name, u.first_name as instructor_name 
                         FROM courses c 
                         LEFT JOIN schools s ON c.school_id = s.id 
                         LEFT JOIN departments d ON c.department_id = d.id 
                         LEFT JOIN users u ON c.instructor_id = u.id";
                $stmt = $db->prepare($query);
                $stmt->execute();
                
                $courses = array();
                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $row['schedule'] = $row['schedule'] ? json_decode($row['schedule'], true) : null;
                    $row['prerequisites'] = $row['prerequisites'] ? json_decode($row['prerequisites'], true) : null;
                    $courses[] = $row;
                }
                
                http_response_code(200);
                echo json_encode($courses);
            }
        } catch (Exception $e) {
            error_log("Error in GET request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error retrieving courses: " . $e->getMessage()));
        }
        break;
        
    case 'POST':
        try {
            // Create new course
            $data = json_decode(file_get_contents("php://input"));
            error_log("Received data for course creation: " . print_r($data, true));
            
            if(!empty($data->code) && !empty($data->title) && !empty($data->school_id) && !empty($data->department_id)) {
                // Insert course
                $query = "INSERT INTO courses (code, title, description, credits, school_id, department_id, 
                         instructor_id, status, enrollment_capacity, current_enrollment, start_date, end_date, 
                         schedule, prerequisites) 
                         VALUES (:code, :title, :description, :credits, :school_id, :department_id, 
                         :instructor_id, :status, :enrollment_capacity, 0, :start_date, :end_date, 
                         :schedule, :prerequisites)";
                         
                $stmt = $db->prepare($query);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":title", $data->title);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":credits", $data->credits);
                $stmt->bindParam(":school_id", $data->school_id);
                $stmt->bindParam(":department_id", $data->department_id);
                $stmt->bindParam(":instructor_id", $data->instructor_id);
                $status = isset($data->status) ? $data->status : 'active';
                $stmt->bindParam(":status", $status);
                $stmt->bindParam(":enrollment_capacity", $data->enrollment_capacity);
                $stmt->bindParam(":start_date", $data->start_date);
                $stmt->bindParam(":end_date", $data->end_date);
                $schedule = json_encode($data->schedule);
                $stmt->bindParam(":schedule", $schedule);
                $prerequisites = json_encode($data->prerequisites);
                $stmt->bindParam(":prerequisites", $prerequisites);
                
                if($stmt->execute()) {
                    $courseId = $db->lastInsertId();
                    
                    // Fetch the created course with related data
                    $query = "SELECT c.*, s.name as school_name, d.name as department_name, u.first_name as instructor_name 
                             FROM courses c 
                             LEFT JOIN schools s ON c.school_id = s.id 
                             LEFT JOIN departments d ON c.department_id = d.id 
                             LEFT JOIN users u ON c.instructor_id = u.id 
                             WHERE c.id = :id";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":id", $courseId);
                    $stmt->execute();
                    
                    if($stmt->rowCount() > 0) {
                        $row = $stmt->fetch(PDO::FETCH_ASSOC);
                        $row['schedule'] = $row['schedule'] ? json_decode($row['schedule'], true) : null;
                        $row['prerequisites'] = $row['prerequisites'] ? json_decode($row['prerequisites'], true) : null;
                        http_response_code(201);
                        echo json_encode($row);
                    } else {
                        http_response_code(500);
                        echo json_encode(array("message" => "Error retrieving created course."));
                    }
                }
            } else {
                error_log("Missing required fields. Received data: " . print_r($data, true));
                http_response_code(400);
                echo json_encode(array("message" => "Unable to create course. Data is incomplete."));
            }
        } catch (Exception $e) {
            error_log("Error in POST request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error creating course: " . $e->getMessage()));
        }
        break;
        
    case 'PUT':
        try {
            // Update course
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->id)) {
                // Check if course exists
                $query = "SELECT id FROM courses WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                $stmt->execute();
                
                if($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(array("message" => "Course not found."));
                    exit();
                }
                
                // Update course
                $query = "UPDATE courses SET 
                         code = :code,
                         title = :title,
                         description = :description,
                         credits = :credits,
                         school_id = :school_id,
                         department_id = :department_id,
                         instructor_id = :instructor_id,
                         status = :status,
                         enrollment_capacity = :enrollment_capacity,
                         start_date = :start_date,
                         end_date = :end_date,
                         schedule = :schedule,
                         prerequisites = :prerequisites,
                         updated_at = CURRENT_TIMESTAMP
                         WHERE id = :id";
                         
                $stmt = $db->prepare($query);
                $stmt->bindParam(":code", $data->code);
                $stmt->bindParam(":title", $data->title);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":credits", $data->credits);
                $stmt->bindParam(":school_id", $data->school_id);
                $stmt->bindParam(":department_id", $data->department_id);
                $stmt->bindParam(":instructor_id", $data->instructor_id);
                $stmt->bindParam(":status", $data->status);
                $stmt->bindParam(":enrollment_capacity", $data->enrollment_capacity);
                $stmt->bindParam(":start_date", $data->start_date);
                $stmt->bindParam(":end_date", $data->end_date);
                $schedule = json_encode($data->schedule);
                $stmt->bindParam(":schedule", $schedule);
                $prerequisites = json_encode($data->prerequisites);
                $stmt->bindParam(":prerequisites", $prerequisites);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Course updated successfully."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Unable to update course. Missing ID."));
            }
        } catch (Exception $e) {
            error_log("Error in PUT request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error updating course: " . $e->getMessage()));
        }
        break;
        
    case 'DELETE':
        try {
            // Delete course
            $data = json_decode(file_get_contents("php://input"));
            
            if(!empty($data->id)) {
                // Check if course exists
                $query = "SELECT id FROM courses WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                $stmt->execute();
                
                if($stmt->rowCount() === 0) {
                    http_response_code(404);
                    echo json_encode(array("message" => "Course not found."));
                    exit();
                }
                
                // Delete course
                $query = "DELETE FROM courses WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Course deleted successfully."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("message" => "Unable to delete course. Missing ID."));
            }
        } catch (Exception $e) {
            error_log("Error in DELETE request: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array("message" => "Error deleting course: " . $e->getMessage()));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}
?> 
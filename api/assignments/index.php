<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Verify token for all requests
$headers = getallheaders();
if(!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(array("message" => "No token provided."));
    exit();
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$query = "SELECT id, role FROM users WHERE token = :token";
$stmt = $db->prepare($query);
$stmt->bindParam(":token", $token);
$stmt->execute();

if($stmt->rowCount() === 0) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid token."));
    exit();
}

$user = $stmt->fetch(PDO::FETCH_ASSOC);

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get single assignment with course info
            $query = "SELECT a.*, c.title as course_title, u.email as teacher_email 
                     FROM assignments a 
                     JOIN courses c ON a.course_id = c.id 
                     JOIN users u ON c.teacher_id = u.id 
                     WHERE a.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $_GET['id']);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                http_response_code(200);
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Assignment not found."));
            }
        } else if(isset($_GET['course_id'])) {
            // Get all assignments for a course
            $query = "SELECT a.*, c.title as course_title, u.email as teacher_email 
                     FROM assignments a 
                     JOIN courses c ON a.course_id = c.id 
                     JOIN users u ON c.teacher_id = u.id 
                     WHERE a.course_id = :course_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":course_id", $_GET['course_id']);
            $stmt->execute();
            
            $assignments = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($assignments, $row);
            }
            
            http_response_code(200);
            echo json_encode($assignments);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Please provide either assignment id or course id."));
        }
        break;
        
    case 'POST':
        // Only teachers and admins can create assignments
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can create assignments."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->course_id) && !empty($data->title) && !empty($data->due_date)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT teacher_id FROM courses WHERE id = :course_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":course_id", $data->course_id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $course = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $course['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only create assignments for your own courses."));
                    exit();
                }
                
                $query = "INSERT INTO assignments (course_id, title, description, due_date) 
                         VALUES (:course_id, :title, :description, :due_date)";
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":course_id", $data->course_id);
                $stmt->bindParam(":title", $data->title);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":due_date", $data->due_date);
                
                if($stmt->execute()) {
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "Assignment created successfully.",
                        "id" => $db->lastInsertId()
                    ));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to create assignment."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Course not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create assignment. Data is incomplete."));
        }
        break;
        
    case 'PUT':
        // Only teachers and admins can update assignments
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can update assignments."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT a.*, c.teacher_id 
                         FROM assignments a 
                         JOIN courses c ON a.course_id = c.id 
                         WHERE a.id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $data->id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $assignment = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $assignment['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only update assignments for your own courses."));
                    exit();
                }
                
                $query = "UPDATE assignments SET title = :title, description = :description, due_date = :due_date 
                         WHERE id = :id";
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":id", $data->id);
                $stmt->bindParam(":title", $data->title);
                $stmt->bindParam(":description", $data->description);
                $stmt->bindParam(":due_date", $data->due_date);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Assignment updated successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update assignment."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Assignment not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update assignment. Data is incomplete."));
        }
        break;
        
    case 'DELETE':
        // Only teachers and admins can delete assignments
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can delete assignments."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT a.*, c.teacher_id 
                         FROM assignments a 
                         JOIN courses c ON a.course_id = c.id 
                         WHERE a.id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $data->id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $assignment = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $assignment['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only delete assignments for your own courses."));
                    exit();
                }
                
                $query = "DELETE FROM assignments WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Assignment deleted successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to delete assignment."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Assignment not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete assignment. Data is incomplete."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 
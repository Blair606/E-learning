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
            // Get single course with teacher info
            $query = "SELECT c.*, u.email as teacher_email 
                     FROM courses c 
                     JOIN users u ON c.teacher_id = u.id 
                     WHERE c.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $_GET['id']);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                http_response_code(200);
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Course not found."));
            }
        } else {
            // Get all courses with teacher info
            $query = "SELECT c.*, u.email as teacher_email 
                     FROM courses c 
                     JOIN users u ON c.teacher_id = u.id";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $courses = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($courses, $row);
            }
            
            http_response_code(200);
            echo json_encode($courses);
        }
        break;
        
    case 'POST':
        // Only teachers and admins can create courses
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can create courses."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->title)) {
            $query = "INSERT INTO courses (title, description, teacher_id) VALUES (:title, :description, :teacher_id)";
            $stmt = $db->prepare($query);
            
            $teacher_id = $user['role'] === 'admin' ? $data->teacher_id : $user['id'];
            
            $stmt->bindParam(":title", $data->title);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":teacher_id", $teacher_id);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "message" => "Course created successfully.",
                    "id" => $db->lastInsertId()
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create course."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create course. Data is incomplete."));
        }
        break;
        
    case 'PUT':
        // Only teachers and admins can update courses
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can update courses."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT teacher_id FROM courses WHERE id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $data->id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $course = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $course['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only update your own courses."));
                    exit();
                }
                
                $query = "UPDATE courses SET title = :title, description = :description";
                if($user['role'] === 'admin' && !empty($data->teacher_id)) {
                    $query .= ", teacher_id = :teacher_id";
                }
                $query .= " WHERE id = :id";
                
                $stmt = $db->prepare($query);
                $params = array(
                    ":id" => $data->id,
                    ":title" => $data->title,
                    ":description" => $data->description
                );
                
                if($user['role'] === 'admin' && !empty($data->teacher_id)) {
                    $params[":teacher_id"] = $data->teacher_id;
                }
                
                if($stmt->execute($params)) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Course updated successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update course."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Course not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update course. Data is incomplete."));
        }
        break;
        
    case 'DELETE':
        // Only teachers and admins can delete courses
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can delete courses."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT teacher_id FROM courses WHERE id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $data->id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $course = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $course['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only delete your own courses."));
                    exit();
                }
                
                $query = "DELETE FROM courses WHERE id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(":id", $data->id);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Course deleted successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to delete course."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Course not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete course. Data is incomplete."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 
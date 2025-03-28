<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
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
        if(isset($_GET['course_id'])) {
            // Get enrollments for a specific course
            $query = "SELECT e.*, u.email as student_email 
                     FROM enrollments e 
                     JOIN users u ON e.student_id = u.id 
                     WHERE e.course_id = :course_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":course_id", $_GET['course_id']);
            $stmt->execute();
            
            $enrollments = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($enrollments, $row);
            }
            
            http_response_code(200);
            echo json_encode($enrollments);
        } else if(isset($_GET['student_id'])) {
            // Get enrollments for a specific student
            $query = "SELECT e.*, c.title as course_title, u.email as teacher_email 
                     FROM enrollments e 
                     JOIN courses c ON e.course_id = c.id 
                     JOIN users u ON c.teacher_id = u.id 
                     WHERE e.student_id = :student_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $_GET['student_id']);
            $stmt->execute();
            
            $enrollments = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($enrollments, $row);
            }
            
            http_response_code(200);
            echo json_encode($enrollments);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Please provide either course_id or student_id."));
        }
        break;
        
    case 'POST':
        // Only students can enroll in courses
        if($user['role'] !== 'student') {
            http_response_code(403);
            echo json_encode(array("message" => "Only students can enroll in courses."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->course_id)) {
            // Check if already enrolled
            $checkQuery = "SELECT id FROM enrollments WHERE student_id = :student_id AND course_id = :course_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":student_id", $user['id']);
            $checkStmt->bindParam(":course_id", $data->course_id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                http_response_code(400);
                echo json_encode(array("message" => "Already enrolled in this course."));
                exit();
            }
            
            // Check if course exists
            $courseQuery = "SELECT id FROM courses WHERE id = :course_id";
            $courseStmt = $db->prepare($courseQuery);
            $courseStmt->bindParam(":course_id", $data->course_id);
            $courseStmt->execute();
            
            if($courseStmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(array("message" => "Course not found."));
                exit();
            }
            
            $query = "INSERT INTO enrollments (student_id, course_id) VALUES (:student_id, :course_id)";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":student_id", $user['id']);
            $stmt->bindParam(":course_id", $data->course_id);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "message" => "Successfully enrolled in course.",
                    "id" => $db->lastInsertId()
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to enroll in course."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to enroll. Course ID is required."));
        }
        break;
        
    case 'DELETE':
        // Only students can unenroll from courses
        if($user['role'] !== 'student') {
            http_response_code(403);
            echo json_encode(array("message" => "Only students can unenroll from courses."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->course_id)) {
            $query = "DELETE FROM enrollments WHERE student_id = :student_id AND course_id = :course_id";
            $stmt = $db->prepare($query);
            
            $stmt->bindParam(":student_id", $user['id']);
            $stmt->bindParam(":course_id", $data->course_id);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Successfully unenrolled from course."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to unenroll from course."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to unenroll. Course ID is required."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 
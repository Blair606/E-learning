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
        if(isset($_GET['assignment_id'])) {
            // Get grades for a specific assignment
            $query = "SELECT g.*, u.email as student_email, a.title as assignment_title 
                     FROM grades g 
                     JOIN users u ON g.student_id = u.id 
                     JOIN assignments a ON g.assignment_id = a.id 
                     WHERE g.assignment_id = :assignment_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":assignment_id", $_GET['assignment_id']);
            $stmt->execute();
            
            $grades = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($grades, $row);
            }
            
            http_response_code(200);
            echo json_encode($grades);
        } else if(isset($_GET['student_id'])) {
            // Get grades for a specific student
            $query = "SELECT g.*, a.title as assignment_title, c.title as course_title 
                     FROM grades g 
                     JOIN assignments a ON g.assignment_id = a.id 
                     JOIN courses c ON a.course_id = c.id 
                     WHERE g.student_id = :student_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":student_id", $_GET['student_id']);
            $stmt->execute();
            
            $grades = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($grades, $row);
            }
            
            http_response_code(200);
            echo json_encode($grades);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Please provide either assignment_id or student_id."));
        }
        break;
        
    case 'POST':
        // Only teachers and admins can create grades
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can create grades."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->student_id) && !empty($data->assignment_id) && isset($data->score)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT a.*, c.teacher_id 
                         FROM assignments a 
                         JOIN courses c ON a.course_id = c.id 
                         WHERE a.id = :assignment_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":assignment_id", $data->assignment_id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $assignment = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $assignment['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only grade assignments for your own courses."));
                    exit();
                }
                
                // Check if grade already exists
                $gradeCheckQuery = "SELECT id FROM grades WHERE student_id = :student_id AND assignment_id = :assignment_id";
                $gradeCheckStmt = $db->prepare($gradeCheckQuery);
                $gradeCheckStmt->bindParam(":student_id", $data->student_id);
                $gradeCheckStmt->bindParam(":assignment_id", $data->assignment_id);
                $gradeCheckStmt->execute();
                
                if($gradeCheckStmt->rowCount() > 0) {
                    http_response_code(400);
                    echo json_encode(array("message" => "Grade already exists for this student and assignment."));
                    exit();
                }
                
                $query = "INSERT INTO grades (student_id, assignment_id, score, feedback) 
                         VALUES (:student_id, :assignment_id, :score, :feedback)";
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":student_id", $data->student_id);
                $stmt->bindParam(":assignment_id", $data->assignment_id);
                $stmt->bindParam(":score", $data->score);
                $stmt->bindParam(":feedback", $data->feedback);
                
                if($stmt->execute()) {
                    http_response_code(201);
                    echo json_encode(array(
                        "message" => "Grade created successfully.",
                        "id" => $db->lastInsertId()
                    ));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to create grade."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Assignment not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create grade. Data is incomplete."));
        }
        break;
        
    case 'PUT':
        // Only teachers and admins can update grades
        if($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("message" => "Only teachers and admins can update grades."));
            exit();
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id) && isset($data->score)) {
            // Check if user is the teacher of the course or admin
            $checkQuery = "SELECT g.*, a.course_id, c.teacher_id 
                         FROM grades g 
                         JOIN assignments a ON g.assignment_id = a.id 
                         JOIN courses c ON a.course_id = c.id 
                         WHERE g.id = :id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $data->id);
            $checkStmt->execute();
            
            if($checkStmt->rowCount() > 0) {
                $grade = $checkStmt->fetch(PDO::FETCH_ASSOC);
                if($user['role'] !== 'admin' && $grade['teacher_id'] !== $user['id']) {
                    http_response_code(403);
                    echo json_encode(array("message" => "You can only update grades for your own courses."));
                    exit();
                }
                
                $query = "UPDATE grades SET score = :score, feedback = :feedback WHERE id = :id";
                $stmt = $db->prepare($query);
                
                $stmt->bindParam(":id", $data->id);
                $stmt->bindParam(":score", $data->score);
                $stmt->bindParam(":feedback", $data->feedback);
                
                if($stmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Grade updated successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Unable to update grade."));
                }
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Grade not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update grade. Data is incomplete."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 
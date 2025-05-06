<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../database/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (
    !empty($data->course_id) &&
    !empty($data->student_id) &&
    !empty($data->enrollment_date)
) {
    try {
        // First check if the student is already enrolled
        $check_query = "SELECT id FROM enrollments WHERE course_id = :course_id AND student_id = :student_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":course_id", $data->course_id);
        $check_stmt->bindParam(":student_id", $data->student_id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            // Student is already enrolled
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Student is already enrolled in this course"
            ));
            exit();
        }

        // Insert enrollment record
        $query = "INSERT INTO enrollments (course_id, student_id, enrollment_date, status) 
                 VALUES (:course_id, :student_id, :enrollment_date, 'active')";
        
        $stmt = $db->prepare($query);
        
        // Sanitize and bind values
        $course_id = htmlspecialchars(strip_tags($data->course_id));
        $student_id = htmlspecialchars(strip_tags($data->student_id));
        $enrollment_date = htmlspecialchars(strip_tags($data->enrollment_date));
        
        $stmt->bindParam(":course_id", $course_id);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->bindParam(":enrollment_date", $enrollment_date);
        
        if ($stmt->execute()) {
            // Set response code - 201 created
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Successfully enrolled in course"
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to enroll in course"
            ));
        }
    } catch (PDOException $e) {
        // Set response code - 500 internal server error
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ));
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to enroll in course. Data is incomplete."
    ));
}
?> 
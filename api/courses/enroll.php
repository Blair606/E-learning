<?php
// Include CORS logic
require_once '../cors.php';

header("Content-Type: application/json; charset=UTF-8");

// Include database and object files
include_once '../database/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure data is not empty
if (!empty($data->course_id) && !empty($data->student_id)) {
    try {
        // First check if the student is already enrolled
        $check_query = "SELECT id FROM enrollments WHERE course_id = :course_id AND student_id = :student_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":course_id", $data->course_id);
        $check_stmt->bindParam(":student_id", $data->student_id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Student is already enrolled in this course"
            ]);
            exit();
        }

        // Insert enrollment record
        $query = "INSERT INTO enrollments (course_id, student_id, enrolled_at, status) 
                 VALUES (:course_id, :student_id, :enrolled_at, 'active')";
        $stmt = $db->prepare($query);
        $course_id = htmlspecialchars(strip_tags($data->course_id));
        $student_id = htmlspecialchars(strip_tags($data->student_id));
        $enrolled_at = !empty($data->enrolled_at) ? htmlspecialchars(strip_tags($data->enrolled_at)) : date('Y-m-d H:i:s');
        $stmt->bindParam(":course_id", $course_id);
        $stmt->bindParam(":student_id", $student_id);
        $stmt->bindParam(":enrolled_at", $enrolled_at);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Successfully enrolled in course"
            ]);
        } else {
            http_response_code(503);
            echo json_encode([
                "success" => false,
                "message" => "Unable to enroll in course"
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Unable to enroll in course. Data is incomplete."
    ]);
}
?> 
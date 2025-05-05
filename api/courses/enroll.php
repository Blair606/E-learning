<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../config/database.php';
include_once '../objects/course.php';
include_once '../middleware/auth.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Initialize course object
$course = new Course($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Make sure course_id and student_id are not empty
if (!empty($data->course_id) && !empty($data->student_id)) {
    // Set course property values
    $course->id = $data->course_id;
    $course->student_id = $data->student_id;

    // Create the enrollment
    if ($course->enroll()) {
        // Set response code - 201 created
        http_response_code(201);

        // Tell the user
        echo json_encode(array(
            "success" => true,
            "message" => "Successfully enrolled in course."
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);

        // Tell the user
        echo json_encode(array(
            "success" => false,
            "message" => "Unable to enroll in course."
        ));
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);

    // Tell the user
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to enroll in course. Data is incomplete."
    ));
}
?> 
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
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

// Get course ID from URL
$course_id = isset($_GET['id']) ? $_GET['id'] : die();

// Set course ID
$course->id = $course_id;

// Get course content
$content = $course->getContent();

if ($content) {
    // Set response code - 200 OK
    http_response_code(200);

    // Tell the user
    echo json_encode(array(
        "success" => true,
        "data" => $content
    ));
} else {
    // Set response code - 404 Not found
    http_response_code(404);

    // Tell the user
    echo json_encode(array(
        "success" => false,
        "message" => "Course content not found."
    ));
}
?> 
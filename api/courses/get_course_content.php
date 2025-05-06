<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and object files
include_once '../database/database.php';
include_once '../objects/course.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database connection failed"
    ));
    exit();
}

// Initialize course object
$course = new Course($db);

// Get course ID from URL
if (!isset($_GET['id'])) {
    // Set response code - 400 Bad Request
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Course ID is required"
    ));
    exit();
}

$course->id = $_GET['id'];

try {
    // First check if the course exists
    $check_query = "SELECT id FROM courses WHERE id = :course_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(":course_id", $course->id);
    $check_stmt->execute();

    if ($check_stmt->rowCount() == 0) {
        throw new Exception("Course with ID {$course->id} not found");
    }

    // Get course content
    $stmt = $course->getContent();
    
    if (!$stmt) {
        throw new Exception("Failed to prepare statement");
    }
    
    $num = $stmt->rowCount();

    if ($num > 0) {
        // Content array
        $content_arr = array();
        $content_arr["success"] = true;
        $content_arr["data"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $content_item = array(
                "id" => $row['id'],
                "course_id" => $row['course_id'],
                "title" => $row['title'],
                "content" => $row['content'],
                "created_at" => $row['created_at'],
                "updated_at" => $row['updated_at']
            );

            array_push($content_arr["data"], $content_item);
        }

        // Set response code - 200 OK
        http_response_code(200);

        // Show content data in JSON format
        echo json_encode($content_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);

        // Tell the user no content found
        echo json_encode(array(
            "success" => false,
            "message" => "No content found for course ID: " . $course->id
        ));
    }
} catch (Exception $e) {
    // Set response code - 500 Internal Server Error
    http_response_code(500);

    // Tell the user about the error
    echo json_encode(array(
        "success" => false,
        "message" => "Error retrieving course content: " . $e->getMessage(),
        "course_id" => $course->id,
        "debug_info" => array(
            "error_type" => get_class($e),
            "error_code" => $e->getCode(),
            "error_file" => $e->getFile(),
            "error_line" => $e->getLine()
        )
    ));
}
?> 
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
    !empty($data->user_id) &&
    !empty($data->title) &&
    !empty($data->message)
) {
    try {
        // Insert notification record
        $query = "INSERT INTO notifications (user_id, title, message, type, is_read) 
                 VALUES (:user_id, :title, :message, :type, false)";
        
        $stmt = $db->prepare($query);
        
        // Sanitize and bind values
        $user_id = htmlspecialchars(strip_tags($data->user_id));
        $title = htmlspecialchars(strip_tags($data->title));
        $message = htmlspecialchars(strip_tags($data->message));
        $type = isset($data->type) ? htmlspecialchars(strip_tags($data->type)) : 'info';
        
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":message", $message);
        $stmt->bindParam(":type", $type);
        
        if ($stmt->execute()) {
            // Set response code - 201 created
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Notification created successfully"
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to create notification"
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
        "message" => "Unable to create notification. Data is incomplete."
    ));
}
?> 
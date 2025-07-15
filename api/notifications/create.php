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
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Notification created successfully"
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to create notification"
            ));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "message" => "Unable to create notification. Data is incomplete."
    ));
}
?> 
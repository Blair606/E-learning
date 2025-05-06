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
if (!empty($data->notification_id)) {
    try {
        // Update notification record
        $query = "UPDATE notifications SET is_read = true WHERE id = :notification_id";
        
        $stmt = $db->prepare($query);
        
        // Sanitize and bind values
        $notification_id = htmlspecialchars(strip_tags($data->notification_id));
        $stmt->bindParam(":notification_id", $notification_id);
        
        if ($stmt->execute()) {
            // Set response code - 200 OK
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Notification marked as read"
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to mark notification as read"
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
        "message" => "Unable to mark notification as read. Notification ID is required."
    ));
}
?> 
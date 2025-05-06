<?php
// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database and object files
include_once '../database/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get user ID from query parameter
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

try {
    // Query to get notifications
    $query = "SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();

    // Check if any notifications found
    if ($stmt->rowCount() > 0) {
        // Notifications array
        $notifications_arr = array();
        $notifications_arr["success"] = true;
        $notifications_arr["data"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);

            $notification_item = array(
                "id" => $id,
                "user_id" => $user_id,
                "title" => $title,
                "message" => $message,
                "type" => $type,
                "is_read" => (bool)$is_read,
                "created_at" => $created_at,
                "updated_at" => $updated_at
            );

            array_push($notifications_arr["data"], $notification_item);
        }

        // Set response code - 200 OK
        http_response_code(200);
        echo json_encode($notifications_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => array(),
            "message" => "No notifications found."
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
?> 
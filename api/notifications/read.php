<?php
require_once __DIR__ . '/../config/database.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Get user ID from query parameter
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

try {
    $db = getConnection();
    $query = "SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $notifications_arr = array();
        $notifications_arr["success"] = true;
        $notifications_arr["data"] = array();

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $notification_item = array(
                "id" => $row['id'],
                "user_id" => $row['user_id'],
                "title" => $row['title'],
                "message" => $row['message'],
                "type" => $row['type'],
                "is_read" => (bool)$row['is_read'],
                "created_at" => $row['created_at'],
                "updated_at" => $row['updated_at'],
                "time" => date('M d, Y H:i', strtotime($row['created_at']))
            );
            array_push($notifications_arr["data"], $notification_item);
        }
        http_response_code(200);
        echo json_encode($notifications_arr);
    } else {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "data" => array(),
            "message" => "No notifications found."
        ));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ));
}
?> 
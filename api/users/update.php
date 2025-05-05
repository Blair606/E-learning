<?php
// Include CORS headers
require_once '../cors.php';

// Include database connection
require_once '../config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is not empty
if (
    !empty($data->id) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email)
) {
    try {
        // Get database connection
        $conn = getConnection();

        // Prepare update query
        $query = "UPDATE users 
                 SET first_name = :first_name,
                     last_name = :last_name,
                     email = :email,
                     phone = :phone,
                     address = :address,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id";

        $stmt = $conn->prepare($query);

        // Sanitize and bind values
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":first_name", $data->first_name);
        $stmt->bindParam(":last_name", $data->last_name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":address", $data->address);

        // Execute the query
        if ($stmt->execute()) {
            // Set response code - 200 OK
            http_response_code(200);
            echo json_encode(array("message" => "User was updated successfully."));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update user."));
        }
    } catch (PDOException $e) {
        // Set response code - 500 Internal Server Error
        http_response_code(500);
        echo json_encode(array("message" => "Database error: " . $e->getMessage()));
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update user. Data is incomplete."));
}
?> 
<?php
require_once __DIR__ . '/../config/cors.php';
if (function_exists('handleCORS')) { handleCORS(); }

// Include database connection
require_once '../config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if user ID is provided
if (!empty($data->id)) {
    try {
        // Get database connection
        $conn = getConnection();

        // Prepare update query
        $updateData = [];
        $params = [];

        // Only include fields that are present in the request
        if (isset($data->first_name)) {
            $updateData[] = "first_name = :first_name";
            $params[':first_name'] = $data->first_name;
        }
        if (isset($data->last_name)) {
            $updateData[] = "last_name = :last_name";
            $params[':last_name'] = $data->last_name;
        }
        if (isset($data->email)) {
            $updateData[] = "email = :email";
            $params[':email'] = $data->email;
        }
        if (isset($data->phone)) {
            $updateData[] = "phone = :phone";
            $params[':phone'] = $data->phone;
        }
        if (isset($data->address)) {
            $updateData[] = "address = :address";
            $params[':address'] = $data->address;
        }

        // Only proceed if there are fields to update
        if (count($updateData) > 0) {
            // Add updated_at timestamp
            $updateData[] = "updated_at = CURRENT_TIMESTAMP";

            // Build the query
            $query = "UPDATE users SET " . implode(", ", $updateData) . " WHERE id = :id";
            $stmt = $conn->prepare($query);

            // Bind the ID parameter
            $stmt->bindParam(":id", $data->id);

            // Bind all other parameters
            foreach ($params as $key => $value) {
                $stmt->bindParam($key, $value);
            }

            // Execute the query
            if ($stmt->execute()) {
                // Set response code - 200 OK
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "message" => "User was updated successfully."
                ));
            } else {
                // Set response code - 503 service unavailable
                http_response_code(503);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Unable to update user."
                ));
            }
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to update user."
            ));
        }
    } catch (PDOException $e) {
        // Set response code - 500 Internal Server Error
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
        "message" => "User ID is required for update."
    ));
}
?> 
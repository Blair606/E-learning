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
if (!empty($data->enrollment_id) && !empty($data->status)) {
    try {
        // Validate status
        $valid_statuses = array('active', 'completed', 'dropped');
        if (!in_array($data->status, $valid_statuses)) {
            throw new Exception("Invalid status. Must be one of: " . implode(", ", $valid_statuses));
        }

        // Update enrollment record
        $query = "UPDATE enrollments SET status = :status, completed_at = :completed_at WHERE id = :enrollment_id";
        
        $stmt = $db->prepare($query);
        
        // Sanitize and bind values
        $enrollment_id = htmlspecialchars(strip_tags($data->enrollment_id));
        $status = htmlspecialchars(strip_tags($data->status));
        $completed_at = $status === 'completed' ? date('Y-m-d H:i:s') : null;
        
        $stmt->bindParam(":enrollment_id", $enrollment_id);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":completed_at", $completed_at);
        
        if ($stmt->execute()) {
            // Set response code - 200 OK
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Enrollment status updated successfully"
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            echo json_encode(array(
                "success" => false,
                "message" => "Unable to update enrollment status"
            ));
        }
    } catch (Exception $e) {
        // Set response code - 400 bad request
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => $e->getMessage()
        ));
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
        "message" => "Unable to update enrollment status. Enrollment ID and status are required."
    ));
}
?> 
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../config/database.php';
require_once '../config/cors.php';

handleCORS();

try {
    // Get database connection
    $conn = getConnection();
    if (!$conn) {
        throw new Exception('Failed to connect to database');
    }

    $query = "SELECT id, email, first_name, last_name, role, status, phone, address, 
                     created_at, updated_at
              FROM users 
              WHERE id = :user_id AND role = 'student'";

    $stmt = $conn->prepare($query);
    
    // Get user_id from query parameters
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();
    
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $row
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Student not found."
        ]);
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?> 
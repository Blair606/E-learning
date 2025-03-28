<?php
require_once '../config/database.php';
require_once '../config/cors.php';

// Handle CORS
handleCORS();

header('Content-Type: application/json');

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$headers = getallheaders();

if(isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    
    // Clear token from database
    $query = "UPDATE users SET token = NULL WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":token", $token);
    
    if($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Successfully logged out."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to logout."));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "No token provided."));
}
?> 
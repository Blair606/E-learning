<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
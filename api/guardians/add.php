<?php
// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: POST, OPTIONS");
    }
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    
    // Cache preflight response for 1 hour
    header("Access-Control-Max-Age: 3600");
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/Database.php';
include_once '../models/Guardian.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Instantiate guardian object
$guardian = new Guardian($db);

// Get raw posted data
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->phone_number) &&
    !empty($data->national_id) &&
    !empty($data->student_id)
) {
    // Set guardian properties
    $guardian->first_name = $data->first_name;
    $guardian->last_name = $data->last_name;
    $guardian->email = $data->email;
    $guardian->phone_number = $data->phone_number;
    $guardian->national_id = $data->national_id;
    $guardian->student_id = $data->student_id;
    
    // Create guardian
    if ($guardian->create()) {
        http_response_code(201);
        echo json_encode(array(
            'status' => 'success',
            'message' => 'Guardian created successfully'
        ));
    } else {
        http_response_code(503);
        echo json_encode(array(
            'status' => 'error',
            'message' => 'Unable to create guardian'
        ));
    }
} else {
    http_response_code(400);
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Missing required fields'
    ));
}

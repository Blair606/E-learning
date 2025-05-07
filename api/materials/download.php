<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';
include_once '../models/Material.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Instantiate material object
$material = new Material($db);

// Get ID from URL
$id = isset($_GET['id']) ? $_GET['id'] : die();

// Get material
$material->id = $id;
$material_data = $material->read_single();

if($material_data) {
    $file_path = $material_data['file_url'];
    
    if(file_exists($file_path)) {
        // Set headers
        header('Content-Type: ' . mime_content_type($file_path));
        header('Content-Disposition: attachment; filename="' . basename($file_path) . '"');
        header('Content-Length: ' . filesize($file_path));
        header('Pragma: public');
        
        // Clear system output buffer
        flush();
        
        // Read the file
        readfile($file_path);
        exit;
    } else {
        // File not found
        http_response_code(404);
        echo json_encode(array(
            'status' => 'error',
            'message' => 'File not found'
        ));
    }
} else {
    // Material not found
    http_response_code(404);
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Material not found'
    ));
}

<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../config/Database.php';
include_once '../models/Material.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Instantiate material object
$material = new Material($db);

// Get class ID from URL
$class_id = isset($_GET['class_id']) ? $_GET['class_id'] : null;
if (!$class_id) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Class ID is required.'
    ]);
    exit;
}

// Get materials
$result = $material->getMaterialsByClassId($class_id);

// Get row count
$num = $result->rowCount();

// Check if any materials
if($num > 0) {
    // Materials array
    $materials_arr = array();
    $materials_arr['status'] = 'success';
    $materials_arr['materials'] = array();

    while($row = $result->fetch(PDO::FETCH_ASSOC)) {
        extract($row);

        $material_item = array(
            'id' => $id,
            'class_id' => $class_id,
            'title' => $title,
            'description' => $description,
            'file_url' => $file_url,
            'file_type' => $file_type,
            'file_size' => $file_size,
            'uploader_id' => $uploader_id,
            'material_type' => $material_type,
            'created_at' => $created_at,
            'updated_at' => $updated_at
        );

        // Push to "data"
        array_push($materials_arr['materials'], $material_item);
    }

    // Turn to JSON & output
    echo json_encode($materials_arr);
} else {
    // No Materials
    echo json_encode(
        array(
            'status' => 'success',
            'materials' => array(),
            'message' => 'No materials found for this class.'
        )
    );
}

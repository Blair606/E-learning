<?php
require_once '../config/database.php';
require_once '../utils/ApiResponse.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

$database = new Database();
$db = $database->connect();
$response = new ApiResponse();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->name) || empty($data->name)) {
        $response->error("School name is required");
        exit();
    }

    try {
        $query = "INSERT INTO schools (name, address, contact_email, contact_phone) VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data->name,
            $data->address ?? null,
            $data->contact_email ?? null,
            $data->contact_phone ?? null
        ]);

        $school_id = $db->lastInsertId();
        
        // If departments are provided, create them
        if (isset($data->departments) && is_array($data->departments)) {
            $dept_query = "INSERT INTO departments (name, code, description, status) VALUES (?, ?, ?, 'active')";
            $dept_stmt = $db->prepare($dept_query);
            
            $relationship_query = "INSERT INTO school_departments (school_id, department_id) VALUES (?, ?)";
            $relationship_stmt = $db->prepare($relationship_query);
            
            foreach ($data->departments as $dept) {
                if (!isset($dept->name) || empty($dept->name)) continue;
                
                // Create department
                $dept_stmt->execute([
                    $dept->name,
                    $dept->code,
                    $dept->description ?? null
                ]);
                
                $department_id = $db->lastInsertId();
                
                // Create the school-department relationship
                $relationship_stmt->execute([$school_id, $department_id]);
            }
        }

        $response->success("School and departments created successfully", [
            "school_id" => $school_id
        ]);
    } catch (PDOException $e) {
        $response->error("Database error: " . $e->getMessage());
    }
} else {
    $response->error("Invalid request method");
}

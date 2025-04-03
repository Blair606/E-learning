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

    if (!isset($data->school_id) || !isset($data->name) || empty($data->name)) {
        $response->error("School ID and department name are required");
        exit();
    }

    try {
        // First verify that the school exists
        $check_school = "SELECT id FROM schools WHERE id = ?";
        $check_stmt = $db->prepare($check_school);
        $check_stmt->execute([$data->school_id]);
        
        if ($check_stmt->rowCount() === 0) {
            $response->error("School not found");
            exit();
        }

        $query = "INSERT INTO departments (school_id, name, description, head_of_department) VALUES (?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data->school_id,
            $data->name,
            $data->description ?? null,
            $data->head_of_department ?? null
        ]);

        $department_id = $db->lastInsertId();
        
        // If courses are provided, create them
        if (isset($data->courses) && is_array($data->courses)) {
            $course_query = "INSERT INTO courses (department_id, code, name, description, credits) VALUES (?, ?, ?, ?, ?)";
            $course_stmt = $db->prepare($course_query);
            
            foreach ($data->courses as $course) {
                if (!isset($course->name) || !isset($course->code) || !isset($course->credits)) continue;
                
                $course_stmt->execute([
                    $department_id,
                    $course->code,
                    $course->name,
                    $course->description ?? null,
                    $course->credits
                ]);
            }
        }

        $response->success("Department and courses created successfully", [
            "department_id" => $department_id
        ]);
    } catch (PDOException $e) {
        $response->error("Database error: " . $e->getMessage());
    }
} else {
    $response->error("Invalid request method");
}

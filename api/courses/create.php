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

    if (!isset($data->department_id) || !isset($data->code) || !isset($data->name) || !isset($data->credits)) {
        $response->error("Department ID, course code, name, and credits are required");
        exit();
    }

    try {
        // First verify that the department exists
        $check_dept = "SELECT id FROM departments WHERE id = ?";
        $check_stmt = $db->prepare($check_dept);
        $check_stmt->execute([$data->department_id]);
        
        if ($check_stmt->rowCount() === 0) {
            $response->error("Department not found");
            exit();
        }

        $query = "INSERT INTO courses (department_id, code, name, description, credits) VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            $data->department_id,
            $data->code,
            $data->name,
            $data->description ?? null,
            $data->credits
        ]);

        $course_id = $db->lastInsertId();

        $response->success("Course created successfully", [
            "course_id" => $course_id
        ]);
    } catch (PDOException $e) {
        $response->error("Database error: " . $e->getMessage());
    }
} else {
    $response->error("Invalid request method");
}

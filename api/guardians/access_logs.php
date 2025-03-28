<?php
require_once '../config/cors.php';
require_once '../config/database.php';

header('Content-Type: application/json');

try {
    // Get request method
    $method = $_SERVER['REQUEST_METHOD'];

    // Get database connection
    $conn = getConnection();

    switch ($method) {
        case 'GET':
            // Get guardian_id and student_id from query parameters
            $guardian_id = isset($_GET['guardian_id']) ? $_GET['guardian_id'] : null;
            $student_id = isset($_GET['student_id']) ? $_GET['student_id'] : null;

            if (!$guardian_id || !$student_id) {
                throw new Exception('Guardian ID and Student ID are required');
            }

            // Prepare the SQL query to get access logs
            $query = "SELECT * FROM guardian_access_logs 
                     WHERE guardian_id = :guardian_id 
                     AND student_id = :student_id 
                     ORDER BY access_time DESC";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':guardian_id', $guardian_id);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->execute();

            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                'status' => 'success',
                'data' => $logs
            ));
            break;

        case 'POST':
            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['guardian_id']) || !isset($data['student_id']) || !isset($data['action'])) {
                throw new Exception('Guardian ID, Student ID, and Action are required');
            }

            // Get IP address
            $ip_address = $_SERVER['REMOTE_ADDR'];

            // Prepare the SQL query to insert access log
            $query = "INSERT INTO guardian_access_logs (guardian_id, student_id, ip_address, action) 
                     VALUES (:guardian_id, :student_id, :ip_address, :action)";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':guardian_id', $data['guardian_id']);
            $stmt->bindParam(':student_id', $data['student_id']);
            $stmt->bindParam(':ip_address', $ip_address);
            $stmt->bindParam(':action', $data['action']);
            $stmt->execute();

            echo json_encode(array(
                'status' => 'success',
                'message' => 'Access log created successfully'
            ));
            break;

        default:
            throw new Exception('Method not allowed');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'status' => 'error',
        'message' => $e->getMessage()
    ));
}
?> 
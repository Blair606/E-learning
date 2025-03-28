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

            // Prepare the SQL query to get consent records
            $query = "SELECT * FROM guardian_consent 
                     WHERE guardian_id = :guardian_id 
                     AND student_id = :student_id";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':guardian_id', $guardian_id);
            $stmt->bindParam(':student_id', $student_id);
            $stmt->execute();

            $consents = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(array(
                'status' => 'success',
                'data' => $consents
            ));
            break;

        case 'POST':
            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['guardian_id']) || !isset($data['student_id']) || !isset($data['consent_type'])) {
                throw new Exception('Guardian ID, Student ID, and Consent Type are required');
            }

            // Prepare the SQL query to insert consent record
            $query = "INSERT INTO guardian_consent (guardian_id, student_id, consent_type, is_granted, granted_at) 
                     VALUES (:guardian_id, :student_id, :consent_type, :is_granted, NOW())";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':guardian_id', $data['guardian_id']);
            $stmt->bindParam(':student_id', $data['student_id']);
            $stmt->bindParam(':consent_type', $data['consent_type']);
            $stmt->bindParam(':is_granted', $data['is_granted'] ?? true);
            $stmt->execute();

            echo json_encode(array(
                'status' => 'success',
                'message' => 'Consent record created successfully'
            ));
            break;

        case 'PUT':
            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);

            if (!isset($data['id']) || !isset($data['is_granted'])) {
                throw new Exception('Consent ID and Grant Status are required');
            }

            // Prepare the SQL query to update consent record
            $query = "UPDATE guardian_consent 
                     SET is_granted = :is_granted, 
                         granted_at = CASE WHEN :is_granted = 1 THEN NOW() ELSE NULL END,
                         expires_at = CASE WHEN :is_granted = 1 THEN NULL ELSE NOW() END
                     WHERE id = :id";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':id', $data['id']);
            $stmt->bindParam(':is_granted', $data['is_granted']);
            $stmt->execute();

            echo json_encode(array(
                'status' => 'success',
                'message' => 'Consent record updated successfully'
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
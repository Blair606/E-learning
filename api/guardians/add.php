<?php
require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    header("Access-Control-Max-Age: 3600");
    exit(0);
}

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email) &&
    !empty($data->phone_number) &&
    !empty($data->national_id) &&
    !empty($data->student_id)
) {
    try {
        $conn = getConnection();
        // Check if user already exists
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $checkStmt->bindParam(':email', $data->email);
        $checkStmt->execute();
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Guardian with this email already exists']);
            exit;
        }
        // Use national_id as password
        $hashedPassword = password_hash($data->national_id, PASSWORD_BCRYPT);
        // Insert into users table with role 'parent' and status 'pending'
        $stmt = $conn->prepare("INSERT INTO users (email, password, first_name, last_name, role, status, phone, created_at, updated_at) VALUES (:email, :password, :first_name, :last_name, 'parent', 'pending', :phone, NOW(), NOW())");
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':first_name', $data->first_name);
        $stmt->bindParam(':last_name', $data->last_name);
        $stmt->bindParam(':phone', $data->phone_number);
        if (!$stmt->execute()) {
            throw new Exception('Failed to create guardian user');
        }
        $guardian_id = $conn->lastInsertId();
        // Optionally insert into guardians table for extra info
        $guardianStmt = $conn->prepare("INSERT INTO guardians (id, first_name, last_name, email, phone_number, national_id, status, created_at, updated_at) VALUES (:id, :first_name, :last_name, :email, :phone_number, :national_id, 'pending', NOW(), NOW())");
        $guardianStmt->bindParam(':id', $guardian_id);
        $guardianStmt->bindParam(':first_name', $data->first_name);
        $guardianStmt->bindParam(':last_name', $data->last_name);
        $guardianStmt->bindParam(':email', $data->email);
        $guardianStmt->bindParam(':phone_number', $data->phone_number);
        $guardianStmt->bindParam(':national_id', $data->national_id);
        $guardianStmt->execute();
        // Create guardian-student relationship
        $relStmt = $conn->prepare("INSERT INTO guardian_students (guardian_id, student_id, relationship, is_primary, created_at) VALUES (:guardian_id, :student_id, :relationship, :is_primary, NOW())");
        $relStmt->bindParam(':guardian_id', $guardian_id);
        $relStmt->bindParam(':student_id', $data->student_id);
        $relStmt->bindValue(':relationship', $data->relationship ?? 'parent');
        $relStmt->bindValue(':is_primary', $data->is_primary ?? 0);
        $relStmt->execute();
        http_response_code(201);
        echo json_encode(['status' => 'success', 'message' => 'Guardian created successfully, pending admin approval']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields'
    ]);
}

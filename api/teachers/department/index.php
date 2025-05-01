<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    // Get department ID from URL
    $departmentId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($departmentId <= 0) {
        throw new Exception('Invalid department ID');
    }

    // Log the request
    error_log("Fetching teachers for department ID: " . $departmentId);

    // Get database connection
    $pdo = getConnection();
    if (!$pdo) {
        throw new Exception('Failed to establish database connection');
    }

    // Debug: Check all users in the department
    $debugQuery = "SELECT id, first_name, last_name, role, department_id FROM users WHERE department_id = :department_id";
    $debugStmt = $pdo->prepare($debugQuery);
    $debugStmt->execute(['department_id' => $departmentId]);
    $allUsers = $debugStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("All users in department " . $departmentId . ": " . print_r($allUsers, true));

    // First, verify the department exists
    $deptQuery = "SELECT id FROM departments WHERE id = :department_id";
    $deptStmt = $pdo->prepare($deptQuery);
    $deptStmt->execute(['department_id' => $departmentId]);
    
    if (!$deptStmt->fetch()) {
        throw new Exception('Department not found');
    }

    // Modified query to get teachers directly from users table
    $query = "SELECT u.* 
              FROM users u 
              WHERE u.department_id = :department_id 
              AND u.role = 'teacher'";
    
    $stmt = $pdo->prepare($query);
    if (!$stmt) {
        throw new Exception('Failed to prepare query: ' . implode(', ', $pdo->errorInfo()));
    }

    $params = ['department_id' => $departmentId];
    error_log("Executing query with params: " . print_r($params, true));
    
    $result = $stmt->execute($params);
    if (!$result) {
        throw new Exception('Failed to execute query: ' . implode(', ', $stmt->errorInfo()));
    }

    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($teachers) . " teachers");

    // Log the teachers data for debugging
    error_log("Teachers data: " . print_r($teachers, true));

    echo json_encode([
        'success' => true,
        'data' => $teachers
    ]);

} catch (Exception $e) {
    error_log("Error in getTeachersByDepartment: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 
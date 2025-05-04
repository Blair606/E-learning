<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../middleware/AuthMiddleware.php';

header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    try {
        // Authenticate the request
        $authPayload = AuthMiddleware::authenticate();
        
        // Get the request body
        $rawData = file_get_contents('php://input');
        error_log("Received data: " . $rawData);
        
        $data = json_decode($rawData, true);
        
        if (!$data) {
            error_log("JSON decode error: " . json_last_error_msg());
            throw new Exception('Invalid request data');
        }

        error_log("Decoded data: " . print_r($data, true));

        // Validate required fields
        $requiredFields = ['name', 'code', 'description', 'school_id', 'department_id', 'instructor_id', 'credits'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                error_log("Missing required field: $field");
                throw new Exception("Missing required field: $field");
            }
        }

        // Get database connection
        $conn = getConnection();
        if (!$conn) {
            error_log("Failed to get database connection");
            throw new Exception('Database connection failed');
        }
        
        // Start transaction
        $conn->beginTransaction();

        // Validate school and department
        $schoolStmt = $conn->prepare("SELECT id FROM schools WHERE id = ?");
        if (!$schoolStmt) {
            error_log("Failed to prepare school statement: " . print_r($conn->errorInfo(), true));
            throw new Exception('Database error');
        }
        $schoolStmt->execute([$data['school_id']]);
        if ($schoolStmt->rowCount() === 0) {
            throw new Exception('Invalid school ID');
        }

        $deptStmt = $conn->prepare("SELECT id FROM departments WHERE id = ? AND school_id = ?");
        if (!$deptStmt) {
            error_log("Failed to prepare department statement: " . print_r($conn->errorInfo(), true));
            throw new Exception('Database error');
        }
        $deptStmt->execute([$data['department_id'], $data['school_id']]);
        if ($deptStmt->rowCount() === 0) {
            throw new Exception('Invalid department ID or department does not belong to the selected school');
        }

        // Validate instructor
        $instructorStmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND role = 'teacher'");
        if (!$instructorStmt) {
            error_log("Failed to prepare instructor statement: " . print_r($conn->errorInfo(), true));
            throw new Exception('Database error');
        }
        $instructorStmt->execute([$data['instructor_id']]);
        if ($instructorStmt->rowCount() === 0) {
            throw new Exception('Invalid instructor ID or user is not a teacher');
        }

        // Insert course
        $insertQuery = "INSERT INTO courses (
            name, code, description, school_id, department_id, 
            instructor_id, credits, schedule, prerequisites, status
        ) VALUES (
            :name, :code, :description, :school_id, :department_id,
            :instructor_id, :credits, :schedule, :prerequisites, :status
        )";

        $stmt = $conn->prepare($insertQuery);
        if (!$stmt) {
            error_log("Failed to prepare insert statement: " . print_r($conn->errorInfo(), true));
            throw new Exception('Database error');
        }
        
        // Convert schedule and prerequisites to JSON
        $schedule = isset($data['schedule']) ? json_encode($data['schedule']) : '[]';
        $prerequisites = isset($data['prerequisites']) ? json_encode($data['prerequisites']) : '[]';
        
        $stmt->bindValue(':name', $data['name']);
        $stmt->bindValue(':code', $data['code']);
        $stmt->bindValue(':description', $data['description']);
        $stmt->bindValue(':school_id', $data['school_id']);
        $stmt->bindValue(':department_id', $data['department_id']);
        $stmt->bindValue(':instructor_id', $data['instructor_id']);
        $stmt->bindValue(':credits', $data['credits']);
        $stmt->bindValue(':schedule', $schedule);
        $stmt->bindValue(':prerequisites', $prerequisites);
        $stmt->bindValue(':status', $data['status'] ?? 'active');

        if (!$stmt->execute()) {
            $error = $stmt->errorInfo();
            error_log("SQL Error: " . print_r($error, true));
            throw new Exception('Failed to create course: ' . $error[2]);
        }

        // Get the newly created course ID
        $courseId = $conn->lastInsertId();

        // Commit transaction
        $conn->commit();

        // Fetch the created course with related data
        $fetchQuery = "SELECT c.*, s.name as school_name, d.name as department_name, 
                              CONCAT(u.first_name, ' ', u.last_name) as instructor_name
                      FROM courses c
                      LEFT JOIN schools s ON c.school_id = s.id
                      LEFT JOIN departments d ON c.department_id = d.id
                      LEFT JOIN users u ON c.instructor_id = u.id
                      WHERE c.id = ?";
        
        $fetchStmt = $conn->prepare($fetchQuery);
        if (!$fetchStmt) {
            error_log("Failed to prepare fetch statement: " . print_r($conn->errorInfo(), true));
            throw new Exception('Database error');
        }
        $fetchStmt->execute([$courseId]);
        $course = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        // Return success response with course data
        echo json_encode([
            'success' => true,
            'message' => 'Course created successfully',
            'course' => $course
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn)) {
            $conn->rollBack();
        }
        
        error_log("Error creating course: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}
?> 
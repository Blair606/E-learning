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

if ($method === 'PUT') {
    try {
        // Authenticate the request
        $authPayload = AuthMiddleware::authenticate();
        
        // Get the request body
        $rawData = file_get_contents('php://input');
        error_log("Received data: " . $rawData);
        
        $data = json_decode($rawData, true);
        
        if (!$data) {
            throw new Exception('Invalid request data');
        }

        error_log("Decoded data: " . print_r($data, true));

        // Get database connection
        $conn = getConnection();
        
        // Start transaction
        $conn->beginTransaction();

        // Validate school and department
        if (isset($data['school_id'])) {
            $schoolStmt = $conn->prepare("SELECT id FROM schools WHERE id = ?");
            $schoolStmt->execute([$data['school_id']]);
            if ($schoolStmt->rowCount() === 0) {
                throw new Exception('Invalid school ID');
            }
        }

        if (isset($data['department_id'])) {
            $deptStmt = $conn->prepare("SELECT id FROM departments WHERE id = ? AND school_id = ?");
            $deptStmt->execute([$data['department_id'], $data['school_id']]);
            if ($deptStmt->rowCount() === 0) {
                throw new Exception('Invalid department ID or department does not belong to the selected school');
            }
        }

        // Get current user data to check for department changes
        $currentUserStmt = $conn->prepare("SELECT department_id FROM users WHERE id = ?");
        $currentUserStmt->execute([$data['id']]);
        $currentUser = $currentUserStmt->fetch(PDO::FETCH_ASSOC);
        $oldDepartmentId = $currentUser['department_id'] ?? null;

        // Safely get department_id and school_id from data
        $department_id = $data['department_id'] ?? null;
        $school_id = $data['school_id'] ?? null;

        // Update user table
        $userQuery = "UPDATE users SET 
            first_name = :first_name,
            last_name = :last_name,
            email = :email,
            phone = :phone,
            address = :address,
            school = :school,
            department = :department,
            specialization = :specialization,
            education = :education,
            experience = :experience,
            updated_at = CURRENT_TIMESTAMP";
        if ($school_id !== null) {
            $userQuery .= ", school_id = :school_id";
        }
        if ($department_id !== null) {
            $userQuery .= ", department_id = :department_id";
        }
        $userQuery .= " WHERE id = :id AND role = 'teacher'";

        $userStmt = $conn->prepare($userQuery);
        $userStmt->bindParam(':first_name', $data['first_name']);
        $userStmt->bindParam(':last_name', $data['last_name']);
        $userStmt->bindParam(':email', $data['email']);
        $userStmt->bindParam(':phone', $data['phone']);
        $userStmt->bindParam(':address', $data['address']);
        $userStmt->bindParam(':school', $data['school']);
        $userStmt->bindParam(':department', $data['department']);
        $userStmt->bindParam(':specialization', $data['specialization']);
        $userStmt->bindParam(':education', $data['education']);
        $userStmt->bindParam(':experience', $data['experience']);
        if ($school_id !== null) {
            $userStmt->bindParam(':school_id', $school_id);
        }
        if ($department_id !== null) {
            $userStmt->bindParam(':department_id', $department_id);
        }
        $userStmt->bindParam(':id', $data['id']);

        error_log("Executing query: " . $userQuery);
        error_log("With parameters: " . print_r($data, true));

        if (!$userStmt->execute()) {
            $error = $userStmt->errorInfo();
            error_log("SQL Error: " . print_r($error, true));
            throw new Exception('Failed to update user profile: ' . $error[2]);
        }

        // If department changed, update teacher's courses
        if ($department_id !== null && $oldDepartmentId !== $department_id) {
            // Remove teacher from old department's courses
            $removeCoursesQuery = "UPDATE courses SET instructor_id = NULL 
                                 WHERE department_id = :old_department_id 
                                 AND instructor_id = :teacher_id";
            $removeStmt = $conn->prepare($removeCoursesQuery);
            $removeStmt->bindParam(':old_department_id', $oldDepartmentId);
            $removeStmt->bindParam(':teacher_id', $data['id']);
            $removeStmt->execute();
        }

        // Commit transaction
        $conn->commit();

        // Fetch updated user data with school and department names
        $fetchQuery = "SELECT u.*, s.name as school_name, d.name as department_name 
                      FROM users u 
                      LEFT JOIN schools s ON u.school_id = s.id 
                      LEFT JOIN departments d ON u.department_id = d.id 
                      WHERE u.id = :id";
        $fetchStmt = $conn->prepare($fetchQuery);
        $fetchStmt->bindParam(':id', $data['id']);
        $fetchStmt->execute();
        
        $updatedUser = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        error_log("Updated user data: " . print_r($updatedUser, true));

        // Return success response with updated user data
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $updatedUser
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        if (isset($conn)) {
            $conn->rollBack();
        }
        
        error_log("Error updating profile: " . $e->getMessage());
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
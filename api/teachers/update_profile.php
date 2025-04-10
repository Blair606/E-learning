<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../middleware/AuthMiddleware.php';

header('Content-Type: application/json');

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'PUT') {
    try {
        // Authenticate the request
        $authPayload = AuthMiddleware::authenticate();
        
        // Get the request body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Invalid request data');
        }

        // Get database connection
        $conn = getConnection();
        
        // Start transaction
        $conn->beginTransaction();

        // Update user table
        $userQuery = "UPDATE users SET 
            first_name = :firstName,
            last_name = :lastName,
            email = :email,
            phone = :phone,
            address = :address,
            school_id = :school_id,
            department_id = :department_id,
            specialization = :specialization,
            education = :education,
            experience = :experience,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = :id AND role = 'teacher'";

        $userStmt = $conn->prepare($userQuery);
        $userStmt->bindParam(':firstName', $data['firstName']);
        $userStmt->bindParam(':lastName', $data['lastName']);
        $userStmt->bindParam(':email', $data['email']);
        $userStmt->bindParam(':phone', $data['phone']);
        $userStmt->bindParam(':address', $data['address']);
        $userStmt->bindParam(':school_id', $data['school_id']);
        $userStmt->bindParam(':department_id', $data['department_id']);
        $userStmt->bindParam(':specialization', $data['specialization']);
        $userStmt->bindParam(':education', $data['education']);
        $userStmt->bindParam(':experience', $data['experience']);
        $userStmt->bindParam(':id', $data['id']);

        if (!$userStmt->execute()) {
            throw new Exception('Failed to update user profile');
        }

        // If department changed, update teacher's courses
        if (isset($data['old_department_id']) && $data['old_department_id'] !== $data['department_id']) {
            // Remove teacher from old department's courses
            $removeCoursesQuery = "UPDATE courses SET teacher_id = NULL 
                                 WHERE department_id = :old_department_id 
                                 AND teacher_id = :teacher_id";
            $removeStmt = $conn->prepare($removeCoursesQuery);
            $removeStmt->bindParam(':old_department_id', $data['old_department_id']);
            $removeStmt->bindParam(':teacher_id', $data['id']);
            $removeStmt->execute();
        }

        // Commit transaction
        $conn->commit();

        // Fetch updated user data
        $fetchQuery = "SELECT id, email, first_name, last_name, role, status, 
                             phone, address, school_id, department_id, 
                             specialization, education, experience 
                      FROM users 
                      WHERE id = :id";
        $fetchStmt = $conn->prepare($fetchQuery);
        $fetchStmt->bindParam(':id', $data['id']);
        $fetchStmt->execute();
        
        $updatedUser = $fetchStmt->fetch(PDO::FETCH_ASSOC);

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
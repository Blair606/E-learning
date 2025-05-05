<?php
// Include CORS headers
require_once '../cors.php';

// Include database connection
require_once '../config/database.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if data is not empty
if (
    !empty($data->id) &&
    !empty($data->first_name) &&
    !empty($data->last_name) &&
    !empty($data->email)
) {
    try {
        // Get database connection
        $conn = getConnection();

        // Start transaction
        $conn->beginTransaction();

        // Update users table
        $userQuery = "UPDATE users 
                     SET first_name = :first_name,
                         last_name = :last_name,
                         email = :email,
                         phone = :phone,
                         address = :address,
                         school_id = :school_id,
                         department_id = :department_id,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id";

        $userStmt = $conn->prepare($userQuery);

        // Sanitize and bind values for users table
        $userStmt->bindParam(":id", $data->id);
        $userStmt->bindParam(":first_name", $data->first_name);
        $userStmt->bindParam(":last_name", $data->last_name);
        $userStmt->bindParam(":email", $data->email);
        $userStmt->bindParam(":phone", $data->phone);
        $userStmt->bindParam(":address", $data->address);
        
        // Convert school_id and department_id to integers
        $school_id = isset($data->school_id) ? (int)$data->school_id : null;
        $department_id = isset($data->department_id) ? (int)$data->department_id : null;
        
        $userStmt->bindParam(":school_id", $school_id, PDO::PARAM_INT);
        $userStmt->bindParam(":department_id", $department_id, PDO::PARAM_INT);

        // Debug log
        error_log("Updating user with data: " . json_encode([
            'id' => $data->id,
            'school_id' => $school_id,
            'department_id' => $department_id
        ]));

        // Execute the user update
        if (!$userStmt->execute()) {
            $error = $userStmt->errorInfo();
            error_log("Database error: " . json_encode($error));
            throw new Exception("Failed to update user information: " . implode(" ", $error));
        }

        // Update students table if additional student-specific fields exist
        if (isset($data->student_id) || isset($data->grade_level)) {
            $studentQuery = "UPDATE students 
                           SET grade_level = :grade_level
                           WHERE user_id = :user_id";

            $studentStmt = $conn->prepare($studentQuery);
            $studentStmt->bindParam(":user_id", $data->id);
            $studentStmt->bindParam(":grade_level", $data->grade_level);

            if (!$studentStmt->execute()) {
                throw new Exception("Failed to update student information");
            }
        }

        // Commit transaction
        $conn->commit();

        // Fetch updated user data with school and department names
        $fetchQuery = "SELECT u.*, s.student_id, s.grade_level,
                      sch.name as school_name, d.name as department_name
                      FROM users u 
                      LEFT JOIN students s ON u.id = s.user_id 
                      LEFT JOIN schools sch ON u.school_id = sch.id
                      LEFT JOIN departments d ON u.department_id = d.id
                      WHERE u.id = :id";
        
        $fetchStmt = $conn->prepare($fetchQuery);
        $fetchStmt->bindParam(":id", $data->id);
        $fetchStmt->execute();
        
        $updatedUser = $fetchStmt->fetch(PDO::FETCH_ASSOC);

        // Set response code - 200 OK
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Profile updated successfully",
            "data" => $updatedUser
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        
        // Set response code - 500 Internal Server Error
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Unable to update profile. Data is incomplete."
    ]);
}
?> 
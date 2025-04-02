<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include_once 'config/database.php';

try {
    // Get database connection
    $db = getConnection();
    
    // Start transaction
    $db->beginTransaction();
    
    // Create a test school
    $schoolQuery = "INSERT INTO schools (name, code, description, status) 
                   VALUES (:name, :code, :description, :status)";
    $schoolStmt = $db->prepare($schoolQuery);
    
    $schoolName = "Test School";
    $schoolCode = "TEST" . rand(1000, 9999);
    $schoolDescription = "A test school for testing purposes";
    $schoolStatus = "active";
    
    $schoolStmt->bindParam(":name", $schoolName);
    $schoolStmt->bindParam(":code", $schoolCode);
    $schoolStmt->bindParam(":description", $schoolDescription);
    $schoolStmt->bindParam(":status", $schoolStatus);
    
    $schoolStmt->execute();
    $schoolId = $db->lastInsertId();
    
    echo "Created test school with ID: " . $schoolId . "<br>";
    
    // Create a test department
    $deptQuery = "INSERT INTO departments (name, code, description, status) 
                  VALUES (:name, :code, :description, :status)";
    $deptStmt = $db->prepare($deptQuery);
    
    $deptName = "Test Department";
    $deptCode = "TDEP" . rand(1000, 9999);
    $deptDescription = "A test department for testing purposes";
    $deptStatus = "active";
    
    $deptStmt->bindParam(":name", $deptName);
    $deptStmt->bindParam(":code", $deptCode);
    $deptStmt->bindParam(":description", $deptDescription);
    $deptStmt->bindParam(":status", $deptStatus);
    
    $deptStmt->execute();
    $deptId = $db->lastInsertId();
    
    echo "Created test department with ID: " . $deptId . "<br>";
    
    // Link school and department
    $linkQuery = "INSERT INTO school_departments (school_id, department_id) 
                  VALUES (:school_id, :department_id)";
    $linkStmt = $db->prepare($linkQuery);
    
    $linkStmt->bindParam(":school_id", $schoolId);
    $linkStmt->bindParam(":department_id", $deptId);
    
    $linkStmt->execute();
    
    echo "Linked school and department<br>";
    
    // Create a test admin user if none exists
    $adminQuery = "SELECT COUNT(*) as count FROM users WHERE role = 'admin'";
    $adminStmt = $db->prepare($adminQuery);
    $adminStmt->execute();
    $adminCount = $adminStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    if ($adminCount == 0) {
        $userQuery = "INSERT INTO users (email, password, first_name, last_name, role, status, token) 
                     VALUES (:email, :password, :first_name, :last_name, :role, :status, :token)";
        $userStmt = $db->prepare($userQuery);
        
        $email = "admin@example.com";
        $password = password_hash("admin123", PASSWORD_DEFAULT);
        $firstName = "Admin";
        $lastName = "User";
        $role = "admin";
        $status = "active";
        $token = bin2hex(random_bytes(32));
        
        $userStmt->bindParam(":email", $email);
        $userStmt->bindParam(":password", $password);
        $userStmt->bindParam(":first_name", $firstName);
        $userStmt->bindParam(":last_name", $lastName);
        $userStmt->bindParam(":role", $role);
        $userStmt->bindParam(":status", $status);
        $userStmt->bindParam(":token", $token);
        
        $userStmt->execute();
        $userId = $db->lastInsertId();
        
        echo "Created test admin user with ID: " . $userId . "<br>";
        echo "Admin credentials: admin@example.com / admin123<br>";
        echo "Admin token: " . $token . "<br>";
    } else {
        echo "Admin user already exists<br>";
    }
    
    // Commit transaction
    $db->commit();
    
    echo "Test data created successfully!<br>";
    
} catch (Exception $e) {
    // Rollback transaction on error
    if (isset($db)) {
        $db->rollBack();
    }
    
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Stack trace: <pre>" . $e->getTraceAsString() . "</pre>";
}
?> 
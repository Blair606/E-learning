<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include_once 'config/database.php';

try {
    // Ensure database and tables exist
    ensureDatabaseExists();
    
    // Get database connection
    $db = getConnection();
    
    echo "Database connection successful!<br>";
    
    // Test query
    $query = "SELECT COUNT(*) as count FROM users";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Number of users in database: " . $result['count'] . "<br>";
    
    // Test schools table
    $query = "SELECT COUNT(*) as count FROM schools";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Number of schools in database: " . $result['count'] . "<br>";
    
    // Test departments table
    $query = "SELECT COUNT(*) as count FROM departments";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Number of departments in database: " . $result['count'] . "<br>";
    
    // Test school_departments table
    $query = "SELECT COUNT(*) as count FROM school_departments";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Number of school-department relationships: " . $result['count'] . "<br>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "<br>";
    echo "Stack trace: <pre>" . $e->getTraceAsString() . "</pre>";
}
?> 
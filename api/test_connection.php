<?php
include_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if($db) {
        echo "Database connection successful!\n";
        
        // Test if tables exist
        $tables = array('users', 'courses', 'enrollments', 'assignments', 'grades', 'notifications');
        foreach($tables as $table) {
            $query = "SHOW TABLES LIKE :table";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":table", $table);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                echo "Table '$table' exists\n";
            } else {
                echo "Table '$table' does NOT exist\n";
            }
        }
        
        // Test if we can query the users table
        $query = "SELECT COUNT(*) as count FROM users";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\nTotal users in database: " . $row['count'] . "\n";
        
    } else {
        echo "Database connection failed!\n";
    }
} catch(PDOException $e) {
    echo "Connection error: " . $e->getMessage() . "\n";
}
?> 
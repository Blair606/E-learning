<?php
// Include database file
include_once 'database/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Database connection successful!\n";
    
    try {
        // Check if tables exist
        $tables = ['courses', 'course_content'];
        foreach ($tables as $table) {
            $query = "SHOW TABLES LIKE '$table'";
            $stmt = $db->prepare($query);
            $stmt->execute();
            echo "\nTable '$table' exists: " . ($stmt->rowCount() > 0 ? "Yes" : "No");
            
            if ($stmt->rowCount() > 0) {
                // Get column names
                $query = "SHOW COLUMNS FROM $table";
                $stmt = $db->prepare($query);
                $stmt->execute();
                echo "\nColumns in $table:";
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    echo "\n- " . $row['Field'] . " (" . $row['Type'] . ")";
                }
                
                // Count records
                $query = "SELECT COUNT(*) as count FROM $table";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                echo "\nNumber of records: $count";
            }
        }
        
    } catch (PDOException $e) {
        echo "\nError: " . $e->getMessage();
    }
} else {
    echo "Database connection failed!";
}
?> 
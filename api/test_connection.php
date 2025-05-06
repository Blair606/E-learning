<?php
// Include database file
include_once 'database/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Database connection successful!\n";
    
    // Test course_content table
    try {
        $query = "SELECT COUNT(*) as count FROM course_content";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Number of records in course_content table: " . $row['count'] . "\n";
        
        // Show table structure
        $query = "DESCRIBE course_content";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo "\nTable structure for course_content:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . " - " . $row['Type'] . "\n";
        }
    } catch (PDOException $e) {
        echo "Error checking course_content table: " . $e->getMessage() . "\n";
    }
} else {
    echo "Database connection failed!\n";
}
?> 
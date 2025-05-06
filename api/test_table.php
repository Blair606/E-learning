<?php
// Include database file
include_once 'database/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Database connection successful!\n";
    
    try {
        // Check courses table
        echo "\n=== COURSES TABLE ===\n";
        $query = "DESCRIBE courses";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo "Table structure for courses:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . " - " . $row['Type'] . "\n";
        }
        
        // Show sample course data
        $query = "SELECT * FROM courses LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\nSample course data:\n";
        print_r($row);
        
        // Check course_content table
        echo "\n=== COURSE CONTENT TABLE ===\n";
        $query = "DESCRIBE course_content";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo "Table structure for course_content:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . " - " . $row['Type'] . "\n";
        }
        
        // Show sample content data
        $query = "SELECT * FROM course_content LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\nSample content data:\n";
        print_r($row);
        
        // Check relationship
        echo "\n=== CHECKING RELATIONSHIP ===\n";
        $query = "SELECT c.id as course_id, c.name as course_name, cc.id as content_id, cc.title as content_title 
                 FROM courses c 
                 LEFT JOIN course_content cc ON c.id = cc.course_id 
                 LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "Sample relationship data:\n";
        print_r($row);
        
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Database connection failed!\n";
}
?> 
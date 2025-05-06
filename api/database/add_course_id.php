<?php
// Include database file
include_once 'database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

if ($db) {
    try {
        // Read the SQL file
        $sql = file_get_contents('add_course_id.sql');
        
        // Execute the SQL
        $db->exec($sql);
        
        echo "Course ID column added successfully!\n";
        
        // Verify the table structure
        $query = "DESCRIBE course_content";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        echo "\nUpdated table structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . " - " . $row['Type'] . "\n";
        }
        
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Database connection failed!\n";
}
?> 
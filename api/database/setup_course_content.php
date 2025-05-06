<?php
// Include database file
include_once 'database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

if ($db) {
    try {
        // Read the SQL file
        $sql = file_get_contents('create_course_content.sql');
        
        // Execute the SQL
        $db->exec($sql);
        
        echo "Course content table created successfully!\n";
        
        // Verify the table structure
        $query = "DESCRIBE course_content";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        echo "\nTable structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . " - " . $row['Type'] . "\n";
        }
        
        // Count records
        $query = "SELECT COUNT(*) as count FROM course_content";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "\nNumber of records: $count\n";
        
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Database connection failed!\n";
}
?> 
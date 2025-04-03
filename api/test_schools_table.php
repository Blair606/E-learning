<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'config/database.php';

try {
    // Get database connection
    $db = getConnection();
    
    // Test if schools table exists
    $stmt = $db->query("SHOW TABLES LIKE 'schools'");
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        echo "Schools table exists.\n";
        
        // Check table structure
        $stmt = $db->query("DESCRIBE schools");
        echo "\nTable structure:\n";
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode($row) . "\n";
        }
    } else {
        echo "Schools table does not exist. Creating table...\n";
        
        // Create the schools table
        $sql = "CREATE TABLE IF NOT EXISTS schools (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(10) NOT NULL UNIQUE,
            description TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        $db->exec($sql);
        echo "Schools table created successfully.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>

<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    echo "Checking foreign key constraints...\n\n";
    
    // Get all foreign key constraints
    $query = "SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
              FROM information_schema.KEY_COLUMN_USAGE
              WHERE TABLE_SCHEMA = DATABASE()
              AND REFERENCED_TABLE_NAME IS NOT NULL";
    
    $constraints = $db->query($query);
    
    if ($constraints->rowCount() === 0) {
        echo "No foreign key constraints found.\n";
    } else {
        while ($row = $constraints->fetch(PDO::FETCH_ASSOC)) {
            echo "Table: {$row['TABLE_NAME']}\n";
            echo "Column: {$row['COLUMN_NAME']}\n";
            echo "Constraint Name: {$row['CONSTRAINT_NAME']}\n";
            echo "References: {$row['REFERENCED_TABLE_NAME']}.{$row['REFERENCED_COLUMN_NAME']}\n";
            echo "----------------------------------------\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error checking constraints: " . $e->getMessage() . "\n";
    exit(1);
}
?> 
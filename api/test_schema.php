<?php
include_once 'config/database.php';

try {
    $db = getConnection();
    
    // Get table schema for courses
    $query = "DESCRIBE courses";
    $stmt = $db->query($query);
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Courses table schema:\n";
    foreach ($columns as $column) {
        echo "{$column['Field']}: {$column['Type']} ";
        if ($column['Null'] === 'NO') echo "(Required) ";
        if ($column['Key'] === 'PRI') echo "(Primary Key) ";
        if ($column['Key'] === 'MUL') echo "(Foreign Key) ";
        echo "\n";
    }
    
    // Get foreign key constraints
    $query = "SELECT 
                TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
              FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
              WHERE TABLE_NAME = 'courses'
              AND REFERENCED_TABLE_NAME IS NOT NULL";
    $stmt = $db->query($query);
    $foreignKeys = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nForeign key constraints:\n";
    foreach ($foreignKeys as $fk) {
        echo "{$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}({$fk['REFERENCED_COLUMN_NAME']})\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 
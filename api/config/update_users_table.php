<?php
// Include database configuration
include_once 'database.php';

try {
    // Get database connection
    $db = getConnection();
    
    // Read the SQL file
    $sql = file_get_contents(__DIR__ . '/update_users_table.sql');
    
    // Execute the SQL
    $db->exec($sql);
    
    echo "Users table updated successfully!";
} catch (Exception $e) {
    echo "Error updating users table: " . $e->getMessage();
} 
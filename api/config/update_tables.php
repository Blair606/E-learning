<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

// Include database configuration
include_once 'database.php';

try {
    // Get database connection
    $db = getConnection();
    
    // Read SQL file
    $sql = file_get_contents(__DIR__ . '/update_tables.sql');
    
    // Execute SQL statements
    $db->exec($sql);
    
    echo "Tables updated successfully!";
} catch (Exception $e) {
    echo "Error updating tables: " . $e->getMessage();
    error_log("Error updating tables: " . $e->getMessage());
}
?> 
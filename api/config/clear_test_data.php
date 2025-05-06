<?php
require_once 'database.php';

try {
    $conn = getConnection();
    error_log("Database connection established");
    
    // Disable foreign key checks temporarily
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Clear test data in reverse order of dependencies
    $tables = [
        'online_classes',
        'enrollments',
        'students',
        'courses',
        'departments',
        'schools',
        'users'
    ];
    
    foreach ($tables as $table) {
        $stmt = $conn->prepare("DELETE FROM $table");
        $stmt->execute();
        echo "Cleared table: $table\n";
    }
    
    // Re-enable foreign key checks
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "Test data cleared successfully!\n";
    
} catch (Exception $e) {
    error_log("Error clearing test data: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    echo "Testing database permissions...\n\n";
    
    // Test 1: Create a simple table
    echo "Test 1: Creating test table...\n";
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS test_table (id INT)");
        echo "Successfully created test table.\n";
    } catch (PDOException $e) {
        echo "Error creating test table: " . $e->getMessage() . "\n";
    }
    
    // Test 2: Insert data
    echo "\nTest 2: Inserting data...\n";
    try {
        $db->exec("INSERT INTO test_table (id) VALUES (1)");
        echo "Successfully inserted data.\n";
    } catch (PDOException $e) {
        echo "Error inserting data: " . $e->getMessage() . "\n";
    }
    
    // Test 3: Drop table
    echo "\nTest 3: Dropping test table...\n";
    try {
        $db->exec("DROP TABLE IF EXISTS test_table");
        echo "Successfully dropped test table.\n";
    } catch (PDOException $e) {
        echo "Error dropping test table: " . $e->getMessage() . "\n";
    }
    
    echo "\nPermission test completed.\n";
    
} catch (Exception $e) {
    echo "Error during permission test: " . $e->getMessage() . "\n";
    exit(1);
}
?> 
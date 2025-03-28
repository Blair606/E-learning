<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    // Check departments table structure
    echo "Checking departments table structure...\n";
    $columns = $db->query("SHOW COLUMNS FROM departments");
    echo "Columns in departments table:\n";
    while ($column = $columns->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$column['Field']}: {$column['Type']}\n";
    }
    echo "\n";
    
    // Check if any departments exist
    $deptCount = $db->query("SELECT COUNT(*) FROM departments")->fetchColumn();
    echo "Total departments: $deptCount\n\n";
    
    // Check school_departments relationships
    echo "Checking school-department relationships...\n";
    $relationships = $db->query("
        SELECT s.name as school_name, COUNT(sd.department_id) as dept_count
        FROM schools s
        LEFT JOIN school_departments sd ON s.id = sd.school_id
        GROUP BY s.id, s.name
    ");
    
    while ($row = $relationships->fetch(PDO::FETCH_ASSOC)) {
        echo "School: {$row['school_name']} - Departments: {$row['dept_count']}\n";
    }
    
    echo "\nMigration verification completed.\n";
    
} catch (Exception $e) {
    echo "Error during verification: " . $e->getMessage() . "\n";
    exit(1);
}
?> 
<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    echo "Checking existing departments...\n\n";
    
    // Get all departments
    $departments = $db->query("SELECT * FROM departments");
    echo "Total departments: " . $departments->rowCount() . "\n\n";
    
    if ($departments->rowCount() > 0) {
        echo "Department details:\n";
        while ($dept = $departments->fetch(PDO::FETCH_ASSOC)) {
            echo "ID: {$dept['id']}\n";
            echo "Name: {$dept['name']}\n";
            echo "Code: {$dept['code']}\n";
            echo "Status: {$dept['status']}\n";
            echo "----------------------------------------\n";
        }
    }
    
    // Check school-department relationships
    echo "\nChecking school-department relationships...\n";
    $relationships = $db->query("
        SELECT s.name as school_name, d.name as department_name
        FROM schools s
        JOIN school_departments sd ON s.id = sd.school_id
        JOIN departments d ON sd.department_id = d.id
    ");
    
    if ($relationships->rowCount() > 0) {
        echo "\nSchool-Department relationships:\n";
        while ($rel = $relationships->fetch(PDO::FETCH_ASSOC)) {
            echo "School: {$rel['school_name']} - Department: {$rel['department_name']}\n";
        }
    } else {
        echo "No school-department relationships found.\n";
    }
    
} catch (Exception $e) {
    echo "Error checking departments: " . $e->getMessage() . "\n";
    exit(1);
}
?> 
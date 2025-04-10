<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include_once 'config/database.php';

try {
    // Get database connection
    $db = getConnection();
    
    echo "<h2>Inserting Test Data</h2>";
    
    // Check if schools table is empty
    $stmt = $db->query("SELECT COUNT(*) as count FROM schools");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] == 0) {
        echo "<p>Schools table is empty. Inserting test data...</p>";
        
        // Insert test schools
        $schools = [
            ['name' => 'Test School 1', 'code' => 'TS1', 'description' => 'Test School 1 Description'],
            ['name' => 'Test School 2', 'code' => 'TS2', 'description' => 'Test School 2 Description'],
            ['name' => 'Test School 3', 'code' => 'TS3', 'description' => 'Test School 3 Description']
        ];
        
        $stmt = $db->prepare("INSERT INTO schools (name, code, description, status) VALUES (:name, :code, :description, 'active')");
        
        foreach ($schools as $school) {
            $stmt->execute($school);
            echo "<p>Inserted school: " . $school['name'] . "</p>";
        }
    } else {
        echo "<p>Schools table already has data. Skipping insertion.</p>";
    }
    
    // Check if departments table is empty
    $stmt = $db->query("SELECT COUNT(*) as count FROM departments");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] == 0) {
        echo "<p>Departments table is empty. Inserting test data...</p>";
        
        // Get school IDs
        $stmt = $db->query("SELECT id FROM schools");
        $schoolIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($schoolIds) > 0) {
            // Insert test departments
            $departments = [
                ['name' => 'Computer Science', 'code' => 'CS', 'school_id' => $schoolIds[0], 'description' => 'Computer Science Department'],
                ['name' => 'Mathematics', 'code' => 'MATH', 'school_id' => $schoolIds[0], 'description' => 'Mathematics Department'],
                ['name' => 'Physics', 'code' => 'PHY', 'school_id' => $schoolIds[0], 'description' => 'Physics Department'],
                ['name' => 'Chemistry', 'code' => 'CHEM', 'school_id' => $schoolIds[1], 'description' => 'Chemistry Department'],
                ['name' => 'Biology', 'code' => 'BIO', 'school_id' => $schoolIds[1], 'description' => 'Biology Department'],
                ['name' => 'English', 'code' => 'ENG', 'school_id' => $schoolIds[2], 'description' => 'English Department']
            ];
            
            $stmt = $db->prepare("INSERT INTO departments (name, code, school_id, description, status) VALUES (:name, :code, :school_id, :description, 'active')");
            
            foreach ($departments as $department) {
                $stmt->execute($department);
                echo "<p>Inserted department: " . $department['name'] . " for school ID: " . $department['school_id'] . "</p>";
            }
        } else {
            echo "<p>No schools found. Cannot insert departments without schools.</p>";
        }
    } else {
        echo "<p>Departments table already has data. Skipping insertion.</p>";
    }
    
    echo "<h2>Test Data Insertion Complete</h2>";
    
} catch (Exception $e) {
    echo "<h2>Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?> 
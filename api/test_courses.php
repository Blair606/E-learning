<?php
include_once 'config/database.php';

try {
    $db = getConnection();
    
    // Check if courses table exists and has data
    $query = "SELECT COUNT(*) as count FROM courses";
    $stmt = $db->query($query);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Total courses in database: " . $result['count'] . "\n";
    
    if ($result['count'] > 0) {
        // Display all courses
        $query = "SELECT c.*, s.name as school_name, d.name as department_name 
                 FROM courses c 
                 LEFT JOIN schools s ON c.school_id = s.id 
                 LEFT JOIN departments d ON c.department_id = d.id";
        $stmt = $db->query($query);
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\nCourses in database:\n";
        foreach ($courses as $course) {
            echo "ID: {$course['id']}, Code: {$course['code']}, Name: {$course['name']}, School: {$course['school_name']}, Department: {$course['department_name']}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 
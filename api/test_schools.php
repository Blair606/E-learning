<?php
include_once 'config/database.php';

try {
    $db = getConnection();
    
    // Check if schools table exists and has data
    $query = "SELECT COUNT(*) as count FROM schools";
    $stmt = $db->query($query);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Total schools in database: " . $result['count'] . "\n";
    
    if ($result['count'] > 0) {
        // Display all schools
        $query = "SELECT id, name, code, status FROM schools";
        $stmt = $db->query($query);
        $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\nSchools in database:\n";
        foreach ($schools as $school) {
            echo "ID: {$school['id']}, Name: {$school['name']}, Code: {$school['code']}, Status: {$school['status']}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 
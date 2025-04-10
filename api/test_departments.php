<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 0);

// Function to log messages
function log_message($message) {
    echo $message . "\n";
}

// Include database configuration
include_once 'config/database.php';

try {
    log_message("Starting database connection...");
    
    // Get database connection
    $db = getConnection();
    
    log_message("Database connection established.");
    
    // First, let's check for any potential data issues
    log_message("\nChecking for potential data issues:");
    
    // Check for departments with NULL values in important fields
    $query1 = "SELECT * FROM departments WHERE name IS NULL OR code IS NULL OR school_id IS NULL OR status IS NULL";
    $stmt1 = $db->query($query1);
    $nullIssues = $stmt1->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($nullIssues) > 0) {
        log_message("\nFound departments with NULL values:");
        foreach ($nullIssues as $dept) {
            log_message(json_encode($dept, JSON_PRETTY_PRINT));
        }
    }
    
    // Check for duplicate department codes
    $query2 = "SELECT code, COUNT(*) as count FROM departments GROUP BY code HAVING count > 1";
    $stmt2 = $db->query($query2);
    $duplicates = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($duplicates) > 0) {
        log_message("\nFound duplicate department codes:");
        foreach ($duplicates as $dup) {
            log_message(json_encode($dup, JSON_PRETTY_PRINT));
        }
    }
    
    // Now show all departments, including any that might have issues
    log_message("\nAll departments (including potential issues):");
    $query3 = "SELECT d.*, s.name as school_name 
               FROM departments d 
               LEFT JOIN schools s ON d.school_id = s.id 
               ORDER BY d.id";
    
    $stmt3 = $db->query($query3);
    $departments = $stmt3->fetchAll(PDO::FETCH_ASSOC);
    
    log_message("\nTotal departments found: " . count($departments));
    foreach ($departments as $index => $dept) {
        log_message("\nDepartment #" . ($index + 1));
        log_message("ID: " . $dept['id']);
        log_message("Name: " . ($dept['name'] ?? 'NULL'));
        log_message("Code: " . ($dept['code'] ?? 'NULL'));
        log_message("School ID: " . ($dept['school_id'] ?? 'NULL'));
        log_message("School Name: " . ($dept['school_name'] ?? 'NULL'));
        log_message("Status: " . ($dept['status'] ?? 'NULL'));
        log_message("Description: " . ($dept['description'] ?? 'NULL'));
        log_message("Created: " . $dept['created_at']);
        log_message("Updated: " . $dept['updated_at']);
    }
    
} catch (Exception $e) {
    log_message("Error: " . $e->getMessage());
    log_message("Stack trace:\n" . $e->getTraceAsString());
} 
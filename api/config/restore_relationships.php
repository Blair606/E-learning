<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    echo "Restoring school-department relationships...\n\n";
    
    // Get all schools
    $schools = $db->query("SELECT * FROM schools")->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($schools) . " schools.\n";
    
    // Get all departments
    $departments = $db->query("SELECT * FROM departments")->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($departments) . " departments.\n\n";
    
    // Start transaction
    if (!$db->beginTransaction()) {
        throw new Exception("Could not start transaction");
    }
    
    try {
        // Clear existing relationships
        $db->exec("DELETE FROM school_departments");
        echo "Cleared existing relationships.\n";
        
        // Prepare insert statement
        $insertSQL = "INSERT INTO school_departments (school_id, department_id) VALUES (?, ?)";
        $stmt = $db->prepare($insertSQL);
        
        // Define department mappings
        $scienceDepartments = [
            'Computer Science',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology'
        ];
        
        $humanitiesDepartments = [
            'Languages',
            'History',
            'Philosophy',
            'Psychology',
            'Sociology'
        ];
        
        // Link departments to schools based on their names
        foreach ($departments as $dept) {
            $schoolId = null;
            
            // Check if department name contains any science keywords
            if (in_array($dept['name'], $scienceDepartments) || 
                stripos($dept['name'], 'science') !== false ||
                stripos($dept['name'], 'math') !== false ||
                stripos($dept['name'], 'computer') !== false ||
                stripos($dept['name'], 'physics') !== false ||
                stripos($dept['name'], 'chemistry') !== false ||
                stripos($dept['name'], 'biology') !== false) {
                // Find School of Pure and Applied Science
                foreach ($schools as $school) {
                    if (stripos($school['name'], 'Pure and Applied Science') !== false) {
                        $schoolId = $school['id'];
                        break;
                    }
                }
            }
            // Check if department name contains any humanities keywords
            else if (in_array($dept['name'], $humanitiesDepartments) ||
                     stripos($dept['name'], 'humanities') !== false ||
                     stripos($dept['name'], 'social') !== false ||
                     stripos($dept['name'], 'language') !== false ||
                     stripos($dept['name'], 'history') !== false ||
                     stripos($dept['name'], 'philosophy') !== false) {
                // Find School of Humanities
                foreach ($schools as $school) {
                    if (stripos($school['name'], 'Humanities') !== false) {
                        $schoolId = $school['id'];
                        break;
                    }
                }
            }
            
            if ($schoolId) {
                $stmt->execute([$schoolId, $dept['id']]);
                echo "Linked department {$dept['name']} to school ID {$schoolId}\n";
            } else {
                echo "Could not determine school for department {$dept['name']}\n";
            }
        }
        
        // Commit transaction
        if (!$db->commit()) {
            throw new Exception("Could not commit transaction");
        }
        
        echo "\nRelationships restored successfully.\n";
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    }
} catch (Exception $e) {
    echo "Error restoring relationships: " . $e->getMessage() . "\n";
    exit(1);
}
?> 
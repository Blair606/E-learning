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
        
        // Restore relationships based on department codes
        $insertSQL = "INSERT INTO school_departments (school_id, department_id) VALUES (?, ?)";
        $stmt = $db->prepare($insertSQL);
        
        $relationshipsCreated = 0;
        
        // Get the School of Pure and Applied Science
        $schoolId = null;
        foreach ($schools as $school) {
            if (stripos($school['name'], 'Pure and Applied Science') !== false) {
                $schoolId = $school['id'];
                break;
            }
        }
        
        if (!$schoolId) {
            throw new Exception("Could not find School of Pure and Applied Science");
        }
        
        echo "Found School of Pure and Applied Science (ID: {$schoolId})\n\n";
        
        // Link all departments to the School of Pure and Applied Science
        foreach ($departments as $dept) {
            $stmt->execute([$schoolId, $dept['id']]);
            $relationshipsCreated++;
            echo "Linked department {$dept['name']} to School of Pure and Applied Science\n";
        }
        
        // Commit transaction
        if (!$db->commit()) {
            throw new Exception("Could not commit transaction");
        }
        
        echo "\nRestoration completed successfully.\n";
        echo "Created {$relationshipsCreated} relationships.\n";
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    }
    
} catch (Exception $e) {
    echo "Error during restoration: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
?> 
<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    // First, check if the school_id column exists
    $checkColumn = $db->query("SHOW COLUMNS FROM departments LIKE 'school_id'");
    if ($checkColumn->rowCount() === 0) {
        echo "No school_id column found in departments table. Migration not needed.\n";
        exit();
    }
    
    // Backup existing relationships
    echo "Backing up existing relationships...\n";
    $relationships = $db->query("
        SELECT s.id as school_id, d.id as department_id
        FROM schools s
        JOIN departments d ON d.school_id = s.id
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    // Start transaction for data migration
    if (!$db->beginTransaction()) {
        throw new Exception("Could not start transaction");
    }
    
    try {
        // Drop temporary table if it exists
        $db->exec("DROP TABLE IF EXISTS departments_new");
        echo "Dropped existing temporary table if any.\n";
        
        // Create temporary table for departments
        $createTableSQL = "CREATE TABLE IF NOT EXISTS departments_new (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(10) NOT NULL UNIQUE,
            description TEXT,
            status ENUM('active', 'inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($createTableSQL);
        echo "Created temporary table successfully.\n";
        
        // Copy data without school_id
        $copySQL = "INSERT INTO departments_new (id, name, code, description, status, created_at, updated_at)
                   SELECT id, name, code, description, status, created_at, updated_at
                   FROM departments";
        
        $db->exec($copySQL);
        echo "Copied data to temporary table successfully.\n";
        
        // Drop school_departments table first (it has foreign key constraints)
        $db->exec("DROP TABLE IF EXISTS school_departments");
        echo "Dropped school_departments table successfully.\n";
        
        // Drop old departments table
        $db->exec("DROP TABLE departments");
        echo "Dropped old departments table successfully.\n";
        
        // Rename new table
        $db->exec("RENAME TABLE departments_new TO departments");
        echo "Renamed temporary table successfully.\n";
        
        // Recreate school_departments table
        $createSchoolDeptSQL = "CREATE TABLE school_departments (
            school_id INT NOT NULL,
            department_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (school_id, department_id),
            FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($createSchoolDeptSQL);
        echo "Recreated school_departments table successfully.\n";
        
        // Restore relationships
        if (!empty($relationships)) {
            echo "Restoring relationships...\n";
            $insertSQL = "INSERT INTO school_departments (school_id, department_id) VALUES (?, ?)";
            $stmt = $db->prepare($insertSQL);
            
            foreach ($relationships as $rel) {
                $stmt->execute([$rel['school_id'], $rel['department_id']]);
            }
            echo "Restored " . count($relationships) . " relationships.\n";
        }
        
        // Commit transaction
        if (!$db->commit()) {
            throw new Exception("Could not commit transaction");
        }
        
        echo "Database migration completed successfully.\n";
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    }
} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
?> 
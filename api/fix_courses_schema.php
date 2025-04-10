<?php
include_once 'config/database.php';

try {
    $db = getConnection();
    
    // Backup existing data
    $db->exec("CREATE TABLE IF NOT EXISTS courses_backup AS SELECT * FROM courses");
    echo "Created backup of courses table\n";
    
    // Drop existing table
    $db->exec("DROP TABLE IF EXISTS courses");
    echo "Dropped existing courses table\n";
    
    // Create new table with correct schema
    $db->exec("CREATE TABLE courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        school_id INT NOT NULL,
        department_id INT NOT NULL,
        instructor_id INT,
        credits INT NOT NULL DEFAULT 3,
        schedule JSON,
        prerequisites JSON,
        status ENUM('active', 'inactive') DEFAULT 'active',
        enrollment_capacity INT,
        current_enrollment INT DEFAULT 0,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "Created new courses table with correct schema\n";
    
    // Restore data from backup
    $db->exec("INSERT INTO courses (
        id, code, title, description, school_id, department_id, instructor_id,
        credits, schedule, prerequisites, status, enrollment_capacity,
        current_enrollment, start_date, end_date, created_at, updated_at
    )
    SELECT 
        id, code, COALESCE(title, name) as title, description, 
        (SELECT id FROM schools LIMIT 1) as school_id,
        department_id, COALESCE(instructor_id, teacher_id) as instructor_id,
        credits, schedule, prerequisites, status, enrollment_capacity,
        current_enrollment, start_date, end_date, created_at, updated_at
    FROM courses_backup");
    echo "Restored data from backup\n";
    
    // Drop backup table
    $db->exec("DROP TABLE courses_backup");
    echo "Dropped backup table\n";
    
    echo "\nSuccessfully recreated courses table with correct schema\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 
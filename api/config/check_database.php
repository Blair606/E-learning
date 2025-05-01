<?php
require_once 'database.php';

try {
    // First check if database exists
    $pdo = new PDO("mysql:host=localhost", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query("SHOW DATABASES LIKE 'e_learning'");
    if ($stmt->rowCount() === 0) {
        echo "Database 'e_learning' does not exist. Creating it...\n";
        $pdo->exec("CREATE DATABASE e_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "Database created successfully.\n";
    } else {
        echo "Database 'e_learning' exists.\n";
    }
    
    // Now connect to the specific database
    $conn = getConnection();
    error_log("Database connection established");
    
    // Check if required tables exist
    $tables = ['users', 'courses', 'departments', 'schools', 'course_enrollments'];
    $missing_tables = [];
    
    foreach ($tables as $table) {
        $stmt = $conn->prepare("SHOW TABLES LIKE '$table'");
        $stmt->execute();
        if ($stmt->rowCount() === 0) {
            $missing_tables[] = $table;
        }
    }
    
    if (empty($missing_tables)) {
        error_log("All required tables exist");
        echo "All required tables exist in the database.\n";
    } else {
        error_log("Missing tables: " . implode(', ', $missing_tables));
        echo "The following tables are missing: " . implode(', ', $missing_tables) . "\n";
        
        // Create missing tables
        echo "Creating missing tables...\n";
        foreach ($missing_tables as $table) {
            switch ($table) {
                case 'users':
                    $conn->exec("
                        CREATE TABLE users (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            email VARCHAR(255) NOT NULL UNIQUE,
                            password VARCHAR(255) NOT NULL,
                            first_name VARCHAR(100) NOT NULL,
                            last_name VARCHAR(100) NOT NULL,
                            role ENUM('admin', 'teacher', 'student') NOT NULL,
                            status ENUM('active', 'inactive') DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        )
                    ");
                    break;
                    
                case 'schools':
                    $conn->exec("
                        CREATE TABLE schools (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            code VARCHAR(50) NOT NULL UNIQUE,
                            description TEXT,
                            status ENUM('active', 'inactive') DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        )
                    ");
                    break;
                    
                case 'departments':
                    $conn->exec("
                        CREATE TABLE departments (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            code VARCHAR(50) NOT NULL UNIQUE,
                            description TEXT,
                            school_id INT,
                            status ENUM('active', 'inactive') DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (school_id) REFERENCES schools(id)
                        )
                    ");
                    break;
                    
                case 'courses':
                    $conn->exec("
                        CREATE TABLE courses (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            code VARCHAR(50) NOT NULL UNIQUE,
                            description TEXT,
                            credits INT NOT NULL,
                            school_id INT,
                            department_id INT,
                            instructor_id INT,
                            status ENUM('active', 'inactive') DEFAULT 'active',
                            schedule JSON,
                            prerequisites JSON,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (school_id) REFERENCES schools(id),
                            FOREIGN KEY (department_id) REFERENCES departments(id),
                            FOREIGN KEY (instructor_id) REFERENCES users(id)
                        )
                    ");
                    break;
                    
                case 'course_enrollments':
                    $conn->exec("
                        CREATE TABLE course_enrollments (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            course_id INT NOT NULL,
                            student_id INT NOT NULL,
                            status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                            FOREIGN KEY (course_id) REFERENCES courses(id),
                            FOREIGN KEY (student_id) REFERENCES users(id),
                            UNIQUE KEY unique_enrollment (course_id, student_id)
                        )
                    ");
                    break;
            }
            echo "Created table '$table' successfully.\n";
        }
    }
    
    // Check courses table structure
    $stmt = $conn->prepare("DESCRIBE courses");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    error_log("Courses table columns: " . implode(', ', $columns));
    echo "Courses table columns: " . implode(', ', $columns) . "\n";
    
} catch (Exception $e) {
    error_log("Error checking database: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
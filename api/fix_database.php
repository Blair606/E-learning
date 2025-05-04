<?php
require_once 'config/database.php';

try {
    $conn = getConnection();
    
    // Temporarily disable foreign key checks
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Drop existing users table if it exists
    $conn->exec("DROP TABLE IF EXISTS users");
    
    // Create users table with all required columns
    $conn->exec("
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
            status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
            token VARCHAR(255),
            phone VARCHAR(20),
            address TEXT,
            school VARCHAR(255),
            department VARCHAR(255),
            specialization TEXT,
            education TEXT,
            experience TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    
    // Add indexes for better performance
    $conn->exec("CREATE INDEX idx_email ON users(email)");
    $conn->exec("CREATE INDEX idx_role ON users(role)");
    $conn->exec("CREATE INDEX idx_status ON users(status)");
    $conn->exec("CREATE INDEX idx_school ON users(school)");
    $conn->exec("CREATE INDEX idx_department ON users(department)");
    
    // Re-enable foreign key checks
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "Database structure fixed successfully!\n";
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?> 
<?php
require_once '../config/database.php';

try {
    $conn = getConnection();
    
    // Create course_content table if it doesn't exist
    $conn->exec("
        CREATE TABLE IF NOT EXISTS course_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            type ENUM('text', 'video', 'quiz', 'assignment') NOT NULL,
            order_number INT NOT NULL DEFAULT 0,
            status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    echo "Course content table created/verified successfully!";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 
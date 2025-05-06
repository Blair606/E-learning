<?php
require_once 'config/database.php';

try {
    $conn = getConnection();
    
    // Drop existing tables if they exist
    $conn->exec("DROP TABLE IF EXISTS course_questions");
    $conn->exec("DROP TABLE IF EXISTS course_content");
    
    // Create course_content table with proper constraints
    $conn->exec("
        CREATE TABLE course_content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    // Create course_questions table with proper constraints
    $conn->exec("
        CREATE TABLE course_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            content_id INT NOT NULL,
            question_text TEXT NOT NULL,
            option1 VARCHAR(255) NOT NULL,
            option2 VARCHAR(255) NOT NULL,
            option3 VARCHAR(255) NOT NULL,
            option4 VARCHAR(255) NOT NULL,
            correct_answer INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (content_id) REFERENCES course_content(id) ON DELETE CASCADE,
            CHECK (correct_answer BETWEEN 1 AND 4)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Tables created successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
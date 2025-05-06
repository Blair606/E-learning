<?php
require_once 'config/database.php';

try {
    $conn = getConnection();
    
    // Create discussion_groups table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS discussion_groups (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            course_id INT NOT NULL,
            created_by INT,
            description TEXT,
            due_date DATETIME,
            number_of_groups INT DEFAULT 1,
            status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    // Create discussion_group_members table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS discussion_group_members (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES discussion_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_member (group_id, user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    // Create discussion_topics table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS discussion_topics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            group_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            created_by INT NOT NULL,
            status ENUM('active', 'closed', 'archived') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES discussion_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    // Create discussion_replies table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS discussion_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            topic_id INT NOT NULL,
            content TEXT NOT NULL,
            created_by INT NOT NULL,
            parent_reply_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (topic_id) REFERENCES discussion_topics(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_reply_id) REFERENCES discussion_replies(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    
    echo "Discussion tables created successfully!";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 
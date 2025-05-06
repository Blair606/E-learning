-- Drop the existing table if it exists
DROP TABLE IF EXISTS course_content;

-- Create the new course_content table
CREATE TABLE course_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    duration INT DEFAULT 0,
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add some sample data
INSERT INTO course_content (course_id, title, content, type, duration, file_url) VALUES
(1, 'Introduction to Programming', 'This is the first lesson of the course...', 'text', 60, NULL),
(1, 'Variables and Data Types', 'Learn about different types of variables...', 'text', 45, NULL),
(2, 'Database Basics', 'Introduction to database concepts...', 'text', 90, NULL),
(2, 'SQL Queries', 'Learn how to write basic SQL queries...', 'text', 75, NULL); 
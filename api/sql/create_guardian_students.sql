-- Create guardian_students table
CREATE TABLE IF NOT EXISTS guardian_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_guardian_student (guardian_id, student_id)
); 
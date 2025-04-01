-- Create database
CREATE DATABASE IF NOT EXISTS e_learning;
USE e_learning;

-- Drop existing triggers and function if they exist
DROP TRIGGER IF EXISTS before_student_insert;
DROP TRIGGER IF EXISTS before_teacher_insert;
DROP TRIGGER IF EXISTS before_admin_insert;
DROP TRIGGER IF EXISTS before_parent_insert;
DROP FUNCTION IF EXISTS generate_user_id;

-- Modify users table
ALTER TABLE users
MODIFY COLUMN student_id VARCHAR(20) UNIQUE,
MODIFY COLUMN teacher_id VARCHAR(20) UNIQUE,
ADD COLUMN admin_id VARCHAR(20) UNIQUE,
ADD COLUMN parent_id VARCHAR(20) UNIQUE;

-- Create function to generate user IDs
DELIMITER //

CREATE FUNCTION generate_user_id(role VARCHAR(10)) 
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE prefix VARCHAR(3);
    DECLARE year_part VARCHAR(2);
    DECLARE random_num VARCHAR(6);
    
    -- Set prefix based on role
    SET prefix = CASE role
        WHEN 'student' THEN 'STD'
        WHEN 'teacher' THEN 'TCH'
        WHEN 'admin' THEN 'ADM'
        ELSE 'PRT'
    END;
    
    -- Get current year's last 2 digits
    SET year_part = RIGHT(YEAR(CURRENT_DATE), 2);
    
    -- Generate random 6-digit number
    SET random_num = LPAD(FLOOR(RAND() * 1000000), 6, '0');
    
    -- Return formatted ID
    RETURN CONCAT(prefix, '/', random_num, '/', year_part);
END //

-- Create triggers
CREATE TRIGGER before_student_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'student' THEN
        SET NEW.student_id = generate_user_id('student');
    END IF;
END //

CREATE TRIGGER before_teacher_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'teacher' THEN
        SET NEW.teacher_id = generate_user_id('teacher');
    END IF;
END //

CREATE TRIGGER before_admin_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' THEN
        SET NEW.admin_id = generate_user_id('admin');
    END IF;
END //

CREATE TRIGGER before_parent_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'parent' THEN
        SET NEW.parent_id = generate_user_id('parent');
    END IF;
END //

DELIMITER ;

-- Add indexes
CREATE INDEX idx_student_id ON users(student_id);
CREATE INDEX idx_teacher_id ON users(teacher_id);
CREATE INDEX idx_admin_id ON users(admin_id);
CREATE INDEX idx_parent_id ON users(parent_id);

-- Create guardian_students table for managing guardian-student relationships
CREATE TABLE IF NOT EXISTS guardian_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship ENUM('Father', 'Mother', 'Guardian') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY unique_guardian_student (guardian_id, student_id)
);

-- Create guardian_access_logs table to track guardian portal access
CREATE TABLE IF NOT EXISTS guardian_access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT NOT NULL,
    student_id INT NOT NULL,
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    action VARCHAR(255),
    FOREIGN KEY (guardian_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Create guardian_notifications table for guardian-specific notifications
CREATE TABLE IF NOT EXISTS guardian_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT NOT NULL,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('academic', 'attendance', 'financial', 'behavior') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Create guardian_consent table for managing guardian permissions
CREATE TABLE IF NOT EXISTS guardian_consent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guardian_id INT NOT NULL,
    student_id INT NOT NULL,
    consent_type ENUM('academic_records', 'financial_records', 'attendance_records', 'behavior_records') NOT NULL,
    is_granted BOOLEAN DEFAULT FALSE,
    granted_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guardian_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Create grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assignment_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default admin user if it doesn't exist (password: admin123)
INSERT IGNORE INTO users (email, password, first_name, last_name, role) VALUES 
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin'); 
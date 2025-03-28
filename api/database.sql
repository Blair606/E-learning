-- Create database
CREATE DATABASE IF NOT EXISTS e_learning;
USE e_learning;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL DEFAULT 'student',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    token VARCHAR(64) DEFAULT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_picture VARCHAR(255),
    school VARCHAR(255),
    department VARCHAR(255),
    student_id VARCHAR(50),
    teacher_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
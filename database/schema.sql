-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'teacher', 'admin', 'parent') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    token VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    profile_picture VARCHAR(255),
    school VARCHAR(100),
    department VARCHAR(100),
    student_id VARCHAR(20) UNIQUE,
    teacher_id VARCHAR(20) UNIQUE,
    admin_id VARCHAR(20) UNIQUE,
    parent_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_status ON users(status);
CREATE INDEX idx_school ON users(school);
CREATE INDEX idx_department ON users(department); 
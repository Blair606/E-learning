-- Check if users table exists
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    token VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    national_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add token column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS token VARCHAR(255);

-- Add status column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active';

-- Add role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL;

-- Add national_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);

-- Add created_at and updated_at columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP; 
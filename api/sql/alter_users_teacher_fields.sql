-- Add teacher-specific fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS school_id INT,
ADD COLUMN IF NOT EXISTS department_id INT,
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL,
ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_specialization ON users(specialization); 
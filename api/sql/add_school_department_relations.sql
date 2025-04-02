-- Add school_id and department_id columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS school_id INT,
ADD COLUMN IF NOT EXISTS department_id INT;

-- Add foreign key constraints
ALTER TABLE users
ADD CONSTRAINT fk_users_school
FOREIGN KEY (school_id) REFERENCES schools(id)
ON DELETE SET NULL
ON UPDATE CASCADE,
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id) REFERENCES departments(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);

-- Update existing users to have NULL for these fields
UPDATE users SET school_id = NULL, department_id = NULL WHERE school_id IS NOT NULL OR department_id IS NOT NULL; 
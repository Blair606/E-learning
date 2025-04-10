-- Add additional columns to users table for teacher profiles
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) AFTER last_name,
ADD COLUMN IF NOT EXISTS address TEXT AFTER phone,
ADD COLUMN IF NOT EXISTS school_id INT AFTER address,
ADD COLUMN IF NOT EXISTS department_id INT AFTER school_id,
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255) AFTER department_id,
ADD COLUMN IF NOT EXISTS education TEXT AFTER specialization,
ADD COLUMN IF NOT EXISTS experience TEXT AFTER education,
ADD COLUMN IF NOT EXISTS bio TEXT AFTER experience;

-- Add foreign key constraints
ALTER TABLE users 
ADD CONSTRAINT fk_users_school 
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_users_department 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL; 
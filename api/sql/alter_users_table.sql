-- Add role-specific ID columns if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS student_id VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS admin_id VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS parent_id VARCHAR(20) UNIQUE;

-- Add indexes for role-specific IDs
CREATE INDEX IF NOT EXISTS idx_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_id ON users(teacher_id);
CREATE INDEX IF NOT EXISTS idx_admin_id ON users(admin_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON users(parent_id); 
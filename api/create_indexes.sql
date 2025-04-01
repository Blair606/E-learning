CREATE INDEX IF NOT EXISTS idx_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_id ON users(teacher_id);
CREATE INDEX IF NOT EXISTS idx_admin_id ON users(admin_id);
CREATE INDEX IF NOT EXISTS idx_parent_id ON users(parent_id); 
ALTER TABLE users
MODIFY COLUMN student_id VARCHAR(20) UNIQUE,
MODIFY COLUMN teacher_id VARCHAR(20) UNIQUE,
ADD COLUMN admin_id VARCHAR(20) UNIQUE,
ADD COLUMN parent_id VARCHAR(20) UNIQUE; 
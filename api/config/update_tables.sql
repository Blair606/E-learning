-- Drop existing foreign key constraints if they exist
SET FOREIGN_KEY_CHECKS=0;

-- Add school_id column to departments table if it doesn't exist
ALTER TABLE departments ADD COLUMN IF NOT EXISTS school_id INT NOT NULL AFTER description;

-- Drop existing foreign key constraint if it exists
ALTER TABLE departments DROP FOREIGN KEY IF EXISTS fk_departments_school;

-- Add foreign key constraint
ALTER TABLE departments ADD CONSTRAINT fk_departments_school 
FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

-- Add instructor_id, schedule, and prerequisites columns to courses table if they don't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id INT AFTER department_id;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS schedule JSON AFTER credits;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites JSON AFTER schedule;

-- Drop existing foreign key constraint if it exists
ALTER TABLE courses DROP FOREIGN KEY IF EXISTS fk_courses_instructor;

-- Add foreign key constraint for instructor_id
ALTER TABLE courses ADD CONSTRAINT fk_courses_instructor 
FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add additional columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS title VARCHAR(255) AFTER code;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_capacity INT DEFAULT 30 AFTER status;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS current_enrollment INT DEFAULT 0 AFTER enrollment_capacity;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_date DATE AFTER current_enrollment;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_date DATE AFTER start_date;

SET FOREIGN_KEY_CHECKS=1; 
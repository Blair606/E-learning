-- Add course_id column to course_content table
ALTER TABLE course_content
ADD COLUMN course_id INT NOT NULL AFTER id,
ADD FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_course_content_course_id ON course_content(course_id); 
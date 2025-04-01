DELIMITER //

CREATE FUNCTION generate_user_id(role VARCHAR(10)) 
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE prefix VARCHAR(3);
    DECLARE year_part VARCHAR(2);
    DECLARE random_num VARCHAR(6);
    
    -- Set prefix based on role
    SET prefix = CASE role
        WHEN 'student' THEN 'STD'
        WHEN 'teacher' THEN 'TCH'
        WHEN 'admin' THEN 'ADM'
        ELSE 'PRT'
    END;
    
    -- Get current year's last 2 digits
    SET year_part = RIGHT(YEAR(CURRENT_DATE), 2);
    
    -- Generate random 6-digit number
    SET random_num = LPAD(FLOOR(RAND() * 1000000), 6, '0');
    
    -- Return formatted ID
    RETURN CONCAT(prefix, '/', random_num, '/', year_part);
END //

-- Trigger for students
CREATE TRIGGER before_student_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'student' THEN
        SET NEW.student_id = generate_user_id('student');
    END IF;
END //

-- Trigger for teachers
CREATE TRIGGER before_teacher_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'teacher' THEN
        SET NEW.teacher_id = generate_user_id('teacher');
    END IF;
END //

-- Trigger for admins
CREATE TRIGGER before_admin_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' THEN
        SET NEW.admin_id = generate_user_id('admin');
    END IF;
END //

-- Trigger for parents
CREATE TRIGGER before_parent_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'parent' THEN
        SET NEW.parent_id = generate_user_id('parent');
    END IF;
END //

DELIMITER ; 
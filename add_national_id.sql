-- First, check if the column exists
SET @dbname = 'e_learning';
SET @tablename = 'users';
SET @columnname = 'national_id';
SET @columntype = 'VARCHAR(50)';

SELECT IF(
    EXISTS(
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
        AND COLUMN_NAME = @columnname
    ),
    'Column exists',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ', @columntype, ' AFTER address')
) INTO @sql;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column to assignments table
ALTER TABLE `assignments` ADD COLUMN `status` ENUM('Active', 'Completed') DEFAULT 'Active' AFTER `due_date`;

-- Add total_marks column to assignments table
ALTER TABLE `assignments` ADD COLUMN `total_marks` INT DEFAULT 100 AFTER `status`;

-- Add submissions column to assignments table
ALTER TABLE `assignments` ADD COLUMN `submissions` INT DEFAULT 0 AFTER `total_marks`; 
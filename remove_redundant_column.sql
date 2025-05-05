-- Drop the redundant total_points column if it exists
ALTER TABLE `assignments` DROP COLUMN IF EXISTS `total_points`; 
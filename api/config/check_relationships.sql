-- Check schools and their departments
SELECT s.id as school_id, s.name as school_name, s.code as school_code,
       COUNT(sd.department_id) as department_count,
       GROUP_CONCAT(d.name) as department_names
FROM schools s
LEFT JOIN school_departments sd ON s.id = sd.school_id
LEFT JOIN departments d ON sd.department_id = d.id
GROUP BY s.id, s.name, s.code
ORDER BY s.name;

-- Check departments without schools
SELECT d.*
FROM departments d
LEFT JOIN school_departments sd ON d.id = sd.department_id
WHERE sd.school_id IS NULL;

-- Check school_departments table
SELECT * FROM school_departments; 
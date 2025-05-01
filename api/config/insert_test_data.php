<?php
require_once 'database.php';

try {
    $conn = getConnection();
    error_log("Database connection established");
    
    // Insert test school
    $stmt = $conn->prepare("INSERT INTO schools (name, code, description) VALUES (?, ?, ?)");
    $stmt->execute(['Test School', 'TS001', 'A test school for the e-learning system']);
    $schoolId = $conn->lastInsertId();
    echo "Created test school with ID: $schoolId\n";
    
    // Insert test department
    $stmt = $conn->prepare("INSERT INTO departments (name, code, description, school_id) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Computer Science', 'CS', 'Computer Science Department', $schoolId]);
    $departmentId = $conn->lastInsertId();
    echo "Created test department with ID: $departmentId\n";
    
    // Insert test admin user
    $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['admin@example.com', $hashedPassword, 'Admin', 'User', 'admin']);
    $adminId = $conn->lastInsertId();
    echo "Created admin user with ID: $adminId\n";
    
    // Insert test teacher user
    $hashedPassword = password_hash('teacher123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['teacher@example.com', $hashedPassword, 'John', 'Doe', 'teacher']);
    $teacherId = $conn->lastInsertId();
    echo "Created teacher user with ID: $teacherId\n";
    
    // Insert test course
    $schedule = json_encode(['day' => 'Monday', 'time' => '10:00']);
    $prerequisites = json_encode([]);
    $stmt = $conn->prepare("
        INSERT INTO courses (
            code, 
            title, 
            description, 
            credits, 
            school_id, 
            department_id, 
            instructor_id, 
            teacher_id,
            status, 
            schedule, 
            prerequisites,
            enrollment_capacity,
            current_enrollment,
            start_date,
            end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        'CS101',
        'Introduction to Programming',
        'Basic programming concepts',
        3,
        $schoolId,
        $departmentId,
        $teacherId,
        $teacherId,
        'active',
        $schedule,
        $prerequisites,
        30,
        0,
        date('Y-m-d'),
        date('Y-m-d', strtotime('+3 months'))
    ]);
    $courseId = $conn->lastInsertId();
    echo "Created test course with ID: $courseId\n";
    
    echo "Test data inserted successfully!\n";
    
} catch (Exception $e) {
    error_log("Error inserting test data: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
<?php
require_once 'database.php';

try {
    $conn = getConnection();
    error_log("Database connection established");
    
    // Insert test student user
    $hashedPassword = password_hash('student123', PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['student@example.com', $hashedPassword, 'Jane', 'Smith', 'student']);
    $userId = $conn->lastInsertId();
    echo "Created student user with ID: $userId\n";
    
    // Insert test student record
    $stmt = $conn->prepare("INSERT INTO students (user_id, student_id, grade_level) VALUES (?, ?, ?)");
    $stmt->execute([$userId, 'STU001', 'Freshman']);
    $studentId = $conn->lastInsertId();
    echo "Created student record with ID: $studentId\n";
    
    // Get the first active course with its instructor
    $stmt = $conn->prepare("SELECT id, instructor_id FROM courses WHERE status = 'active' LIMIT 1");
    $stmt->execute();
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($course) {
        // Enroll student in the course
        $stmt = $conn->prepare("INSERT INTO enrollments (student_id, course_id, status) VALUES (?, ?, ?)");
        $stmt->execute([$studentId, $course['id'], 'active']);
        echo "Enrolled student in course ID: {$course['id']}\n";
        
        if ($course['instructor_id']) {
            // Create an online class for the course
            $stmt = $conn->prepare("
                INSERT INTO online_classes (
                    title,
                    course_id,
                    instructor_id,
                    scheduled_date,
                    scheduled_time,
                    duration,
                    meeting_link,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                'Introduction to Programming - Online Session',
                $course['id'],
                $course['instructor_id'],
                date('Y-m-d', strtotime('+1 day')),
                '14:00:00',
                60,
                'https://meet.google.com/test-link',
                'upcoming'
            ]);
            echo "Created online class for the course\n";
        } else {
            echo "Course has no instructor assigned\n";
        }
    } else {
        echo "No active courses found to enroll the student\n";
    }
    
    echo "Test student data inserted successfully!\n";
    
} catch (Exception $e) {
    error_log("Error inserting test student data: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
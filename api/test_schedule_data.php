<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/cors.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();
    
    // Test students table
    $studentsQuery = "SELECT s.*, u.email FROM students s JOIN users u ON s.user_id = u.id LIMIT 5";
    $studentsStmt = $conn->query($studentsQuery);
    $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Test courses table
    $coursesQuery = "SELECT * FROM courses WHERE schedule IS NOT NULL AND schedule != '[]' LIMIT 5";
    $coursesStmt = $conn->query($coursesQuery);
    $courses = $coursesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Test enrollments table
    $enrollmentsQuery = "SELECT e.*, c.name as course_name, s.user_id as student_user_id 
                        FROM enrollments e 
                        JOIN courses c ON e.course_id = c.id 
                        JOIN students s ON e.student_id = s.id 
                        LIMIT 5";
    $enrollmentsStmt = $conn->query($enrollmentsQuery);
    $enrollments = $enrollmentsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Test online_classes table
    $onlineClassesQuery = "SELECT oc.*, c.name as course_name 
                          FROM online_classes oc 
                          JOIN courses c ON oc.course_id = c.id 
                          LIMIT 5";
    $onlineClassesStmt = $conn->query($onlineClassesQuery);
    $onlineClasses = $onlineClassesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = [
        'success' => true,
        'data' => [
            'students' => $students,
            'courses' => $courses,
            'enrollments' => $enrollments,
            'online_classes' => $onlineClasses
        ]
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("Error in test_schedule_data.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => 'An error occurred while testing schedule data. Please check the server logs for more information.'
    ]);
}
?> 
<?php
require_once '../config/database.php';
require_once '../config/cors.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

try {
    error_log("Starting get_courses.php execution");
    
    // Get database connection
    $conn = getConnection();
    error_log("Database connection established");
    
    // Query to get courses with instructor and department information
    $query = "
        SELECT 
            c.id,
            c.code,
            c.title as name,
            c.description,
            c.credits,
            c.status,
            c.schedule,
            c.prerequisites,
            d.name as department_name,
            s.name as school_name,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
            u.id as instructor_id,
            c.current_enrollment as total_students
        FROM courses c
        LEFT JOIN departments d ON c.department_id = d.id
        LEFT JOIN schools s ON c.school_id = s.id
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE c.status = 'active'
        ORDER BY c.title ASC
    ";
    
    error_log("Preparing query: " . $query);
    $stmt = $conn->prepare($query);
    $stmt->execute();
    error_log("Query executed successfully");
    
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Fetched " . count($courses) . " courses");
    
    // Format the response
    $response = [
        'success' => true,
        'courses' => array_map(function($course) {
            return [
                'id' => $course['id'],
                'name' => $course['name'],
                'code' => $course['code'],
                'description' => $course['description'],
                'credits' => $course['credits'],
                'status' => $course['status'],
                'schedule' => json_decode($course['schedule'], true),
                'prerequisites' => json_decode($course['prerequisites'], true),
                'department' => $course['department_name'],
                'school' => $course['school_name'],
                'instructor' => $course['instructor_name'],
                'instructorId' => $course['instructor_id'],
                'totalStudents' => $course['total_students']
            ];
        }, $courses)
    ];
    
    error_log("Sending response with " . count($response['courses']) . " courses");
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Error in get_courses.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => 'An error occurred while fetching courses. Please check the server logs for more information.'
    ]);
}
?> 
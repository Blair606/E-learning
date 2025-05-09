<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../middleware/auth.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
handleCORS();

header('Content-Type: application/json');

try {
    // Authenticate the request
    try {
        AuthMiddleware::authenticate();
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Unauthorized',
            'details' => $e->getMessage()
        ]);
        exit;
    }
    
    // Get database connection
    $conn = getConnection();
    
    // Get the authenticated user's ID from the token
    $headers = getallheaders();
    $token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');
    $user_id = getUserIdFromToken($token);
    
    if (!$user_id) {
        throw new Exception("Unable to get user ID from token");
    }

    // Get student ID from users table
    $studentQuery = "SELECT id FROM students WHERE user_id = :user_id";
    $studentStmt = $conn->prepare($studentQuery);
    $studentStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $studentStmt->execute();
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception("Student record not found");
    }

    $student_id = $student['id'];
    error_log("Fetching schedule for student ID: " . $student_id);
    
    // Get enrolled courses with their schedules
    $coursesQuery = "
        SELECT 
            c.id,
            c.name,
            c.code,
            c.schedule,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name
        FROM courses c
        LEFT JOIN users u ON c.instructor_id = u.id
        INNER JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = :student_id
        AND c.status = 'active'
        AND c.schedule IS NOT NULL
        AND c.schedule != '[]'
    ";
    
    error_log("Executing courses query: " . $coursesQuery);
    $coursesStmt = $conn->prepare($coursesQuery);
    $coursesStmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $coursesStmt->execute();
    $courses = $coursesStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($courses) . " courses with schedules");
    
    // Get upcoming online classes
    $onlineClassesQuery = "
        SELECT 
            oc.id,
            oc.title,
            oc.scheduled_date,
            oc.scheduled_time,
            oc.duration,
            oc.meeting_link,
            c.name as course_name,
            c.code as course_code,
            CONCAT(u.first_name, ' ', u.last_name) as instructor_name
        FROM online_classes oc
        INNER JOIN courses c ON oc.course_id = c.id
        INNER JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN users u ON oc.instructor_id = u.id
        WHERE e.student_id = :student_id
        AND oc.scheduled_date >= CURDATE()
        AND oc.status = 'upcoming'
        ORDER BY oc.scheduled_date ASC, oc.scheduled_time ASC
    ";
    
    error_log("Executing online classes query: " . $onlineClassesQuery);
    $onlineClassesStmt = $conn->prepare($onlineClassesQuery);
    $onlineClassesStmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $onlineClassesStmt->execute();
    $onlineClasses = $onlineClassesStmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("Found " . count($onlineClasses) . " upcoming online classes");
    
    // Format the response
    $response = [
        'success' => true,
        'data' => [
            'regular_schedule' => array_map(function($course) {
                $schedule = json_decode($course['schedule'], true);
                if (!is_array($schedule)) {
                    error_log("Invalid schedule format for course {$course['id']}: " . $course['schedule']);
                    $schedule = [];
                }
                return [
                    'id' => $course['id'],
                    'name' => $course['name'],
                    'code' => $course['code'],
                    'instructor' => $course['instructor_name'],
                    'schedule' => $schedule
                ];
            }, $courses),
            'online_classes' => array_map(function($class) {
                return [
                    'id' => $class['id'],
                    'title' => $class['title'],
                    'course_name' => $class['course_name'],
                    'course_code' => $class['course_code'],
                    'instructor' => $class['instructor_name'],
                    'date' => $class['scheduled_date'],
                    'time' => $class['scheduled_time'],
                    'duration' => $class['duration'],
                    'meeting_link' => $class['meeting_link']
                ];
            }, $onlineClasses)
        ]
    ];
    
    error_log("Successfully formatted schedule response");
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Error in get_schedule.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => 'An error occurred while fetching schedule. Please check the server logs for more information.'
    ]);
}
?> 
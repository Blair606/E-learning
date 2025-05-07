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
    $user = AuthMiddleware::authenticate();
    if (!$user) {
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
    
    // Get course ID from query parameters
    if (!isset($_GET['course_id'])) {
        throw new Exception("Course ID is required");
    }
    
    $courseId = $_GET['course_id'];
    
    // Get course content
    $contentQuery = "
        SELECT 
            id,
            title,
            content,
            order_number,
            status,
            created_at,
            updated_at
        FROM course_content
        WHERE course_id = :course_id
        AND status = 'active'
        ORDER BY order_number ASC
    ";
    
    $contentStmt = $conn->prepare($contentQuery);
    $contentStmt->bindParam(':course_id', $courseId, PDO::PARAM_INT);
    $contentStmt->execute();
    $content = $contentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = [
        'success' => true,
        'data' => array_map(function($item) {
            return [
                'id' => $item['id'],
                'title' => $item['title'],
                'content' => $item['content'],
                'order' => $item['order_number'],
                'status' => $item['status'],
                'created_at' => $item['created_at'],
                'updated_at' => $item['updated_at']
            ];
        }, $content)
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("Error in get_content.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'details' => 'An error occurred while fetching course content. Please check the server logs for more information.'
    ]);
}
?> 
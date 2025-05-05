<?php
require_once 'config/database.php';
require_once 'middleware/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Authenticate user
    $headers = getallheaders();
    $token = null;
    
    // Check for token in Authorization header
    if (isset($headers['Authorization'])) {
        $auth_header = $headers['Authorization'];
        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No token provided']);
        exit();
    }

    $payload = AuthMiddleware::authenticate();
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid token']);
        exit();
    }

    $courseId = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
    if (!$courseId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Course ID is required']);
        exit();
    }

    $conn = getConnection();
    
    // Get discussion groups for the course
    $stmt = $conn->prepare("
        SELECT dg.*, 
               u.name as creator_name,
               COUNT(DISTINCT p.id) as post_count,
               COUNT(DISTINCT m.id) as member_count
        FROM discussion_groups dg
        LEFT JOIN users u ON dg.creator_id = u.id
        LEFT JOIN discussion_posts p ON dg.id = p.group_id
        LEFT JOIN group_members m ON dg.id = m.group_id
        WHERE dg.course_id = ?
        GROUP BY dg.id
        ORDER BY dg.created_at DESC
    ");
    
    $stmt->execute([$courseId]);
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format the response
    $formattedGroups = array_map(function($group) {
        return [
            'id' => $group['id'],
            'name' => $group['name'],
            'description' => $group['description'],
            'creator_id' => $group['creator_id'],
            'creator_name' => $group['creator_name'],
            'course_id' => $group['course_id'],
            'post_count' => $group['post_count'],
            'member_count' => $group['member_count'],
            'created_at' => $group['created_at'],
            'updated_at' => $group['updated_at']
        ];
    }, $groups);

    echo json_encode([
        'success' => true,
        'groups' => $formattedGroups
    ]);

} catch (PDOException $e) {
    error_log("Database error in discussion_groups.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("Server error in discussion_groups.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
} 
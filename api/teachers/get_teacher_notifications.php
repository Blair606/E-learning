<?php
require_once '../config/cors.php';
header('Content-Type: application/json');
require_once '../config/database.php';
require_once '../middleware/auth.php';

// Verify JWT token
$auth = new Auth();
$user = $auth->verifyToken();

if (!$user || $user['role'] !== 'teacher') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $teacher_id = $user['id'];
    
    // Get teacher's notifications
    $notifications_query = "
        SELECT 
            n.id,
            n.title,
            n.message,
            n.created_at,
            n.is_read,
            c.id as class_id,
            c.title as class_name
        FROM notifications n
        LEFT JOIN courses c ON n.course_id = c.id
        WHERE n.user_id = ? OR (c.teacher_id = ? AND n.course_id IS NOT NULL)
        ORDER BY n.created_at DESC
        LIMIT 50
    ";
    
    $stmt = $conn->prepare($notifications_query);
    $stmt->bind_param("ii", $teacher_id, $teacher_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'message' => $row['message'],
            'timestamp' => $row['created_at'],
            'isRead' => (bool)$row['is_read'],
            'classId' => $row['class_id'],
            'className' => $row['class_name']
        ];
    }
    
    // Get unread count
    $unread_query = "
        SELECT COUNT(*) as unread_count
        FROM notifications n
        LEFT JOIN courses c ON n.course_id = c.id
        WHERE (n.user_id = ? OR (c.teacher_id = ? AND n.course_id IS NOT NULL))
        AND n.is_read = 0
    ";
    
    $stmt = $conn->prepare($unread_query);
    $stmt->bind_param("ii", $teacher_id, $teacher_id);
    $stmt->execute();
    $unread_count = $stmt->get_result()->fetch_assoc()['unread_count'];
    
    echo json_encode([
        'success' => true,
        'notifications' => $notifications,
        'unreadCount' => $unread_count
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?> 
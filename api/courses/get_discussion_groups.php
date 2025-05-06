<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

// Handle CORS
handleCORS();

header('Content-Type: application/json');

try {
    // Authenticate user
    $user = AuthMiddleware::authenticate();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    // Get course ID from query parameter
    $course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : null;
    if (!$course_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Course ID is required']);
        exit();
    }

    // Get database connection
    $conn = getConnection();

    // Get discussion groups for the course
    $groups_query = "
        SELECT 
            dg.id,
            dg.name,
            c.name as course,
            c.code as course_code,
            COUNT(DISTINCT dgm.user_id) as members,
            MAX(dt.created_at) as last_active
        FROM discussion_groups dg
        JOIN courses c ON dg.course_id = c.id
        LEFT JOIN discussion_group_members dgm ON dg.id = dgm.group_id
        LEFT JOIN discussion_topics dt ON dg.id = dt.group_id
        WHERE dg.course_id = ?
        GROUP BY dg.id, dg.name, c.name, c.code
    ";

    $stmt = $conn->prepare($groups_query);
    $stmt->bind_param('i', $course_id);
    $stmt->execute();
    $groups_result = $stmt->get_result();
    $groups = [];

    while ($group = $groups_result->fetch_assoc()) {
        // Get topics for each group
        $topics_query = "
            SELECT 
                dt.id,
                dt.title,
                dt.content as last_message,
                COUNT(dr.id) as replies,
                (
                    SELECT COUNT(*)
                    FROM discussion_replies dr2
                    LEFT JOIN discussion_read_status drs ON dr2.id = drs.reply_id AND drs.user_id = ?
                    WHERE dr2.topic_id = dt.id AND drs.id IS NULL
                ) as unread,
                dt.created_at as timestamp
            FROM discussion_topics dt
            LEFT JOIN discussion_replies dr ON dt.id = dr.topic_id
            WHERE dt.group_id = ?
            GROUP BY dt.id, dt.title, dt.content, dt.created_at
            ORDER BY dt.created_at DESC
        ";

        $topics_stmt = $conn->prepare($topics_query);
        $topics_stmt->bind_param('ii', $user['id'], $group['id']);
        $topics_stmt->execute();
        $topics_result = $topics_stmt->get_result();
        $topics = [];

        while ($topic = $topics_result->fetch_assoc()) {
            $topics[] = [
                'id' => (int)$topic['id'],
                'title' => $topic['title'],
                'lastMessage' => $topic['last_message'],
                'replies' => (int)$topic['replies'],
                'unread' => (int)$topic['unread'],
                'timestamp' => $topic['timestamp']
            ];
        }

        $groups[] = [
            'id' => (int)$group['id'],
            'name' => $group['name'],
            'course' => $group['course'],
            'courseCode' => $group['course_code'],
            'members' => (int)$group['members'],
            'lastActive' => $group['last_active'],
            'topics' => $topics
        ];
    }

    echo json_encode(['success' => true, 'data' => $groups]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>

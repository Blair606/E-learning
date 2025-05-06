<?php
require_once 'config/database.php';
require_once 'config/cors.php';
require_once 'config/auth.php';

// Set content type to JSON
header('Content-Type: application/json');

try {
    // Get database connection
    $conn = getConnection();

    // Get authenticated user
    $user = getAuthenticatedUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }

    // Get the request method
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            // Get course_id from query parameters
            $courseId = isset($_GET['course_id']) ? intval($_GET['course_id']) : null;
            
            $sql = "
                SELECT 
                    dg.id,
                    dg.title,
                    dg.course_id,
                    dg.description,
                    dg.due_date,
                    dg.number_of_groups,
                    dg.created_at,
                    dg.updated_at,
                    c.name as course_name,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    (SELECT COUNT(*) FROM discussion_group_members WHERE group_id = dg.id) as member_count,
                    (SELECT COUNT(*) FROM discussion_topics WHERE group_id = dg.id) as topic_count
                FROM discussion_groups dg
                LEFT JOIN courses c ON dg.course_id = c.id
                LEFT JOIN users u ON u.id = (
                    SELECT user_id 
                    FROM discussion_group_members 
                    WHERE group_id = dg.id AND role = 'teacher' 
                    LIMIT 1
                )
                WHERE 1=1
            ";
            
            $params = [];
            if ($courseId) {
                $sql .= " AND dg.course_id = :course_id";
                $params[':course_id'] = $courseId;
            }
            
            $sql .= " ORDER BY dg.created_at DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the response
            $formattedGroups = array_map(function($group) {
                return [
                    'id' => intval($group['id']),
                    'title' => $group['title'],
                    'courseId' => intval($group['course_id']),
                    'courseName' => $group['course_name'],
                    'description' => $group['description'],
                    'dueDate' => $group['due_date'],
                    'numberOfGroups' => intval($group['number_of_groups']),
                    'memberCount' => intval($group['member_count']),
                    'topicCount' => intval($group['topic_count']),
                    'createdBy' => $group['creator_first_name'] . ' ' . $group['creator_last_name'],
                    'createdAt' => $group['created_at'],
                    'updatedAt' => $group['updated_at']
                ];
            }, $groups);
            
            echo json_encode([
                'status' => 'success',
                'data' => $formattedGroups
            ]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['name']) || !isset($data['course_id'])) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Name and course_id are required'
                ]);
                exit;
            }

            // Start transaction
            $conn->beginTransaction();

            try {
                // Insert discussion group
                $stmt = $conn->prepare("
                    INSERT INTO discussion_groups (
                        title,
                        course_id,
                        description,
                        due_date,
                        number_of_groups
                    ) VALUES (
                        :title,
                        :course_id,
                        :description,
                        :due_date,
                        :number_of_groups
                    )
                ");

                $stmt->execute([
                    ':title' => $data['name'],
                    ':course_id' => $data['course_id'],
                    ':description' => $data['description'] ?? null,
                    ':due_date' => $data['due_date'] ?? null,
                    ':number_of_groups' => $data['number_of_groups'] ?? 1
                ]);

                $groupId = $conn->lastInsertId();

                // Add creator as group member with teacher role
                $stmt = $conn->prepare("
                    INSERT INTO discussion_group_members (
                        group_id,
                        user_id,
                        role
                    ) VALUES (
                        :group_id,
                        :user_id,
                        'teacher'
                    )
                ");

                $stmt->execute([
                    ':group_id' => $groupId,
                    ':user_id' => $user['id']
                ]);

                // Commit transaction
                $conn->commit();

                // Fetch the created group
                $stmt = $conn->prepare("
                    SELECT 
                        dg.*,
                        c.name as course_name,
                        u.first_name as creator_first_name,
                        u.last_name as creator_last_name
                    FROM discussion_groups dg
                    LEFT JOIN courses c ON dg.course_id = c.id
                    LEFT JOIN users u ON u.id = :user_id
                    WHERE dg.id = :group_id
                ");

                $stmt->execute([
                    ':user_id' => $user['id'],
                    ':group_id' => $groupId
                ]);

                $group = $stmt->fetch(PDO::FETCH_ASSOC);

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Discussion group created successfully',
                    'data' => [
                        'id' => intval($group['id']),
                        'title' => $group['title'],
                        'courseId' => intval($group['course_id']),
                        'courseName' => $group['course_name'],
                        'description' => $group['description'],
                        'dueDate' => $group['due_date'],
                        'numberOfGroups' => intval($group['number_of_groups']),
                        'memberCount' => 1,
                        'topicCount' => 0,
                        'createdBy' => $group['creator_first_name'] . ' ' . $group['creator_last_name'],
                        'createdAt' => $group['created_at'],
                        'updatedAt' => $group['updated_at']
                    ]
                ]);
            } catch (PDOException $e) {
                // Rollback transaction
                $conn->rollBack();
                
                // Log the error
                error_log("Database error: " . $e->getMessage());
                
                // Check for specific error types
                if ($e->getCode() == '23000') { // Duplicate entry
                    http_response_code(409);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'A discussion group with this name already exists'
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Internal server error: ' . $e->getMessage()
                    ]);
                }
                exit;
            }
            break;

        case 'PUT':
            // Update discussion group
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('Group ID is required');
            }

            // Get authenticated user
            $user = getAuthenticatedUser();
            if (!$user) {
                throw new Exception('Unauthorized');
            }

            // Check if user is admin of the group
            $stmt = $conn->prepare("
                SELECT role FROM discussion_group_members 
                WHERE group_id = :group_id AND user_id = :user_id
            ");
            $stmt->execute([
                ':group_id' => $data['id'],
                ':user_id' => $user['id']
            ]);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$member || $member['role'] !== 'admin') {
                throw new Exception('Only group admins can update the group');
            }

            $updates = [];
            $params = [':id' => $data['id']];

            if (isset($data['name'])) {
                $updates[] = "title = :name";
                $params[':name'] = $data['name'];
            }

            if (isset($data['description'])) {
                $updates[] = "description = :description";
                $params[':description'] = $data['description'];
            }

            if (isset($data['due_date'])) {
                $updates[] = "due_date = :due_date";
                $params[':due_date'] = $data['due_date'];
            }

            if (isset($data['status'])) {
                $updates[] = "status = :status";
                $params[':status'] = $data['status'];
            }

            if (empty($updates)) {
                throw new Exception('No fields to update');
            }

            $sql = "UPDATE discussion_groups SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);

            echo json_encode([
                'status' => 'success',
                'message' => 'Discussion group updated successfully'
            ]);
            break;

        case 'DELETE':
            // Soft delete discussion group
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                throw new Exception('Group ID is required');
            }

            // Get authenticated user
            $user = getAuthenticatedUser();
            if (!$user) {
                throw new Exception('Unauthorized');
            }

            // Check if user is admin of the group
            $stmt = $conn->prepare("
                SELECT role FROM discussion_group_members 
                WHERE group_id = :group_id AND user_id = :user_id
            ");
            $stmt->execute([
                ':group_id' => $data['id'],
                ':user_id' => $user['id']
            ]);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$member || $member['role'] !== 'admin') {
                throw new Exception('Only group admins can delete the group');
            }

            $stmt = $conn->prepare("
                UPDATE discussion_groups 
                SET status = 'inactive' 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $data['id']]);

            echo json_encode([
                'status' => 'success',
                'message' => 'Discussion group deleted successfully'
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Method not allowed'
            ]);
            exit;
    }
} catch (PDOException $e) {
    // Log the error
    error_log("Database error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Log the error
    error_log("General error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error'
    ]);
}
?> 
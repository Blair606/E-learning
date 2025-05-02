<?php
require_once 'config/database.php';
require_once 'config/config.php';

header('Content-Type: application/json');

try {
    $db = getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'POST':
            // Create new discussion groups
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['title']) || !isset($data['course_id']) || !isset($data['number_of_groups']) || !isset($data['due_date'])) {
                throw new Exception('Missing required fields');
            }
            
            // Start transaction
            $db->beginTransaction();
            
            try {
                // Insert discussion group
                $stmt = $db->prepare("
                    INSERT INTO discussion_groups (
                        course_id, title, description, number_of_groups, due_date
                    ) VALUES (?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $data['course_id'],
                    $data['title'],
                    $data['description'] ?? '',
                    $data['number_of_groups'],
                    $data['due_date']
                ]);
                
                $group_id = $db->lastInsertId();
                
                // Get enrolled students for the course
                $stmt = $db->prepare("
                    SELECT u.id, u.first_name, u.last_name
                    FROM users u
                    JOIN course_enrollments ce ON ce.student_id = u.id
                    WHERE ce.course_id = ? AND ce.status = 'enrolled'
                ");
                
                $stmt->execute([$data['course_id']]);
                $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Calculate students per group
                $studentsPerGroup = ceil(count($students) / $data['number_of_groups']);
                
                // Distribute students across groups
                foreach ($students as $index => $student) {
                    $groupNumber = floor($index / $studentsPerGroup) + 1;
                    
                    $stmt = $db->prepare("
                        INSERT INTO discussion_group_members (
                            group_id, student_id, group_number
                        ) VALUES (?, ?, ?)
                    ");
                    
                    $stmt->execute([
                        $group_id,
                        $student['id'],
                        $groupNumber
                    ]);
                }
                
                $db->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Discussion groups created successfully',
                    'group_id' => $group_id
                ]);
                
            } catch (Exception $e) {
                $db->rollBack();
                throw $e;
            }
            break;
            
        case 'GET':
            // Get discussion groups
            $course_id = $_GET['course_id'] ?? null;
            
            if ($course_id) {
                $stmt = $db->prepare("
                    SELECT dg.*, c.title as course_name,
                           COUNT(DISTINCT dgm.student_id) as total_members
                    FROM discussion_groups dg
                    JOIN courses c ON c.id = dg.course_id
                    LEFT JOIN discussion_group_members dgm ON dgm.group_id = dg.id
                    WHERE dg.course_id = ?
                    GROUP BY dg.id
                    ORDER BY dg.created_at DESC
                ");
                
                $stmt->execute([$course_id]);
                $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get members for each group
                foreach ($groups as &$group) {
                    $stmt = $db->prepare("
                        SELECT u.id, u.first_name, u.last_name, dgm.group_number
                        FROM discussion_group_members dgm
                        JOIN users u ON u.id = dgm.student_id
                        WHERE dgm.group_id = ?
                        ORDER BY dgm.group_number, u.first_name
                    ");
                    
                    $stmt->execute([$group['id']]);
                    $group['members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                
                echo json_encode($groups);
            } else {
                throw new Exception('Course ID is required');
            }
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} 
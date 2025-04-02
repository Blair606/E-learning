<?php
require_once 'config/database.php';
require_once 'middleware/cors.php';

// Set content type to JSON
header('Content-Type: application/json');

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get the authorization header
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

// Verify admin token
if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No token provided']);
    exit;
}

try {
    $conn = getConnection();
    
    // Check if any users exist
    $stmt = $conn->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    
    // If no users exist, create a default admin user
    if ($userCount == 0) {
        $defaultAdmin = [
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'status' => 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password, role, status, created_at, updated_at) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $defaultAdmin['first_name'],
            $defaultAdmin['last_name'],
            $defaultAdmin['email'],
            $defaultAdmin['password'],
            $defaultAdmin['role'],
            $defaultAdmin['status'],
            $defaultAdmin['created_at'],
            $defaultAdmin['updated_at']
        ]);
    }
    
    // Verify token and get user data
    $stmt = $conn->prepare("SELECT * FROM users WHERE token = ?");
    $stmt->execute([$token]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied. Admin privileges required.']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        try {
            $stmt = $conn->prepare("SELECT * FROM users");
            $stmt->execute();
            $users = [];
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                // Convert snake_case to camelCase
                $user = [
                    'id' => $row['id'],
                    'firstName' => $row['first_name'],
                    'lastName' => $row['last_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'] ?? '',
                    'address' => $row['address'] ?? '',
                    'role' => $row['role'],
                    'status' => $row['status'],
                    'school' => $row['school'] ?? '',
                    'department' => $row['department'] ?? '',
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at']
                ];
                
                // Add role-specific fields
                if ($row['role'] === 'student') {
                    $user['studentId'] = $row['student_id'] ?? '';
                    $user['grade'] = $row['grade'] ?? '';
                    $user['enrollmentDate'] = $row['enrollment_date'] ?? '';
                    $user['specialization'] = $row['specialization'] ?? '';
                    $user['education'] = $row['education'] ?? '';
                } else if ($row['role'] === 'teacher') {
                    $user['teacherId'] = $row['teacher_id'] ?? '';
                    $user['specialization'] = $row['specialization'] ?? '';
                    $user['education'] = $row['education'] ?? '';
                    $user['experience'] = $row['experience'] ?? '';
                }
                
                $users[] = $user;
            }
            
            echo json_encode(['success' => true, 'data' => $users]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to fetch users: ' . $e->getMessage()]);
        }
        break;

    case 'PUT':
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid request data']);
                exit;
            }
            
            // Convert camelCase to snake_case for database
            $firstName = $data['firstName'];
            $lastName = $data['lastName'];
            $email = $data['email'];
            $phone = $data['phone'];
            $address = $data['address'];
            $role = $data['role'];
            $status = $data['status'];
            $school = $data['school'];
            $department = $data['department'];
            $id = $data['id'];
            
            // Build the update query based on role
            $updateFields = [
                "first_name = ?",
                "last_name = ?",
                "email = ?",
                "phone = ?",
                "address = ?",
                "role = ?",
                "status = ?",
                "school = ?",
                "department = ?"
            ];
            $params = [$firstName, $lastName, $email, $phone, $address, $role, $status, $school, $department];
            $types = "sssssssss";
            
            // Add role-specific fields
            if ($role === 'student') {
                $updateFields[] = "student_id = ?";
                $updateFields[] = "grade = ?";
                $updateFields[] = "enrollment_date = ?";
                $updateFields[] = "specialization = ?";
                $updateFields[] = "education = ?";
                $params[] = $data['studentId'];
                $params[] = $data['grade'];
                $params[] = $data['enrollmentDate'];
                $params[] = $data['specialization'];
                $params[] = $data['education'];
                $types .= "sssss";
            } else if ($role === 'teacher') {
                $updateFields[] = "teacher_id = ?";
                $updateFields[] = "specialization = ?";
                $updateFields[] = "education = ?";
                $updateFields[] = "experience = ?";
                $params[] = $data['teacherId'];
                $params[] = $data['specialization'];
                $params[] = $data['education'];
                $params[] = $data['experience'];
                $types .= "ssss";
            }
            
            // Add password if provided
            if (!empty($data['password'])) {
                $updateFields[] = "password = ?";
                $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
                $params[] = $hashedPassword;
                $types .= "s";
            }
            
            $params[] = $id;
            $types .= "i";
            
            $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update user']);
        }
        break;

    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User ID is required']);
                exit;
            }
            
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete user']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
} 
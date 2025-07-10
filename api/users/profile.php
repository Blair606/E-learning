<?php
require_once __DIR__ . '/../config/cors.php';
if (function_exists('handleCORS')) { handleCORS(); }

// Include database connection
require_once '../config/database.php';

// Include authentication middleware
require_once '../middleware/AuthMiddleware.php';

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Get user ID from query parameter
$userId = isset($_GET['id']) ? $_GET['id'] : null;

// Authenticate the request
$authPayload = AuthMiddleware::authenticate();

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        // Get user profile
        if ($userId) {
            try {
                $stmt = $conn->prepare("SELECT id, first_name, last_name, email, role, status, department, created_at FROM users WHERE id = ?");
                $stmt->bind_param("i", $userId);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows > 0) {
                    $user = $result->fetch_assoc();
                    echo json_encode([
                        'success' => true,
                        'data' => $user
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'User not found'
                    ]);
                }
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database error: ' . $e->getMessage()
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'User ID is required'
            ]);
        }
        break;
        
    case 'PUT':
        // Update user profile
        if ($userId) {
            // Get JSON data from request body
            $data = json_decode(file_get_contents('php://input'), true);
            
            if ($data) {
                try {
                    // Build the SQL query dynamically based on provided fields
                    $updateFields = [];
                    $types = '';
                    $params = [];
                    
                    if (isset($data['first_name'])) {
                        $updateFields[] = 'first_name = ?';
                        $types .= 's';
                        $params[] = $data['first_name'];
                    }
                    
                    if (isset($data['last_name'])) {
                        $updateFields[] = 'last_name = ?';
                        $types .= 's';
                        $params[] = $data['last_name'];
                    }
                    
                    if (isset($data['email'])) {
                        $updateFields[] = 'email = ?';
                        $types .= 's';
                        $params[] = $data['email'];
                    }
                    
                    if (isset($data['role'])) {
                        $updateFields[] = 'role = ?';
                        $types .= 's';
                        $params[] = $data['role'];
                    }
                    
                    if (isset($data['status'])) {
                        $updateFields[] = 'status = ?';
                        $types .= 's';
                        $params[] = $data['status'];
                    }
                    
                    if (isset($data['department'])) {
                        $updateFields[] = 'department = ?';
                        $types .= 's';
                        $params[] = $data['department'];
                    }
                    
                    if (count($updateFields) > 0) {
                        $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
                        $types .= 'i';
                        $params[] = $userId;
                        
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param($types, ...$params);
                        
                        if ($stmt->execute()) {
                            echo json_encode([
                                'success' => true,
                                'message' => 'User profile updated successfully'
                            ]);
                        } else {
                            throw new Exception("Error updating user: " . $stmt->error);
                        }
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'error' => 'No valid fields to update'
                        ]);
                    }
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Database error: ' . $e->getMessage()
                    ]);
                }
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid JSON data'
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'User ID is required'
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Method not allowed'
        ]);
        break;
}
?> 
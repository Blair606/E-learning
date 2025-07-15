<?php
require_once '../config/database.php';
require_once '../config/cors.php';
require_once '../middleware/AuthMiddleware.php';

handleCORS();
header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

$method = $_SERVER['REQUEST_METHOD'];

try {
    // Authenticate admin
    $authPayload = AuthMiddleware::authenticate();
    if (!isset($authPayload['role']) || $authPayload['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Access denied. Admin role required.']);
        exit();
    }

    $conn = getConnection();
    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    // Get course ID
    $courseId = null;
    if ($method === 'DELETE') {
        // Parse id from query string
        if (isset($_GET['id'])) {
            $courseId = intval($_GET['id']);
        } else {
            // Try to parse from body (for some clients)
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['id'])) {
                $courseId = intval($input['id']);
            }
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['id'])) {
            $courseId = intval($input['id']);
        }
        // Handle activate/deactivate
        if (isset($input['action']) && in_array($input['action'], ['activate', 'deactivate'])) {
            $status = $input['action'] === 'activate' ? 'active' : 'inactive';
            if (!$courseId) {
                throw new Exception('Course ID required for status change');
            }
            $stmt = $conn->prepare('UPDATE courses SET status = :status WHERE id = :id');
            $stmt->bindValue(':status', $status);
            $stmt->bindValue(':id', $courseId, PDO::PARAM_INT);
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Course status updated', 'status' => $status]);
            } else {
                throw new Exception('Failed to update course status');
            }
            exit();
        }
    }

    if (!$courseId) {
        throw new Exception('Course ID is required');
    }

    // Delete course
    $stmt = $conn->prepare('DELETE FROM courses WHERE id = :id');
    $stmt->bindValue(':id', $courseId, PDO::PARAM_INT);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Course deleted successfully']);
    } else {
        throw new Exception('Failed to delete course');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} 
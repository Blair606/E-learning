<?php
require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/ApiResponse.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            echo ApiResponse::error('No token provided', 401);
            exit;
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        // First try to validate as JWT token
        $payload = JWTHandler::validateToken($token);
        
        if ($payload) {
            return $payload;
        }
        
        // If JWT validation fails, try to validate as simple token
        require_once __DIR__ . '/../config/database.php';
        $conn = getConnection();
        
        $stmt = $conn->prepare("SELECT id, role FROM users WHERE token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo ApiResponse::error('Invalid or expired token', 401);
            exit;
        }
        
        return [
            'sub' => $user['id'],
            'role' => $user['role']
        ];
    }

    public static function requireRole($allowedRoles) {
        $payload = self::authenticate();
        
        if (!in_array($payload['role'], $allowedRoles)) {
            echo ApiResponse::error('Unauthorized access', 403);
            exit;
        }

        return $payload;
    }
} 
<?php
require_once __DIR__ . '/../utils/JWTHandler.php';
require_once __DIR__ . '/../utils/ApiResponse.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            if (function_exists('handleCORS')) { handleCORS(); }
            echo ApiResponse::error('No token provided', 401);
            exit;
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        if (empty($token)) {
            if (function_exists('handleCORS')) { handleCORS(); }
            echo ApiResponse::error('Empty token provided', 401);
            exit;
        }

        // First try to validate as JWT token
        $payload = JWTHandler::validateToken($token);
        
        if ($payload) {
            return $payload;
        }
        
        // If JWT validation fails, try to validate as simple token
        require_once __DIR__ . '/../config/database.php';
        $conn = getConnection();
        
        $stmt = $conn->prepare("SELECT id, role, email FROM users WHERE token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            if (function_exists('handleCORS')) { handleCORS(); }
            echo ApiResponse::error('Invalid or expired token', 401);
            exit;
        }
        
        return [
            'sub' => $user['id'],
            'role' => $user['role'],
            'email' => $user['email']
        ];
    }

    public static function requireRole($allowedRoles) {
        $payload = self::authenticate();
        
        if (!in_array($payload['role'], $allowedRoles)) {
            if (function_exists('handleCORS')) { handleCORS(); }
            echo ApiResponse::error('Unauthorized access - Invalid role', 403);
            exit;
        }

        return $payload;
    }
} 
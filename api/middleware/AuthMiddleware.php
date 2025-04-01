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
        $payload = JWTHandler::validateToken($token);

        if (!$payload) {
            echo ApiResponse::error('Invalid or expired token', 401);
            exit;
        }

        return $payload;
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
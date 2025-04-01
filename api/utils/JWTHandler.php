<?php
require_once __DIR__ . '/../config/config.php';

class JWTHandler {
    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    public static function generateToken($userId, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'sub' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + JWT_EXPIRY
        ]);

        $base64Header = self::base64UrlEncode($header);
        $base64Payload = self::base64UrlEncode($payload);

        $signature = hash_hmac('sha256', 
            $base64Header . "." . $base64Payload, 
            JWT_SECRET, 
            true
        );
        $base64Signature = self::base64UrlEncode($signature);

        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    public static function validateToken($token) {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return false;
            }

            $payload = json_decode(base64_decode($parts[1]), true);
            
            if ($payload['exp'] < time()) {
                return false;
            }

            return $payload;
        } catch (Exception $e) {
            return false;
        }
    }
} 
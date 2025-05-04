<?php
require_once __DIR__ . '/AuthMiddleware.php';

// Function to verify JWT token
function verifyToken($token) {
    if (!$token) {
        return false;
    }

    try {
        return AuthMiddleware::authenticate();
    } catch (Exception $e) {
        error_log("Token verification failed: " . $e->getMessage());
        return false;
    }
}

// Function to get user ID from token
function getUserIdFromToken($token) {
    if (!$token) {
        return null;
    }

    try {
        $payload = AuthMiddleware::authenticate();
        return $payload['sub'] ?? null;
    } catch (Exception $e) {
        error_log("Failed to get user ID from token: " . $e->getMessage());
        return null;
    }
}

// Function to check if user is admin
function isAdmin($token) {
    if (!$token) {
        return false;
    }

    try {
        $payload = AuthMiddleware::authenticate();
        return isset($payload['role']) && $payload['role'] === 'admin';
    } catch (Exception $e) {
        error_log("Failed to check admin status: " . $e->getMessage());
        return false;
    }
}

// Function to check if user is teacher
function isTeacher($token) {
    if (!$token) {
        return false;
    }

    try {
        $auth = new AuthMiddleware();
        $decoded = $auth->verifyToken($token);
        return isset($decoded->role) && $decoded->role === 'teacher';
    } catch (Exception $e) {
        error_log("Failed to check teacher status: " . $e->getMessage());
        return false;
    }
}

// Function to check if user is student
function isStudent($token) {
    if (!$token) {
        return false;
    }

    try {
        $auth = new AuthMiddleware();
        $decoded = $auth->verifyToken($token);
        return isset($decoded->role) && $decoded->role === 'student';
    } catch (Exception $e) {
        error_log("Failed to check student status: " . $e->getMessage());
        return false;
    }
}
?> 
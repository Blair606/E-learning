<?php
require_once 'config/database.php';

try {
    $conn = getConnection();
    error_log("Database connection established");
    
    // Test teacher credentials
    $email = 'teacher@example.com';
    $password = 'teacher123';
    
    // Get user by email
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "Error: Teacher account not found\n";
        exit;
    }
    
    echo "Found teacher account:\n";
    echo "ID: " . $user['id'] . "\n";
    echo "Email: " . $user['email'] . "\n";
    echo "Role: " . $user['role'] . "\n";
    echo "Status: " . $user['status'] . "\n";
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        echo "\nPassword verification successful!\n";
        
        // Generate token
        $token = bin2hex(random_bytes(32));
        
        // Update user token
        $stmt = $conn->prepare("UPDATE users SET token = ? WHERE id = ?");
        $stmt->execute([$token, $user['id']]);
        
        echo "Token generated and updated: " . $token . "\n";
    } else {
        echo "\nError: Password verification failed\n";
    }
    
} catch (Exception $e) {
    error_log("Error in test_login.php: " . $e->getMessage());
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
<?php
require_once 'config/database.php';

header('Content-Type: application/json');

try {
    // Test database connection
    $conn = getConnection();
    if (!$conn) {
        throw new Exception("Failed to connect to database");
    }

    // Check if users table exists
    $tables = $conn->query("SHOW TABLES LIKE 'users'")->fetchAll();
    if (empty($tables)) {
        throw new Exception("Users table does not exist");
    }

    // Check table structure
    $columns = $conn->query("DESCRIBE users")->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'table_exists' => true,
        'columns' => $columns
    ]);

} catch (Exception $e) {
    error_log("Database test error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 
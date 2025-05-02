<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/php_errors.log');

require_once 'database.php';

header('Content-Type: application/json');

try {
    $db = getConnection();
    
    // Read the SQL file
    $sql = file_get_contents('database.sql');
    
    if ($sql === false) {
        throw new Exception('Could not read database.sql file');
    }
    
    // Split the SQL file into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    // Execute each statement
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $db->exec($statement);
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Database tables updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 
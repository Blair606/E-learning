<?php
require_once 'database.php';

try {
    $db = getConnection();
    
    // Check if tables exist
    $tables = ['schools', 'departments', 'school_departments'];
    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '$table'");
        if ($result->rowCount() === 0) {
            echo "Table '$table' does not exist.\n";
        } else {
            echo "Table '$table' exists.\n";
            // Show table structure
            $columns = $db->query("SHOW COLUMNS FROM $table");
            echo "Columns:\n";
            while ($column = $columns->fetch(PDO::FETCH_ASSOC)) {
                echo "- {$column['Field']}: {$column['Type']}\n";
            }
            echo "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error checking tables: " . $e->getMessage() . "\n";
}
?> 
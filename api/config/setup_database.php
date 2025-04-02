<?php
require_once 'database.php';

try {
    // Create database and tables
    ensureDatabaseExists();
    echo "Database and tables created successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 
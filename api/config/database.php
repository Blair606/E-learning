<?php
function getConnection() {
    try {
        error_log("Attempting to connect to database with host: localhost, dbname: e_learning");
        
        $conn = new PDO(
            "mysql:host=localhost;dbname=e_learning;charset=utf8",
            "root",
            "",
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        
        error_log("Database connection successful");
        return $conn;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        return false; // Return false instead of throwing exception
    }
}
?> 
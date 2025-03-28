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
        
        // Test the connection by executing a simple query
        $conn->query("SELECT 1");
        
        error_log("Database connection successful");
        return $conn;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        throw new Exception("Database connection failed: " . $e->getMessage());
    }
}

// Function to ensure database and tables exist
function ensureDatabaseExists() {
    try {
        // First connect without database name to create it if it doesn't exist
        $conn = new PDO(
            "mysql:host=localhost",
            "root",
            "",
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        // Create database if it doesn't exist
        $conn->exec("CREATE DATABASE IF NOT EXISTS e_learning");
        $conn->exec("USE e_learning");
        
        // Read and execute the SQL file
        $sql = file_get_contents(__DIR__ . '/database.sql');
        $conn->exec($sql);
        
        error_log("Database and tables created/verified successfully");
        return true;
    } catch(PDOException $e) {
        error_log("Failed to create database/tables: " . $e->getMessage());
        throw new Exception("Failed to create database/tables: " . $e->getMessage());
    }
}
?> 
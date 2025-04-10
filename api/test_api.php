<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include database configuration
include_once 'config/database.php';

try {
    // Get database connection
    $db = getConnection();
    
    echo "<h2>Database Connection Test</h2>";
    echo "<p>Database connection successful!</p>";
    
    // Test schools table
    echo "<h2>Schools Table Test</h2>";
    $stmt = $db->query("SELECT COUNT(*) as count FROM schools");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of schools in database: " . $result['count'] . "</p>";
    
    if ($result['count'] > 0) {
        $stmt = $db->query("SELECT id, name, code FROM schools LIMIT 5");
        $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Sample Schools:</h3>";
        echo "<ul>";
        foreach ($schools as $school) {
            echo "<li>ID: " . $school['id'] . ", Name: " . $school['name'] . ", Code: " . $school['code'] . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No schools found in the database.</p>";
    }
    
    // Test departments table
    echo "<h2>Departments Table Test</h2>";
    $stmt = $db->query("SELECT COUNT(*) as count FROM departments");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of departments in database: " . $result['count'] . "</p>";
    
    if ($result['count'] > 0) {
        $stmt = $db->query("SELECT id, name, code, school_id FROM departments LIMIT 5");
        $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Sample Departments:</h3>";
        echo "<ul>";
        foreach ($departments as $department) {
            echo "<li>ID: " . $department['id'] . ", Name: " . $department['name'] . ", Code: " . $department['code'] . ", School ID: " . $department['school_id'] . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No departments found in the database.</p>";
    }
    
    // Test users table
    echo "<h2>Users Table Test</h2>";
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Number of users in database: " . $result['count'] . "</p>";
    
    if ($result['count'] > 0) {
        $stmt = $db->query("SELECT id, email, first_name, last_name, role, status FROM users LIMIT 5");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Sample Users:</h3>";
        echo "<ul>";
        foreach ($users as $user) {
            echo "<li>ID: " . $user['id'] . ", Name: " . $user['first_name'] . " " . $user['last_name'] . ", Email: " . $user['email'] . ", Role: " . $user['role'] . ", Status: " . $user['status'] . "</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>No users found in the database.</p>";
    }
    
    // Test API endpoints
    echo "<h2>API Endpoints Test</h2>";
    
    // Function to make a request to an API endpoint
    function testApiEndpoint($url) {
        echo "Testing API endpoint: $url\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            echo "Error: " . curl_error($ch) . "\n";
        } else {
            echo "HTTP Status Code: $httpCode\n";
            echo "Response:\n";
            
            // Try to decode as JSON
            $jsonResponse = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                echo json_encode($jsonResponse, JSON_PRETTY_PRINT) . "\n";
                
                // Check if the response has the expected structure
                if (strpos($url, 'schools') !== false) {
                    if (isset($jsonResponse['schools']) && is_array($jsonResponse['schools'])) {
                        echo "Schools API response is valid. Found " . count($jsonResponse['schools']) . " schools.\n";
                    } else {
                        echo "Schools API response is missing 'schools' array.\n";
                    }
                } else if (strpos($url, 'departments') !== false) {
                    if (isset($jsonResponse['departments']) && is_array($jsonResponse['departments'])) {
                        echo "Departments API response is valid. Found " . count($jsonResponse['departments']) . " departments.\n";
                    } else {
                        echo "Departments API response is missing 'departments' array.\n";
                    }
                }
            } else {
                echo "Raw response (not valid JSON):\n$response\n";
            }
        }
        
        curl_close($ch);
        echo "\n-----------------------------------\n\n";
    }

    // Test schools API
    testApiEndpoint('http://localhost/E-learning/api/schools/index.php');

    // Test departments API
    testApiEndpoint('http://localhost/E-learning/api/departments/index.php');
    
} catch (Exception $e) {
    echo "<h2>Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
}
?> 
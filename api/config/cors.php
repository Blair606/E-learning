<?php
// CORS Configuration
function handleCORS() {
    // Allow from React development server and all localhost ports for development
    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1',
        'http://localhost/E-learning'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // For development, allow any origin
    header("Access-Control-Allow-Origin: $origin");
    
    // Allow credentials
    header('Access-Control-Allow-Credentials: true');
    
    // Allow specific methods
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    
    // Allow specific headers
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    
    // Set max age for preflight requests
    header('Access-Control-Max-Age: 3600');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Set status code to 200 for preflight requests
        http_response_code(200);
        // End the request
        exit();
    }
}

// Automatically call the function when this file is included
handleCORS();
?>
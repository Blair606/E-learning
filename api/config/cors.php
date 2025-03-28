<?php
// CORS Configuration
function handleCORS() {
    // Allow from React development server
    $allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost/E-learning'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
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
?> 
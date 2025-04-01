<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'e_learning');
define('DB_USER', 'root');
define('DB_PASS', '');

// Application configuration
define('APP_URL', 'http://localhost:5173');
define('API_URL', 'http://localhost/api');

// JWT configuration
define('JWT_SECRET', 'your-secret-key-here');
define('JWT_EXPIRY', 86400); // 24 hours in seconds

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Timezone
date_default_timezone_set('UTC'); 
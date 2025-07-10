<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$response = [
    'success' => false,
    'stats' => [],
    'error' => ''
];

try {
    $pdo = getConnection();
    // Total Students
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    $totalStudents = $stmt->fetchColumn();

    // Total Teachers
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'teacher'");
    $totalTeachers = $stmt->fetchColumn();

    // Active Courses
    $stmt = $pdo->query("SELECT COUNT(*) FROM courses WHERE status = 'active'");
    $activeCourses = $stmt->fetchColumn();

    // Departments
    $stmt = $pdo->query("SELECT COUNT(*) FROM departments WHERE status = 'active'");
    $departments = $stmt->fetchColumn();

    // Total Revenue (sum of all payments in a 'payments' table if exists, else 0)
    $totalRevenue = 0;
    if ($pdo->query("SHOW TABLES LIKE 'payments'")->rowCount() > 0) {
        $stmt = $pdo->query("SELECT SUM(amount) FROM payments WHERE status = 'completed'");
        $totalRevenue = $stmt->fetchColumn() ?: 0;
    }

    // Pending Payments (sum of all pending payments in a 'payments' table if exists, else 0)
    $pendingPayments = 0;
    if ($pdo->query("SHOW TABLES LIKE 'payments'")->rowCount() > 0) {
        $stmt = $pdo->query("SELECT SUM(amount) FROM payments WHERE status = 'pending'");
        $pendingPayments = $stmt->fetchColumn() ?: 0;
    }

    $response['success'] = true;
    $response['stats'] = [
        'totalStudents' => (int)$totalStudents,
        'totalTeachers' => (int)$totalTeachers,
        'activeCourses' => (int)$activeCourses,
        'departments' => (int)$departments,
        'totalRevenue' => (float)$totalRevenue,
        'pendingPayments' => (float)$pendingPayments
    ];
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response); 
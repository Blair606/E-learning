<?php
require_once '../config/cors.php';
handleCORS();
header('Content-Type: application/json');

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing or invalid user_id.'
    ]);
    exit;
}

// TODO: Replace this with real financial data from your database
$financialStatus = [
    'tuitionStatus' => 'Pending Payment',
    'semesterFee' => 45000,
    'hostelFee' => [
        'amount' => 15000,
        'status' => 'Optional',
        'deadline' => '2024-04-01'
    ],
    'retakesFee' => [
        'amountPerUnit' => 7500,
        'pendingUnits' => [
            [ 'code' => 'CS201', 'name' => 'Physics', 'amount' => 7500 ]
        ]
    ],
    'paymentHistory' => [
        [ 'id' => 1, 'type' => 'Semester Fee', 'amount' => 45000, 'date' => '2024-01-15', 'status' => 'Paid' ],
        [ 'id' => 2, 'type' => 'Hostel Fee', 'amount' => 15000, 'date' => '2024-01-15', 'status' => 'Paid' ]
    ],
    'nextPaymentDeadline' => '2024-04-01'
];

http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => $financialStatus
]); 
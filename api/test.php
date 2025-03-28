<?php
// Test script for E-learning API

// Function to make API requests
function makeRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = array('Content-Type: application/json');
    if($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return array(
        'code' => $httpCode,
        'data' => json_decode($response, true)
    );
}

// Base URL
$baseUrl = 'http://localhost/E-learning/api';

echo "Starting API tests...\n\n";

// 1. Register a student
echo "1. Registering a student...\n";
$studentData = array(
    'email' => 'teststudent@example.com',
    'password' => 'password123',
    'role' => 'student'
);
$response = makeRequest($baseUrl . '/users', 'POST', $studentData);
echo "Response code: " . $response['code'] . "\n";
echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";

// 2. Register a teacher
echo "2. Registering a teacher...\n";
$teacherData = array(
    'email' => 'testteacher@example.com',
    'password' => 'password123',
    'role' => 'teacher'
);
$response = makeRequest($baseUrl . '/users', 'POST', $teacherData);
echo "Response code: " . $response['code'] . "\n";
echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";

// 3. Login as teacher
echo "3. Logging in as teacher...\n";
$loginData = array(
    'email' => 'testteacher@example.com',
    'password' => 'password123'
);
$response = makeRequest($baseUrl . '/auth/login', 'POST', $loginData);
echo "Response code: " . $response['code'] . "\n";
echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";

if($response['code'] === 200) {
    $teacherToken = $response['data']['token'];
    
    // 4. Create a course
    echo "4. Creating a course...\n";
    $courseData = array(
        'title' => 'Test Course',
        'description' => 'This is a test course'
    );
    $response = makeRequest($baseUrl . '/courses', 'POST', $courseData, $teacherToken);
    echo "Response code: " . $response['code'] . "\n";
    echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
    
    if($response['code'] === 201) {
        $courseId = $response['data']['id'];
        
        // 5. Create an assignment
        echo "5. Creating an assignment...\n";
        $assignmentData = array(
            'course_id' => $courseId,
            'title' => 'Test Assignment',
            'description' => 'This is a test assignment',
            'due_date' => date('Y-m-d H:i:s', strtotime('+1 week'))
        );
        $response = makeRequest($baseUrl . '/assignments', 'POST', $assignmentData, $teacherToken);
        echo "Response code: " . $response['code'] . "\n";
        echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
        
        if($response['code'] === 201) {
            $assignmentId = $response['data']['id'];
            
            // 6. Login as student
            echo "6. Logging in as student...\n";
            $loginData = array(
                'email' => 'teststudent@example.com',
                'password' => 'password123'
            );
            $response = makeRequest($baseUrl . '/auth/login', 'POST', $loginData);
            echo "Response code: " . $response['code'] . "\n";
            echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
            
            if($response['code'] === 200) {
                $studentToken = $response['data']['token'];
                
                // 7. Enroll in course
                echo "7. Enrolling in course...\n";
                $enrollmentData = array(
                    'course_id' => $courseId
                );
                $response = makeRequest($baseUrl . '/enrollments', 'POST', $enrollmentData, $studentToken);
                echo "Response code: " . $response['code'] . "\n";
                echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
                
                // 8. Get course assignments
                echo "8. Getting course assignments...\n";
                $response = makeRequest($baseUrl . '/assignments?course_id=' . $courseId, 'GET', null, $studentToken);
                echo "Response code: " . $response['code'] . "\n";
                echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
                
                // 9. Login back as teacher to grade assignment
                echo "9. Logging back in as teacher...\n";
                $response = makeRequest($baseUrl . '/auth/login', 'POST', $loginData);
                echo "Response code: " . $response['code'] . "\n";
                echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
                
                if($response['code'] === 200) {
                    $teacherToken = $response['data']['token'];
                    
                    // 10. Create grade
                    echo "10. Creating grade...\n";
                    $gradeData = array(
                        'student_id' => $response['data']['user']['id'],
                        'assignment_id' => $assignmentId,
                        'score' => 85,
                        'feedback' => 'Good work!'
                    );
                    $response = makeRequest($baseUrl . '/grades', 'POST', $gradeData, $teacherToken);
                    echo "Response code: " . $response['code'] . "\n";
                    echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
                }
            }
        }
    }
    
    // 11. Logout
    echo "11. Logging out...\n";
    $response = makeRequest($baseUrl . '/auth/logout', 'POST', null, $teacherToken);
    echo "Response code: " . $response['code'] . "\n";
    echo "Response data: " . json_encode($response['data'], JSON_PRETTY_PRINT) . "\n\n";
}

echo "API tests completed.\n";
?> 
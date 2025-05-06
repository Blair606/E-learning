<?php
require_once '../config/database.php';

try {
    $conn = getConnection();
    
    // Sample course content data
    $sampleContent = [
        [
            'course_id' => 6,
            'title' => 'Introduction to the Course',
            'content' => 'Welcome to this course! In this module, we will cover the fundamental concepts and principles.',
            'type' => 'text',
            'order_number' => 1,
            'status' => 'active'
        ],
        [
            'course_id' => 6,
            'title' => 'Course Overview',
            'content' => 'This course is designed to provide a comprehensive understanding of the subject matter.',
            'type' => 'text',
            'order_number' => 2,
            'status' => 'active'
        ],
        [
            'course_id' => 6,
            'title' => 'Getting Started Quiz',
            'content' => 'Test your understanding of the basic concepts with this quiz.',
            'type' => 'quiz',
            'order_number' => 3,
            'status' => 'active'
        ]
    ];
    
    // Insert sample content
    $stmt = $conn->prepare("
        INSERT INTO course_content (course_id, title, content, type, order_number, status)
        VALUES (:course_id, :title, :content, :type, :order_number, :status)
    ");
    
    foreach ($sampleContent as $content) {
        $stmt->execute($content);
    }
    
    echo "Sample course content inserted successfully!";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?> 
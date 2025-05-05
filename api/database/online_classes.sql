-- Table for scheduled online classes
CREATE TABLE IF NOT EXISTS online_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_id INT NOT NULL,
    instructor_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    meeting_link VARCHAR(255),
    status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for class recordings
CREATE TABLE IF NOT EXISTS class_recordings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    recording_url VARCHAR(255) NOT NULL,
    duration INT COMMENT 'Duration in minutes',
    thumbnail_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES online_classes(id) ON DELETE CASCADE
);

-- Table for class participants
CREATE TABLE IF NOT EXISTS class_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('host', 'participant') DEFAULT 'participant',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    attendance_status ENUM('present', 'absent', 'late') DEFAULT 'present',
    FOREIGN KEY (class_id) REFERENCES online_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (class_id, user_id)
);

-- Table for class materials
CREATE TABLE IF NOT EXISTS class_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT COMMENT 'Size in bytes',
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES online_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for class chat messages
CREATE TABLE IF NOT EXISTS class_chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES online_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_online_classes_course ON online_classes(course_id);
CREATE INDEX idx_online_classes_instructor ON online_classes(instructor_id);
CREATE INDEX idx_online_classes_status ON online_classes(status);
CREATE INDEX idx_class_participants_user ON class_participants(user_id);
CREATE INDEX idx_class_materials_class ON class_materials(class_id);
CREATE INDEX idx_class_chat_messages_class ON class_chat_messages(class_id); 
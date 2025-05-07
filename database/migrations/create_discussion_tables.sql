-- Create discussion_groups table
CREATE TABLE IF NOT EXISTS discussion_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    course_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Create discussion_group_members table
CREATE TABLE IF NOT EXISTS discussion_group_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('member', 'moderator') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES discussion_groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create discussion_topics table
CREATE TABLE IF NOT EXISTS discussion_topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES discussion_groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create discussion_replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    topic_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES discussion_topics(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create discussion_read_status table
CREATE TABLE IF NOT EXISTS discussion_read_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    reply_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reply_id) REFERENCES discussion_replies(id)
);

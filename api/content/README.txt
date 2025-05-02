# Course Content API

## Table: course_contents

```
CREATE TABLE course_contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Table: course_questions

```
CREATE TABLE course_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_id INT,
    question_text TEXT,
    options JSON,
    correct_answer INT
);
```

- `options` is a JSON array of strings.
- `correct_answer` is the index of the correct option. 
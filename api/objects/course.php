<?php
class Course {
    private $conn;
    private $table_name = "courses";
    private $content_table = "course_content";

    public $id;
    public $name;
    public $code;
    public $description;
    public $credits;
    public $status;
    public $department;
    public $school;
    public $instructor_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getContent() {
        // First check if the course exists
        $check_query = "SELECT id FROM " . $this->table_name . " WHERE id = :course_id";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(":course_id", $this->id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() == 0) {
            throw new Exception("Course not found");
        }

        // Then get the content
        $query = "SELECT 
                    id,
                    course_id,
                    title,
                    content,
                    created_at,
                    updated_at
                FROM 
                    " . $this->content_table . "
                WHERE 
                    course_id = :course_id
                ORDER BY 
                    created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":course_id", $this->id);
        $stmt->execute();

        return $stmt;
    }

    public function getSchedule() {
        $query = "SELECT 
                    day,
                    time,
                    duration
                FROM 
                    course_schedule
                WHERE 
                    course_id = :course_id
                ORDER BY 
                    FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":course_id", $this->id);
        $stmt->execute();

        return $stmt;
    }

    public function getPrerequisites() {
        $query = "SELECT 
                    prerequisite
                FROM 
                    course_prerequisites
                WHERE 
                    course_id = :course_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":course_id", $this->id);
        $stmt->execute();

        return $stmt;
    }
}
?> 
<?php
class Material {
    // DB stuff
    private $conn;
    private $table = 'class_materials';

    // Material Properties
    public $id;
    public $class_id;
    public $title;
    public $description;
    public $file_url;
    public $file_type;
    public $file_size;
    public $uploader_id;
    public $material_type;
    public $created_at;
    public $updated_at;

    // Constructor with DB
    public function __construct($db) {
        $this->conn = $db;
    }

    // Get Materials by Class ID
    public function getMaterialsByClassId($class_id) {
        // Create query
        $query = 'SELECT
            id,
            class_id,
            title,
            description,
            file_url,
            file_type,
            file_size,
            uploader_id,
            material_type,
            created_at,
            updated_at
        FROM
            ' . $this->table . '
        WHERE
            class_id = :class_id
        ORDER BY
            created_at DESC';

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind ID
        $stmt->bindParam(':class_id', $class_id);

        // Execute query
        $stmt->execute();

        return $stmt;
    }

    // Get Single Material
    public function read_single() {
        // Create query
        $query = 'SELECT
            id,
            class_id,
            title,
            description,
            file_url,
            file_type,
            file_size,
            uploader_id,
            material_type,
            created_at,
            updated_at
        FROM
            ' . $this->table . '
        WHERE
            id = :id
        LIMIT 0,1';

        // Prepare statement
        $stmt = $this->conn->prepare($query);

        // Bind ID
        $stmt->bindParam(':id', $this->id);

        // Execute query
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row) {
            return $row;
        }

        return false;
    }
}

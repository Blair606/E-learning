<?php
require_once 'database.php';

try {
    $db = getConnection();
    $results = [];
    
    // Read and execute the SQL queries
    $sql = file_get_contents('check_relationships.sql');
    $queries = array_filter(explode(';', $sql));
    
    foreach ($queries as $query) {
        if (trim($query) === '') continue;
        
        $result = $db->query($query);
        if ($result) {
            $results[] = [
                'query' => $query,
                'data' => $result->fetchAll(PDO::FETCH_ASSOC)
            ];
        }
    }
    
    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
    exit(1);
}
?> 
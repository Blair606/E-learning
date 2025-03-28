<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

try {
    $db = getConnection();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed"));
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// Verify token for all requests except POST (register)
if($method !== 'POST') {
    $headers = getallheaders();
    if(!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(array("message" => "No token provided."));
        exit();
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $query = "SELECT id FROM users WHERE token = :token";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":token", $token);
    $stmt->execute();
    
    if($stmt->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid token."));
        exit();
    }
}

switch($method) {
    case 'GET':
        if(isset($_GET['id'])) {
            // Get single user
            $query = "SELECT id, email, role, created_at FROM users WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $_GET['id']);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                http_response_code(200);
                echo json_encode($row);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "User not found."));
            }
        } else {
            // Get all users
            $query = "SELECT id, email, role, created_at FROM users";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $users = array();
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($users, $row);
            }
            
            http_response_code(200);
            echo json_encode($users);
        }
        break;
        
    case 'POST':
        // Create new user
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->email) && !empty($data->password)) {
            $query = "INSERT INTO users (email, password, role) VALUES (:email, :password, :role)";
            $stmt = $db->prepare($query);
            
            $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
            $role = isset($data->role) ? $data->role : 'student';
            
            $stmt->bindParam(":email", $data->email);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":role", $role);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array(
                    "message" => "User created successfully.",
                    "id" => $db->lastInsertId()
                ));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create user."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
        }
        break;
        
    case 'PUT':
        // Update user
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $query = "UPDATE users SET email = :email, role = :role";
            $params = array(":id" => $data->id, ":email" => $data->email, ":role" => $data->role);
            
            if(!empty($data->password)) {
                $query .= ", password = :password";
                $params[":password"] = password_hash($data->password, PASSWORD_DEFAULT);
            }
            
            $query .= " WHERE id = :id";
            $stmt = $db->prepare($query);
            
            if($stmt->execute($params)) {
                http_response_code(200);
                echo json_encode(array("message" => "User updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update user."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update user. Data is incomplete."));
        }
        break;
        
    case 'DELETE':
        // Delete user
        $data = json_decode(file_get_contents("php://input"));
        
        if(!empty($data->id)) {
            $query = "DELETE FROM users WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "User deleted successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to delete user."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to delete user. Data is incomplete."));
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?> 
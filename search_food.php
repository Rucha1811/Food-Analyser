<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' || $method === 'POST') {
    $query = isset($_GET['q']) ? $_GET['q'] : (isset($_POST['q']) ? $_POST['q'] : '');
    
    if (empty($query)) {
        echo json_encode(['error' => 'Query parameter is required']);
        exit();
    }
    
    $conn = getDBConnection();
    $searchTerm = $conn->real_escape_string($query);
    
    // Search for food items
    $sql = "SELECT * FROM food_items WHERE name LIKE '%$searchTerm%' LIMIT 10";
    $result = $conn->query($sql);
    
    $foods = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $foods[] = $row;
        }
    }
    
    closeDBConnection($conn);
    
    echo json_encode([
        'success' => true,
        'count' => count($foods),
        'foods' => $foods
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>


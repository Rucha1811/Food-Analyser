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
$conn = getDBConnection();

if ($method === 'GET' || $method === 'POST') {
    $recipeId = isset($_GET['recipe_id']) ? intval($_GET['recipe_id']) : (isset($_POST['recipe_id']) ? intval($_POST['recipe_id']) : 0);
    
    if ($recipeId <= 0) {
        echo json_encode(['error' => 'Recipe ID is required']);
        exit();
    }
    
    $sql = "SELECT ingredient_name, quantity FROM recipe_ingredients WHERE recipe_id = $recipeId";
    $result = $conn->query($sql);
    
    $items = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }
    
    closeDBConnection($conn);
    
    echo json_encode([
        'success' => true,
        'count' => count($items),
        'items' => $items
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>


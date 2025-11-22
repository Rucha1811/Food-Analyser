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
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : (isset($_POST['user_id']) ? intval($_POST['user_id']) : 0);
    $date = isset($_GET['date']) ? $_GET['date'] : (isset($_POST['date']) ? $_POST['date'] : date('Y-m-d'));
    
    if ($userId <= 0) {
        echo json_encode(['success' => false, 'error' => 'User ID is required']);
        exit();
    }
    
    $date = $conn->real_escape_string($date);
    
    $sql = "SELECT ml.*, 
            r.name as recipe_name,
            f.name as food_name
            FROM meal_log ml
            LEFT JOIN recipes r ON ml.recipe_id = r.recipe_id
            LEFT JOIN food_items f ON ml.food_id = f.food_id
            WHERE ml.user_id = $userId AND ml.date = '$date'
            ORDER BY ml.logged_at DESC";
    
    $result = $conn->query($sql);
    
    $meals = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $meals[] = $row;
        }
    }
    
    closeDBConnection($conn);
    
    echo json_encode([
        'success' => true,
        'count' => count($meals),
        'meals' => $meals
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>


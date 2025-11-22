<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $userId = isset($data['user_id']) ? intval($data['user_id']) : 1;
    $recipeId = isset($data['recipe_id']) ? intval($data['recipe_id']) : null;
    $foodId = isset($data['food_id']) ? intval($data['food_id']) : null;
    $mealType = isset($data['meal_type']) ? $data['meal_type'] : 'lunch';
    $date = isset($data['date']) ? $data['date'] : date('Y-m-d');
    $quantity = isset($data['quantity']) ? floatval($data['quantity']) : 1;
    
    if (!$recipeId && !$foodId) {
        echo json_encode(['error' => 'Either recipe_id or food_id is required']);
        exit();
    }
    
    $conn = getDBConnection();
    
    // Get calories
    $calories = 0;
    if ($recipeId) {
        $calSql = "SELECT calories FROM recipes WHERE recipe_id = $recipeId";
        $calResult = $conn->query($calSql);
        if ($calResult && $calResult->num_rows > 0) {
            $calRow = $calResult->fetch_assoc();
            $calories = floatval($calRow['calories']) * $quantity;
        }
    } elseif ($foodId) {
        $calSql = "SELECT calories FROM food_items WHERE food_id = $foodId";
        $calResult = $conn->query($calSql);
        if ($calResult && $calResult->num_rows > 0) {
            $calRow = $calResult->fetch_assoc();
            $calories = floatval($calRow['calories']) * $quantity;
        }
    }
    
    $recipeIdSql = $recipeId ? $recipeId : 'NULL';
    $foodIdSql = $foodId ? $foodId : 'NULL';
    $mealType = $conn->real_escape_string($mealType);
    $date = $conn->real_escape_string($date);
    
    $sql = "INSERT INTO meal_log (user_id, recipe_id, food_id, meal_type, date, quantity, calories) 
            VALUES ($userId, $recipeIdSql, $foodIdSql, '$mealType', '$date', $quantity, $calories)";
    
    if ($conn->query($sql)) {
        closeDBConnection($conn);
        echo json_encode(['success' => true, 'message' => 'Meal logged successfully', 'calories' => $calories]);
    } else {
        closeDBConnection($conn);
        echo json_encode(['error' => 'Failed to log meal: ' . $conn->error]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>


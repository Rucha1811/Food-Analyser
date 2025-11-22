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
    
    $userId = isset($data['user_id']) ? intval($data['user_id']) : 1; // Default to user 1 for demo
    $recipeId = isset($data['recipe_id']) ? intval($data['recipe_id']) : 0;
    
    if ($recipeId <= 0) {
        echo json_encode(['error' => 'Recipe ID is required']);
        exit();
    }
    
    $conn = getDBConnection();
    
    // Check if already saved
    $checkSql = "SELECT * FROM user_saved_recipes WHERE user_id = $userId AND recipe_id = $recipeId";
    $checkResult = $conn->query($checkSql);
    
    if ($checkResult && $checkResult->num_rows > 0) {
        closeDBConnection($conn);
        echo json_encode(['success' => true, 'message' => 'Recipe already saved', 'already_saved' => true]);
        exit();
    }
    
    // Save recipe
    $sql = "INSERT INTO user_saved_recipes (user_id, recipe_id) VALUES ($userId, $recipeId)";
    
    if ($conn->query($sql)) {
        closeDBConnection($conn);
        echo json_encode(['success' => true, 'message' => 'Recipe saved successfully']);
    } else {
        closeDBConnection($conn);
        echo json_encode(['error' => 'Failed to save recipe: ' . $conn->error]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>


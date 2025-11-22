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
    $recipeId = isset($_GET['id']) ? intval($_GET['id']) : (isset($_POST['id']) ? intval($_POST['id']) : 0);
    
    if ($recipeId <= 0) {
        echo json_encode(['error' => 'Recipe ID is required']);
        exit();
    }
    
    $sql = "SELECT * FROM recipes WHERE recipe_id = $recipeId";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $recipe = $result->fetch_assoc();
        
        // Get ingredients list
        $ingredientsSql = "SELECT ingredient_name, quantity FROM recipe_ingredients WHERE recipe_id = $recipeId";
        $ingredientsResult = $conn->query($ingredientsSql);
        $ingredients = [];
        if ($ingredientsResult && $ingredientsResult->num_rows > 0) {
            while ($ing = $ingredientsResult->fetch_assoc()) {
                $ingredients[] = $ing;
            }
        }
        $recipe['ingredients_list'] = $ingredients;
        
        closeDBConnection($conn);
        
        echo json_encode([
            'success' => true,
            'recipe' => $recipe
        ]);
    } else {
        closeDBConnection($conn);
        echo json_encode(['error' => 'Recipe not found']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>


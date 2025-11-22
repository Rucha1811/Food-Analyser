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
    
    if ($userId <= 0) {
        echo json_encode(['success' => false, 'error' => 'User ID is required']);
        exit();
    }
    
    $sql = "SELECT r.* FROM recipes r
            INNER JOIN user_saved_recipes usr ON r.recipe_id = usr.recipe_id
            WHERE usr.user_id = $userId
            ORDER BY usr.saved_at DESC";
    
    $result = $conn->query($sql);
    
    $recipes = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Get ingredients list
            $ingredientsSql = "SELECT ingredient_name, quantity FROM recipe_ingredients WHERE recipe_id = " . $row['recipe_id'];
            $ingredientsResult = $conn->query($ingredientsSql);
            $ingredients = [];
            if ($ingredientsResult && $ingredientsResult->num_rows > 0) {
                while ($ing = $ingredientsResult->fetch_assoc()) {
                    $ingredients[] = $ing;
                }
            }
            $row['ingredients_list'] = $ingredients;
            $recipes[] = $row;
        }
    }
    
    closeDBConnection($conn);
    
    echo json_encode([
        'success' => true,
        'count' => count($recipes),
        'recipes' => $recipes
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>


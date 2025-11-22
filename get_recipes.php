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
    $ingredient = isset($_GET['ingredient']) ? $_GET['ingredient'] : (isset($_POST['ingredient']) ? $_POST['ingredient'] : '');
    $dietType = isset($_GET['diet_type']) ? $_GET['diet_type'] : (isset($_POST['diet_type']) ? $_POST['diet_type'] : '');
    
    $sql = "SELECT * FROM recipes WHERE 1=1";
    
    if (!empty($ingredient)) {
        $ingredient = $conn->real_escape_string($ingredient);
        $sql .= " AND (name LIKE '%$ingredient%' OR ingredients LIKE '%$ingredient%')";
    }
    
    if (!empty($dietType)) {
        $dietType = $conn->real_escape_string($dietType);
        $sql .= " AND diet_type = '$dietType'";
    }
    
    $sql .= " ORDER BY health_rating DESC, name ASC";
    
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
    echo json_encode(['error' => 'Method not allowed']);
}
?>


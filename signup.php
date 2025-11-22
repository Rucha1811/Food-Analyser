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
    
    $username = isset($data['username']) ? trim($data['username']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? $data['password'] : '';
    $dietGoal = isset($data['diet_goal']) ? $data['diet_goal'] : 'balanced';
    
    // Validation
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit();
    }
    
    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit();
    }
    
    $conn = getDBConnection();
    
    // Check if email already exists
    $checkEmail = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $result = $checkEmail->get_result();
    
    if ($result->num_rows > 0) {
        closeDBConnection($conn);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit();
    }
    
    // Check if username already exists
    $checkUsername = $conn->prepare("SELECT user_id FROM users WHERE username = ?");
    $checkUsername->bind_param("s", $username);
    $checkUsername->execute();
    $result = $checkUsername->get_result();
    
    if ($result->num_rows > 0) {
        closeDBConnection($conn);
        echo json_encode(['success' => false, 'message' => 'Username already taken']);
        exit();
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);
    
    if ($stmt->execute()) {
        $userId = $conn->insert_id;
        
        // Create user preferences
        $prefStmt = $conn->prepare("INSERT INTO user_preferences (user_id, diet_goal) VALUES (?, ?)");
        $prefStmt->bind_param("is", $userId, $dietGoal);
        $prefStmt->execute();
        
        closeDBConnection($conn);
        
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'user_id' => $userId
        ]);
    } else {
        closeDBConnection($conn);
        echo json_encode(['success' => false, 'message' => 'Error creating account. Please try again.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>


<?php
session_start();
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
    
    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? $data['password'] : '';
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit();
    }
    
    $conn = getDBConnection();
    
    // Get user by email
    $stmt = $conn->prepare("SELECT user_id, username, email, password FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        closeDBConnection($conn);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }
    
    $user = $result->fetch_assoc();
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        closeDBConnection($conn);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit();
    }
    
    // Get user preferences
    $prefStmt = $conn->prepare("SELECT diet_goal FROM user_preferences WHERE user_id = ?");
    $prefStmt->bind_param("i", $user['user_id']);
    $prefStmt->execute();
    $prefResult = $prefStmt->get_result();
    $preferences = $prefResult->fetch_assoc();
    
    // Set session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    
    closeDBConnection($conn);
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user_id' => $user['user_id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'diet_goal' => $preferences['diet_goal'] ?? 'balanced'
    ]);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>


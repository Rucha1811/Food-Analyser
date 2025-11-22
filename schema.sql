-- Smart Food Analyzer & Recipe Recommendation System Database Schema

CREATE DATABASE IF NOT EXISTS food_analyzer;
USE food_analyzer;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    diet_goal ENUM('weight_loss', 'weight_gain', 'high_protein', 'low_carb', 'diabetic_friendly', 'balanced') DEFAULT 'balanced',
    allergies TEXT,
    cuisine_preference VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    calories DECIMAL(10,2),
    protein DECIMAL(10,2),
    carbs DECIMAL(10,2),
    fat DECIMAL(10,2),
    fiber DECIMAL(10,2),
    sugar DECIMAL(10,2),
    sodium DECIMAL(10,2),
    health_score INT DEFAULT 0,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    diet_type ENUM('weight_loss', 'weight_gain', 'high_protein', 'low_carb', 'diabetic_friendly', 'balanced') NOT NULL,
    calories DECIMAL(10,2),
    protein DECIMAL(10,2),
    fat DECIMAL(10,2),
    carbs DECIMAL(10,2),
    fiber DECIMAL(10,2),
    servings INT DEFAULT 1,
    time_required INT DEFAULT 30,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    image_url VARCHAR(255),
    health_rating INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe ingredients table (normalized)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_name VARCHAR(200) NOT NULL,
    quantity VARCHAR(100),
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE
);

-- User saved recipes
CREATE TABLE IF NOT EXISTS user_saved_recipes (
    save_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    UNIQUE KEY unique_save (user_id, recipe_id)
);

-- Meal log table
CREATE TABLE IF NOT EXISTS meal_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT,
    food_id INT,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') DEFAULT 'lunch',
    date DATE NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    calories DECIMAL(10,2),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE SET NULL,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE SET NULL
);

-- Shopping lists
CREATE TABLE IF NOT EXISTS shopping_lists (
    list_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT,
    item_name VARCHAR(200) NOT NULL,
    quantity VARCHAR(100),
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id) ON DELETE SET NULL
);

-- Insert sample food items
INSERT INTO food_items (name, calories, protein, carbs, fat, fiber, sugar, sodium, health_score, image_url) VALUES
('Chicken Breast', 165, 31, 0, 3.6, 0, 0, 74, 85, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'),
('Brown Rice', 111, 2.6, 23, 0.9, 1.8, 0.4, 5, 75, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
('Paneer', 265, 18, 3.5, 20, 0, 0, 15, 70, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'),
('Broccoli', 34, 2.8, 7, 0.4, 2.6, 1.5, 33, 95, 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400'),
('Salmon', 206, 22, 0, 12, 0, 0, 44, 90, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'),
('Quinoa', 120, 4.4, 22, 1.9, 2.8, 0.9, 7, 88, 'https://images.unsplash.com/photo-1476710847112-f1b5067c54b7?w=400'),
('Eggs', 155, 13, 1.1, 11, 0, 1.1, 124, 80, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
('Sweet Potato', 86, 1.6, 20, 0.1, 3, 4.2, 54, 82, 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400');

-- Insert sample recipes
INSERT INTO recipes (name, description, diet_type, calories, protein, fat, carbs, fiber, servings, time_required, difficulty, ingredients, instructions, health_rating) VALUES
('Grilled Chicken Breast with Broccoli', 'High-protein meal perfect for muscle gain', 'high_protein', 320, 45, 8, 12, 5, 1, 25, 'easy', 
'200g Chicken Breast, 150g Broccoli, 1 tbsp Olive Oil, Salt, Pepper, Garlic Powder',
'1. Season chicken breast with salt, pepper, and garlic powder\n2. Heat olive oil in a pan\n3. Grill chicken for 6-7 minutes each side\n4. Steam broccoli for 5 minutes\n5. Serve hot with lemon wedge', 9),

('Paneer Salad (Weight Loss)', 'Light and nutritious salad for weight loss goals', 'weight_loss', 180, 15, 8, 12, 4, 1, 15, 'easy',
'150g Paneer, 100g Mixed Greens, 50g Cherry Tomatoes, 30g Cucumber, 1 tbsp Olive Oil, Lemon Juice, Salt, Pepper',
'1. Cut paneer into cubes\n2. Mix all vegetables in a bowl\n3. Add paneer cubes\n4. Drizzle olive oil and lemon juice\n5. Season with salt and pepper\n6. Toss and serve fresh', 8),

('Paneer Paratha (Weight Gain)', 'High-calorie paratha for weight gain', 'weight_gain', 450, 18, 22, 45, 3, 2, 30, 'medium',
'200g Whole Wheat Flour, 150g Paneer, 1 Onion, 2 Green Chilies, 1 tsp Cumin, Salt, 2 tbsp Ghee',
'1. Mix flour with water to make dough\n2. Mash paneer with onions, chilies, and spices\n3. Roll dough, add filling, seal\n4. Cook on tawa with ghee\n5. Serve hot with yogurt', 7),

('Low-Carb Chicken Bowl', 'Perfect for low-carb diet plans', 'low_carb', 280, 35, 10, 8, 3, 1, 20, 'easy',
'200g Chicken Breast, 100g Zucchini, 50g Bell Peppers, 1 tbsp Olive Oil, Herbs, Salt',
'1. Cut chicken into strips\n2. Sauté vegetables in olive oil\n3. Add chicken and cook through\n4. Season with herbs and salt\n5. Serve in a bowl', 9),

('Diabetic-Friendly Quinoa Bowl', 'Low GI meal perfect for diabetic diet', 'diabetic_friendly', 250, 12, 8, 35, 6, 1, 25, 'easy',
'100g Quinoa, 100g Mixed Vegetables, 50g Tofu, 1 tbsp Olive Oil, Turmeric, Salt',
'1. Cook quinoa as per package instructions\n2. Sauté vegetables and tofu\n3. Mix with quinoa\n4. Add turmeric and salt\n5. Serve warm', 9),

('Balanced Salmon & Sweet Potato', 'Well-rounded meal with all macros', 'balanced', 380, 28, 15, 35, 5, 1, 30, 'medium',
'150g Salmon, 200g Sweet Potato, 100g Green Beans, 1 tbsp Olive Oil, Lemon, Herbs',
'1. Bake sweet potato at 200°C for 25 minutes\n2. Pan-sear salmon for 4-5 minutes each side\n3. Steam green beans\n4. Drizzle with olive oil and lemon\n5. Serve together', 9);

-- Insert recipe ingredients for normalization
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity) VALUES
(1, 'Chicken Breast', '200g'),
(1, 'Broccoli', '150g'),
(1, 'Olive Oil', '1 tbsp'),
(2, 'Paneer', '150g'),
(2, 'Mixed Greens', '100g'),
(2, 'Cherry Tomatoes', '50g'),
(3, 'Whole Wheat Flour', '200g'),
(3, 'Paneer', '150g'),
(3, 'Ghee', '2 tbsp');


# 🍽️ Smart Food Analyzer + Personalized Recipe Recommendation System

A beautiful, modern full-stack web application that analyzes food items for nutritional content and generates personalized recipes based on diet goals.

## ✨ Features

- **Food Analysis**: Search for food items and get detailed nutrition information
- **Health Score Calculation**: Automatic health scoring based on nutritional values
- **Diet-Based Recipe Recommendations**: Get personalized recipes based on your diet goal:
  - Weight Loss
  - Weight Gain
  - High Protein
  - Low Carb
  - Diabetic Friendly
  - Balanced Diet
- **Recipe Details**: Step-by-step cooking instructions with ingredients
- **Meal Logging**: Track your daily meals and calories
- **Recipe Saving**: Save your favorite recipes to your dashboard
- **Shopping List Generator**: Generate shopping lists from recipes
- **Beautiful Modern UI**: Responsive design with gradient colors and smooth animations

## 🚀 Setup Instructions

### Prerequisites

- XAMPP (or any PHP/MySQL server)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Modern web browser

### Installation Steps

1. **Database Setup**
   - Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
   - Import the database schema:
     - Go to "Import" tab
     - **IMPORTANT:** Select `database/setup.sql` (NOT `database.php` or `config/database.php`)
     - Click "Go" to import
   - See `SETUP_INSTRUCTIONS.md` for detailed steps

2. **Database Configuration**
   - Open `config/database.php`
   - Update database credentials if needed (default XAMPP settings):
     ```php
     define('DB_HOST', 'localhost');
     define('DB_USER', 'root');
     define('DB_PASS', '');
     define('DB_NAME', 'food_analyzer');
     ```

3. **Access the Application**
   - Start XAMPP (Apache and MySQL)
   - Navigate to: `http://localhost/food analyser/`
   - The application should load!

## 📁 Project Structure

```
food analyser/
├── api/                    # PHP API endpoints
│   ├── search_food.php
│   ├── get_recipes.php
│   ├── get_recipe.php
│   ├── save_recipe.php
│   ├── log_meal.php
│   └── get_shopping_list.php
├── assets/
│   ├── css/
│   │   ├── style.css       # Main styles
│   │   ├── recipe.css      # Recipe page styles
│   │   └── dashboard.css   # Dashboard styles
│   └── js/
│       ├── main.js         # Main JavaScript
│       ├── recipe.js       # Recipe page JS
│       └── dashboard.js    # Dashboard JS
├── config/
│   └── database.php        # Database configuration
├── database/
│   └── schema.sql          # Database schema
├── index.html              # Home page
├── recipe.html             # Recipe detail page
├── dashboard.html           # User dashboard
└── README.md               # This file
```

## 🎯 How to Use

### 1. Search for Food
- Enter a food item or ingredient in the search box (e.g., "Chicken", "Paneer", "Rice")
- View nutrition information and health score

### 2. Select Diet Goal
- Choose your diet goal from the buttons:
  - Weight Loss
  - Weight Gain
  - High Protein
  - Low Carb
  - Diabetic Friendly
  - Balanced Diet

### 3. View Recipe Recommendations
- After searching, recipes matching your diet goal will appear
- Click on any recipe card to view full details

### 4. Recipe Details
- View ingredients list
- Follow step-by-step instructions
- See nutrition breakdown
- Save recipe to favorites
- Add to meal log
- Generate shopping list

### 5. Dashboard
- View saved recipes
- Track daily calories
- See meal log
- Monitor health score

## 🎨 Design Features

- **Modern Gradient Colors**: Beautiful purple, pink, and blue gradients
- **Smooth Animations**: Hover effects and transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Card-Based Layout**: Clean, organized information display
- **Icon Integration**: Font Awesome icons throughout
- **Loading States**: Smooth loading overlays
- **Toast Notifications**: User-friendly feedback messages

## 🔧 API Endpoints

- `GET api/search_food.php?q={query}` - Search for food items
- `GET api/get_recipes.php?ingredient={name}&diet_type={type}` - Get recipe recommendations
- `GET api/get_recipe.php?id={recipe_id}` - Get recipe details
- `POST api/save_recipe.php` - Save recipe to favorites
- `POST api/log_meal.php` - Log a meal
- `GET api/get_shopping_list.php?recipe_id={id}` - Get shopping list

## 📊 Database Tables

- `users` - User accounts
- `user_preferences` - User diet preferences
- `food_items` - Food nutrition data
- `recipes` - Recipe information
- `recipe_ingredients` - Recipe ingredients (normalized)
- `user_saved_recipes` - Saved recipes
- `meal_log` - Meal tracking
- `shopping_lists` - Shopping lists

## 🎁 Bonus Features

- ✅ Shopping List Generator
- ✅ Meal Plan Tracking
- ✅ Health Score Calculation
- ✅ Responsive Design
- ✅ Beautiful UI/UX

## 🐛 Troubleshooting

### Database Connection Error
- Check if MySQL is running in XAMPP
- Verify database credentials in `config/database.php`
- Ensure database `food_analyzer` exists

### API Not Working
- Check PHP error logs
- Verify file permissions
- Ensure Apache is running

### Styles Not Loading
- Check file paths in HTML
- Clear browser cache
- Verify CSS files exist

## 📝 Notes

- Default user ID is set to `1` for demo purposes
- Sample food items and recipes are included in the database
- All API endpoints support CORS for cross-origin requests

## 🔮 Future Enhancements

- User authentication system
- AI recipe generator
- Voice instructions
- Smart kitchen mode
- Advanced meal planning
- Nutrition charts and graphs
- Social sharing features

## 📄 License

This project is open source and available for educational purposes.

---

**Enjoy your Smart Food Analyzer! 🍽️✨**


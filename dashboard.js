// Dashboard JavaScript

const API_BASE = 'api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndLoadDashboard();
});

function checkAuthAndLoadDashboard() {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update navigation
    const username = localStorage.getItem('username');
    const navUsername = document.getElementById('navUsername');
    if (navUsername) navUsername.textContent = username || 'User';
    
    loadDashboardData();
}

async function loadDashboardData() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    
    try {
        // Load saved recipes
        await loadSavedRecipes();
        
        // Load meal log
        await loadMealLog();
        
        // Calculate stats
        calculateStats();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function calculateStats() {
    const userId = localStorage.getItem('user_id');
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Get today's meals
        const response = await fetch(`${API_BASE}/get_meal_log.php?user_id=${userId}&date=${today}`);
        const data = await response.json();
        
        if (data.success) {
            const totalCalories = data.meals.reduce((sum, meal) => sum + (parseFloat(meal.calories) || 0), 0);
            document.getElementById('todayCalories').textContent = totalCalories.toLocaleString();
            document.getElementById('mealsCount').textContent = data.meals.length;
        }
        
        // Get saved recipes count
        const savedResponse = await fetch(`${API_BASE}/get_saved_recipes.php?user_id=${userId}`);
        const savedData = await savedResponse.json();
        
        if (savedData.success) {
            document.getElementById('savedCount').textContent = savedData.count || 0;
        }
    } catch (error) {
        console.error('Error calculating stats:', error);
        // Set defaults
        document.getElementById('todayCalories').textContent = '0';
        document.getElementById('savedCount').textContent = '0';
        document.getElementById('mealsCount').textContent = '0';
    }
    
    document.getElementById('healthScore').textContent = '85';
}

async function loadSavedRecipes() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    
    const grid = document.getElementById('savedRecipesGrid');
    
    try {
        const response = await fetch(`${API_BASE}/get_saved_recipes.php?user_id=${userId}`);
        const data = await response.json();
        
        if (data.success && data.recipes && data.recipes.length > 0) {
            grid.innerHTML = '';
            data.recipes.forEach(recipe => {
                const card = createRecipeCard(recipe);
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">No saved recipes yet. Start exploring and save your favorites!</p>
                    <a href="index.html" class="action-btn btn-primary" style="margin-top: 20px; display: inline-flex;">
                        <i class="fas fa-search"></i> Explore Recipes
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading saved recipes:', error);
    }
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.cursor = 'pointer';
    card.onclick = () => window.location.href = `recipe.html?id=${recipe.recipe_id}`;
    
    const dietTypeLabels = {
        'weight_loss': 'Weight Loss',
        'weight_gain': 'Weight Gain',
        'high_protein': 'High Protein',
        'low_carb': 'Low Carb',
        'diabetic_friendly': 'Diabetic Friendly',
        'balanced': 'Balanced'
    };
    
    card.innerHTML = `
        <div class="recipe-image">
            <i class="fas fa-utensils"></i>
        </div>
        <div class="recipe-content">
            <div class="recipe-header">
                <div class="recipe-title">${recipe.name}</div>
                <span class="diet-badge ${recipe.diet_type}">${dietTypeLabels[recipe.diet_type] || recipe.diet_type}</span>
            </div>
            <p class="recipe-description">${recipe.description || 'Delicious and nutritious recipe'}</p>
            <div class="recipe-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${recipe.time_required} min</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-signal"></i>
                    <span>${recipe.difficulty || 'Medium'}</span>
                </div>
            </div>
            <div class="recipe-stats">
                <div class="stat-item">
                    <div class="stat-label">Calories</div>
                    <div class="stat-value">${recipe.calories || 'N/A'}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Protein</div>
                    <div class="stat-value">${recipe.protein || '0'}g</div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

async function loadMealLog() {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;
    
    const mealLog = document.getElementById('mealLog');
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const response = await fetch(`${API_BASE}/get_meal_log.php?user_id=${userId}&date=${today}`);
        const data = await response.json();
        
        if (data.success && data.meals && data.meals.length > 0) {
            mealLog.innerHTML = '';
            data.meals.forEach(meal => {
                const mealItem = createMealItem(meal);
                mealLog.appendChild(mealItem);
            });
        } else {
            mealLog.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">No meals logged today. Start tracking your nutrition!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading meal log:', error);
        mealLog.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils" style="font-size: 4rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <p style="color: var(--text-secondary); font-size: 1.1rem;">No meals logged today. Start tracking your nutrition!</p>
            </div>
        `;
    }
}

function createMealItem(meal) {
    const item = document.createElement('div');
    item.className = 'meal-item';
    
    const typeLabels = {
        'breakfast': 'Breakfast',
        'lunch': 'Lunch',
        'dinner': 'Dinner',
        'snack': 'Snack'
    };
    
    const mealName = meal.recipe_name || meal.food_name || 'Meal';
    const mealTime = meal.logged_at ? new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    
    item.innerHTML = `
        <div class="meal-info">
            <div class="meal-name">
                <span class="meal-type-badge ${meal.meal_type}">${typeLabels[meal.meal_type] || meal.meal_type}</span>
                ${mealName}
            </div>
            <div class="meal-meta">
                <span><i class="fas fa-clock"></i> ${mealTime}</span>
            </div>
        </div>
        <div class="meal-calories">${meal.calories || 0} cal</div>
    `;
    
    return item;
}

// Utility function for toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


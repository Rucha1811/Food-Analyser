// Smart Food Analyzer - Main JavaScript

const API_BASE = 'api';

let currentDietGoal = 'balanced';
let currentSearchTerm = '';
let currentUserId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndUpdateUI();
    initializeDietButtons();
    initializeSearch();
});

// Check authentication and update UI
function checkAuthAndUpdateUI() {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const dietGoal = localStorage.getItem('diet_goal');
    
    if (userId) {
        currentUserId = parseInt(userId);
        if (dietGoal) {
            currentDietGoal = dietGoal;
            // Update active diet button
            document.querySelectorAll('.diet-btn').forEach(btn => {
                if (btn.dataset.diet === dietGoal) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        // Update navigation
        const authLinks = document.getElementById('authLinks');
        const userMenu = document.getElementById('userMenu');
        const navUsername = document.getElementById('navUsername');
        
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'inline-flex';
            if (navUsername) navUsername.textContent = username || 'User';
        }
    } else {
        const authLinks = document.getElementById('authLinks');
        const userMenu = document.getElementById('userMenu');
        if (authLinks) authLinks.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Diet Goal Selection
function initializeDietButtons() {
    const dietButtons = document.querySelectorAll('.diet-btn');
    dietButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dietButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDietGoal = btn.dataset.diet;
            
            // If we have search results, refresh recipes
            if (currentSearchTerm) {
                searchRecipes(currentSearchTerm);
            }
        });
    });
}

// Search Functionality
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('foodSearch');
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

async function performSearch() {
    const searchInput = document.getElementById('foodSearch');
    const query = searchInput.value.trim();
    
    if (!query) {
        showToast('Please enter a food item or ingredient', 'error');
        return;
    }
    
    currentSearchTerm = query;
    showLoading(true);
    
    try {
        // Search for food items
        const foodResponse = await fetch(`${API_BASE}/search_food.php?q=${encodeURIComponent(query)}`);
        const foodData = await foodResponse.json();
        
        if (foodData.success && foodData.foods.length > 0) {
            displayFoodResults(foodData.foods);
        } else {
            showToast('No food items found. Showing recipe recommendations...', 'error');
        }
        
        // Search for recipes
        await searchRecipes(query);
        
    } catch (error) {
        console.error('Search error:', error);
        showToast('Error searching. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function displayFoodResults(foods) {
    const resultsSection = document.getElementById('foodResults');
    const foodCards = document.getElementById('foodCards');
    
    foodCards.innerHTML = '';
    
    foods.forEach(food => {
        const card = createFoodCard(food);
        foodCards.appendChild(card);
    });
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createFoodCard(food) {
    const card = document.createElement('div');
    card.className = 'food-card';
    
    const healthScore = calculateHealthScore(food);
    
    card.innerHTML = `
        <div class="food-card-header">
            <div class="food-name">${food.name}</div>
            <div class="health-score">Health: ${healthScore}/100</div>
        </div>
        <div class="nutrition-grid">
            <div class="nutrition-item">
                <span class="nutrition-label">Calories</span>
                <span class="nutrition-value">${food.calories || 'N/A'}</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Protein</span>
                <span class="nutrition-value">${food.protein || '0'}g</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Carbs</span>
                <span class="nutrition-value">${food.carbs || '0'}g</span>
            </div>
            <div class="nutrition-item">
                <span class="nutrition-label">Fat</span>
                <span class="nutrition-value">${food.fat || '0'}g</span>
            </div>
            ${food.fiber ? `
            <div class="nutrition-item">
                <span class="nutrition-label">Fiber</span>
                <span class="nutrition-value">${food.fiber}g</span>
            </div>
            ` : ''}
            ${food.sugar ? `
            <div class="nutrition-item">
                <span class="nutrition-label">Sugar</span>
                <span class="nutrition-value">${food.sugar}g</span>
            </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

function calculateHealthScore(food) {
    let score = 50; // Base score
    
    // Protein boost
    if (food.protein > 20) score += 15;
    else if (food.protein > 10) score += 10;
    
    // Fiber boost
    if (food.fiber > 5) score += 15;
    else if (food.fiber > 2) score += 10;
    
    // Low sugar bonus
    if (food.sugar < 5) score += 10;
    
    // Low fat bonus (if not too low)
    if (food.fat < 10 && food.fat > 0) score += 10;
    
    // Penalty for high sugar
    if (food.sugar > 20) score -= 15;
    
    // Penalty for very high fat
    if (food.fat > 30) score -= 10;
    
    return Math.min(100, Math.max(0, score));
}

async function searchRecipes(ingredient) {
    try {
        const response = await fetch(`${API_BASE}/get_recipes.php?ingredient=${encodeURIComponent(ingredient)}&diet_type=${currentDietGoal}`);
        const data = await response.json();
        
        if (data.success && data.recipes.length > 0) {
            displayRecipes(data.recipes);
        } else {
            // Try without diet filter
            const allResponse = await fetch(`${API_BASE}/get_recipes.php?ingredient=${encodeURIComponent(ingredient)}`);
            const allData = await allResponse.json();
            
            if (allData.success && allData.recipes.length > 0) {
                displayRecipes(allData.recipes);
                showToast('Showing all recipes. No recipes found for your diet goal.', 'error');
            } else {
                showToast('No recipes found for this ingredient.', 'error');
            }
        }
    } catch (error) {
        console.error('Recipe search error:', error);
        showToast('Error loading recipes. Please try again.', 'error');
    }
}

function displayRecipes(recipes) {
    const recipeSection = document.getElementById('recipeSection');
    const recipeGrid = document.getElementById('recipeGrid');
    
    recipeGrid.innerHTML = '';
    
    recipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        recipeGrid.appendChild(card);
    });
    
    recipeSection.style.display = 'block';
    recipeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    
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
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${recipe.servings} serving${recipe.servings > 1 ? 's' : ''}</span>
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
                <div class="stat-item">
                    <div class="stat-label">Carbs</div>
                    <div class="stat-value">${recipe.carbs || '0'}g</div>
                </div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `recipe.html?id=${recipe.recipe_id}`;
    });
    
    return card;
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Saved Recipes
document.getElementById('savedRecipesBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    if (userId) {
        window.location.href = 'dashboard.html';
    } else {
        showToast('Please login to view saved recipes', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
});


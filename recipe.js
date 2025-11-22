// Recipe Detail Page JavaScript

const API_BASE = 'api';

// Get recipe ID from URL
const urlParams = new URLSearchParams(window.location.search);
const recipeId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', () => {
    if (recipeId) {
        loadRecipe(recipeId);
    } else {
        showError('Recipe ID not found');
    }
});

async function loadRecipe(id) {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/get_recipe.php?id=${id}`);
        const data = await response.json();
        
        if (data.success && data.recipe) {
            displayRecipe(data.recipe);
        } else {
            showError('Recipe not found');
        }
    } catch (error) {
        console.error('Error loading recipe:', error);
        showError('Error loading recipe. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayRecipe(recipe) {
    const content = document.getElementById('recipeContent');
    
    const dietTypeLabels = {
        'weight_loss': 'Weight Loss',
        'weight_gain': 'Weight Gain',
        'high_protein': 'High Protein',
        'low_carb': 'Low Carb',
        'diabetic_friendly': 'Diabetic Friendly',
        'balanced': 'Balanced'
    };
    
    // Parse ingredients
    const ingredients = recipe.ingredients_list && recipe.ingredients_list.length > 0
        ? recipe.ingredients_list
        : parseIngredients(recipe.ingredients);
    
    // Parse instructions
    const instructions = parseInstructions(recipe.instructions);
    
    content.innerHTML = `
        <a href="index.html" class="back-button">
            <i class="fas fa-arrow-left"></i> Back to Search
        </a>
        
        <div class="recipe-hero">
            <div class="recipe-hero-image">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="recipe-hero-content">
                <div class="recipe-title-section">
                    <h1 class="recipe-main-title">${recipe.name}</h1>
                    <div class="recipe-actions">
                        <button class="action-btn btn-primary" onclick="saveRecipe(${recipe.recipe_id})">
                            <i class="fas fa-bookmark"></i> Save Recipe
                        </button>
                        <button class="action-btn btn-success" onclick="addToMealPlan(${recipe.recipe_id})">
                            <i class="fas fa-plus"></i> Add to Meal Log
                        </button>
                    </div>
                </div>
                
                <div class="recipe-meta-bar">
                    <div class="meta-bar-item">
                        <i class="fas fa-clock"></i>
                        <span>${recipe.time_required} minutes</span>
                    </div>
                    <div class="meta-bar-item">
                        <i class="fas fa-signal"></i>
                        <span>${recipe.difficulty || 'Medium'} difficulty</span>
                    </div>
                    <div class="meta-bar-item">
                        <i class="fas fa-users"></i>
                        <span>${recipe.servings} serving${recipe.servings > 1 ? 's' : ''}</span>
                    </div>
                    <div class="meta-bar-item">
                        <i class="fas fa-star"></i>
                        <span>Health Rating: ${recipe.health_rating}/10</span>
                    </div>
                </div>
                
                <div class="diet-badge ${recipe.diet_type}" style="display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: 600; margin-bottom: 20px;">
                    ${dietTypeLabels[recipe.diet_type] || recipe.diet_type}
                </div>
                
                ${recipe.description ? `
                <p class="recipe-description-text">${recipe.description}</p>
                ` : ''}
                
                <div class="recipe-info-grid">
                    <div class="info-card">
                        <div class="info-card-label">Calories</div>
                        <div class="info-card-value">${recipe.calories || 'N/A'}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">Protein</div>
                        <div class="info-card-value">${recipe.protein || '0'}g</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">Carbs</div>
                        <div class="info-card-value">${recipe.carbs || '0'}g</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">Fat</div>
                        <div class="info-card-value">${recipe.fat || '0'}g</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="recipe-section">
            <h2 class="section-header">
                <i class="fas fa-list"></i> Ingredients
            </h2>
            <ul class="ingredients-list">
                ${ingredients.map(ing => `
                    <li class="ingredient-item">
                        <i class="fas fa-check-circle"></i>
                        <span class="ingredient-name">${ing.name || ing.ingredient_name}</span>
                        <span class="ingredient-quantity">${ing.quantity || ''}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="recipe-section">
            <h2 class="section-header">
                <i class="fas fa-tasks"></i> Instructions
            </h2>
            <ol class="instructions-list">
                ${instructions.map(instruction => `
                    <li class="instruction-step">
                        <div class="instruction-text">${instruction}</div>
                    </li>
                `).join('')}
            </ol>
        </div>
        
        <div class="recipe-section">
            <h2 class="section-header">
                <i class="fas fa-chart-pie"></i> Nutrition Breakdown (per serving)
            </h2>
            <div class="nutrition-breakdown">
                <div class="nutrition-breakdown-item">
                    <div class="nutrition-breakdown-label">Calories</div>
                    <div class="nutrition-breakdown-value">${recipe.calories || 'N/A'}</div>
                </div>
                <div class="nutrition-breakdown-item">
                    <div class="nutrition-breakdown-label">Protein</div>
                    <div class="nutrition-breakdown-value">${recipe.protein || '0'}g</div>
                </div>
                <div class="nutrition-breakdown-item">
                    <div class="nutrition-breakdown-label">Carbs</div>
                    <div class="nutrition-breakdown-value">${recipe.carbs || '0'}g</div>
                </div>
                <div class="nutrition-breakdown-item">
                    <div class="nutrition-breakdown-label">Fat</div>
                    <div class="nutrition-breakdown-value">${recipe.fat || '0'}g</div>
                </div>
                ${recipe.fiber ? `
                <div class="nutrition-breakdown-item">
                    <div class="nutrition-breakdown-label">Fiber</div>
                    <div class="nutrition-breakdown-value">${recipe.fiber}g</div>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="recipe-section">
            <div class="recipe-actions" style="justify-content: center; margin-top: 20px;">
                <button class="action-btn btn-primary" onclick="generateShoppingList(${recipe.recipe_id})">
                    <i class="fas fa-shopping-cart"></i> Generate Shopping List
                </button>
            </div>
        </div>
    `;
}

function parseIngredients(ingredientsText) {
    if (!ingredientsText) return [];
    
    // Split by comma or newline
    const items = ingredientsText.split(/[,\n]/).map(item => item.trim()).filter(item => item);
    
    return items.map(item => {
        // Try to extract quantity and name
        const match = item.match(/^(.+?)\s+(\d+[^\s]*)/);
        if (match) {
            return {
                name: match[1],
                quantity: match[2]
            };
        }
        return {
            name: item,
            quantity: ''
        };
    });
}

function parseInstructions(instructionsText) {
    if (!instructionsText) return [];
    
    // Split by newline or numbered list
    const steps = instructionsText.split(/\n+/)
        .map(step => step.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(step => step.length > 0);
    
    return steps;
}

async function saveRecipe(recipeId) {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        showToast('Please login to save recipes', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/save_recipe.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: parseInt(userId),
                recipe_id: recipeId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            if (data.already_saved) {
                showToast('Recipe already saved!', 'error');
            } else {
                showToast('Recipe saved successfully!', 'success');
            }
        } else {
            showToast('Error saving recipe', 'error');
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        showToast('Error saving recipe', 'error');
    }
}

async function addToMealPlan(recipeId) {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        showToast('Please login to log meals', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const mealType = prompt('Select meal type:\n1. Breakfast\n2. Lunch\n3. Dinner\n4. Snack\n\nEnter number (1-4):');
    
    const mealTypes = {
        '1': 'breakfast',
        '2': 'lunch',
        '3': 'dinner',
        '4': 'snack'
    };
    
    if (!mealType || !mealTypes[mealType]) {
        showToast('Invalid meal type', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/log_meal.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: parseInt(userId),
                recipe_id: recipeId,
                meal_type: mealTypes[mealType],
                date: new Date().toISOString().split('T')[0]
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Meal logged successfully! (${data.calories} calories)`, 'success');
        } else {
            showToast('Error logging meal', 'error');
        }
    } catch (error) {
        console.error('Error logging meal:', error);
        showToast('Error logging meal', 'error');
    }
}

async function generateShoppingList(recipeId) {
    try {
        const response = await fetch(`${API_BASE}/get_shopping_list.php?recipe_id=${recipeId}`);
        const data = await response.json();
        
        if (data.success && data.items.length > 0) {
            const list = data.items.map(item => 
                `- ${item.ingredient_name} (${item.quantity || 'as needed'})`
            ).join('\n');
            
            const message = `Shopping List:\n\n${list}\n\nCopy this list?`;
            
            if (confirm(message)) {
                navigator.clipboard.writeText(list).then(() => {
                    showToast('Shopping list copied to clipboard!', 'success');
                }).catch(() => {
                    showToast('Shopping list generated!', 'success');
                });
            }
        } else {
            showToast('No ingredients found', 'error');
        }
    } catch (error) {
        console.error('Error generating shopping list:', error);
        showToast('Error generating shopping list', 'error');
    }
}

function showError(message) {
    const content = document.getElementById('recipeContent');
    content.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 20px;"></i>
            <h2 style="color: var(--text-primary); margin-bottom: 20px;">${message}</h2>
            <a href="index.html" class="action-btn btn-primary">
                <i class="fas fa-home"></i> Go to Home
            </a>
        </div>
    `;
}

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


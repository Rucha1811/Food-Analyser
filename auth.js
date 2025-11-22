// Authentication JavaScript

const API_BASE = 'api';

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(inputId + '-eye');
    
    if (input.type === 'password') {
        input.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
    }
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        const password = document.getElementById('password');
        
        if (confirmPassword && password) {
            confirmPassword.addEventListener('input', () => {
                validatePasswordMatch();
            });
            password.addEventListener('input', () => {
                validatePasswordMatch();
            });
        }
    }
    
    // Check if user is already logged in
    checkAuthStatus();
});

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        const response = await fetch(`${API_BASE}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user session
            localStorage.setItem('user_id', data.user_id);
            localStorage.setItem('username', data.username);
            localStorage.setItem('email', data.email);
            localStorage.setItem('diet_goal', data.diet_goal || 'balanced');
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard or home
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showToast(data.message || 'Invalid email or password', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Error connecting to server. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const dietGoal = document.getElementById('dietGoal').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    try {
        const response = await fetch(`${API_BASE}/signup.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                diet_goal: dietGoal
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Account created successfully! Redirecting to login...', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showToast(data.message || 'Error creating account. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('Error connecting to server. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (!password || !confirmPassword) return;
    
    if (confirmPassword.value && password.value !== confirmPassword.value) {
        confirmPassword.classList.add('error');
        if (!document.getElementById('password-match-error')) {
            const errorMsg = document.createElement('div');
            errorMsg.id = 'password-match-error';
            errorMsg.className = 'error-message';
            errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Passwords do not match';
            confirmPassword.parentElement.appendChild(errorMsg);
        }
    } else {
        confirmPassword.classList.remove('error');
        const errorMsg = document.getElementById('password-match-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

function checkAuthStatus() {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    
    // Update navigation on all pages
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const navUsername = document.getElementById('navUsername');
    
    if (userId) {
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'inline-flex';
            if (navUsername) navUsername.textContent = username || 'User';
        }
        
        // Redirect from login/signup pages if already logged in
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        if (authLinks) authLinks.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
        
        // Redirect from dashboard if not logged in
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
}

function logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('diet_goal');
    
    // Call logout API
    fetch(`${API_BASE}/logout.php`, {
        method: 'POST'
    }).then(() => {
        window.location.href = 'index.html';
    });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export logout function for use in other pages
window.logout = logout;


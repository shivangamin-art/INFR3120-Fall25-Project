// Frontend/auth.js - COMPLETE FIXED VERSION
const API_BASE_URL = 'https://autorent-k8dr.onrender.com';

class AuthService {
    static isAuthenticated() {
        return localStorage.getItem('currentUser') !== null;
    }

    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static getToken() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.token : null;
    }

    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(data));
            return data;
        } catch (error) {
            throw new Error(error.message || 'Invalid email or password');
        }
    }

    static async register(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Email already exists');
        }
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Navigation Management
function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const currentUser = AuthService.getCurrentUser();

    if (currentUser) {
        // User is logged in
        navLinks.innerHTML = `
            <li><a href="index.html" class="${isActivePage('index.html') ? 'active' : ''}">Home</a></li>
            <li><a href="cars.html" class="${isActivePage('cars.html') ? 'active' : ''}">Available Cars</a></li>
            <li><a href="add-car.html" class="${isActivePage('add-car.html') ? 'active' : ''}">Add Car</a></li>
            <li><a href="#" id="logoutBtn">Logout (${currentUser.user.email})</a></li>
        `;
    } else {
        // User is logged out
        navLinks.innerHTML = `
            <li><a href="index.html" class="${isActivePage('index.html') ? 'active' : ''}">Home</a></li>
            <li><a href="cars.html" class="${isActivePage('cars.html') ? 'active' : ''}">Available Cars</a></li>
            <li><a href="login.html" class="${isActivePage('login.html') ? 'active' : ''}">Login</a></li>
            <li><a href="register.html" class="${isActivePage('register.html') ? 'active' : ''}">Register</a></li>
        `;
    }

    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    }
}

function isActivePage(page) {
    return window.location.pathname.includes(page) || 
           (page === 'index.html' && window.location.pathname === '/');
}

// Page Protection
function protectPage() {
    const currentPage = window.location.pathname;
    const protectedPages = ['add-car.html', 'edit-car.html'];
    
    if (protectedPages.some(page => currentPage.includes(page))) {
        if (!AuthService.isAuthenticated()) {
            alert('Please login to access this page');
            window.location.href = 'login.html';
            return false;
        }
    }
    return true;
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    
    // Protect pages that require authentication
    if (!protectPage()) {
        return;
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            try {
                await AuthService.login(email, password);
                alert('Login successful!');
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                alert('Password must be at least 6 characters long');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Registering...';

            try {
                await AuthService.register(email, password);
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } catch (error) {
                alert(error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Register';
            }
        });
    }
});

// Make functions available globally
window.AuthService = AuthService;
window.updateNavigation = updateNavigation;
window.protectPage = protectPage;

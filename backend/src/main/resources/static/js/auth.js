// ── Storage helpers ───────────────────────────────────
function getAuthToken()    { return localStorage.getItem('token'); }
function setAuthToken(t)   { localStorage.setItem('token', t); }
function removeAuthToken() { localStorage.removeItem('token'); }

function getCurrentUser()   { const u = localStorage.getItem('currentUser'); return u ? JSON.parse(u) : null; }
function setCurrentUser(u)  { localStorage.setItem('currentUser', JSON.stringify(u)); }
function removeCurrentUser(){ localStorage.removeItem('currentUser'); }

// ── API helper (relative URLs — no port hardcoded) ────
async function apiCall(url, options = {}) {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) { logout(); return; }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
    }
    return data;
}

// ── Login ─────────────────────────────────────────────
async function login(event) {
    event.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error-message');

    try {
        // Backend LoginRequest requires: email, password
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        setAuthToken(data.token);
        setCurrentUser({ email: data.email, role: data.role });

        window.location.href = data.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
    }
}

// ── Register ──────────────────────────────────────────
async function register(event) {
    event.preventDefault();

    const errorDiv   = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    // Backend RegisterRequest requires: name, email, password, role
    const payload = {
        name:     document.getElementById('name').value.trim(),
        email:    document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        role:     document.getElementById('role').value
    };

    try {
        await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        successDiv.textContent = 'Registration successful! Redirecting to login...';
        successDiv.style.display = 'block';
        setTimeout(() => { window.location.href = '/login'; }, 2000);

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
        setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
    }
}

// ── Logout / Guard ────────────────────────────────────
function logout() {
    removeAuthToken();
    removeCurrentUser();
    window.location.href = '/login';
}

function checkAuth() {
    if (!getAuthToken()) { window.location.href = '/login'; return false; }
    return true;
}

// ── Wire up forms ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm)    loginForm.addEventListener('submit', login);
    if (registerForm) registerForm.addEventListener('submit', register);
});

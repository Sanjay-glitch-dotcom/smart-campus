import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://smart-campus-backend-production-8019.up.railway.app/api',
    headers: { 'Content-Type': 'application/json' }
});

// ── Attach JWT automatically ──────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Global error handler ──────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── Auth ──────────────────────────────────
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

// ── Issues: CRUD ──────────────────────────
export const submitIssue = (data) => api.post('/issues', data);
export const getMyIssues = () => api.get('/issues/my');
export const getIssueById = (id) => api.get(`/issues/${id}`);
export const updateIssue = (id, data) => api.put(`/issues/${id}`, data);
export const deleteIssue = (id) => api.delete(`/issues/${id}`);
export const updateStatus = (id, status) =>
    api.patch(`/issues/${id}/status?status=${status}`);

// ── Upvote ────────────────────────────────
export const toggleUpvote = (id) =>
    api.put(`/issues/${id}/upvote`);

// ── Admin ─────────────────────────────────
export const getAllIssues = () => api.get('/admin/issues');
export const getDashboardStats = () => api.get('/admin/dashboard/summary');

export const getAllIssuesForDeptHead = () => api.get('/issues');

export default api;
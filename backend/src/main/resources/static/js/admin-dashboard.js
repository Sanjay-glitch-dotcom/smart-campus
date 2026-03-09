const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
        window.location.href = '/dashboard';
        return;
    }

    const infoEl = document.getElementById('admin-info');
    if (infoEl) infoEl.textContent = currentUser.email;

    loadAdminDashboard();
});

// ── Dashboard Summary (uses correct endpoint) ─────────
async function loadAdminDashboard() {
    try {
        const summary = await apiCall(`${API_BASE}/admin/dashboard/summary`);
        displayAdminStats(summary);
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
    loadAllIssues();
}

function displayAdminStats(stats) {
    const container = document.getElementById('admin-stats');
    if (!container) return;

    const byStatus   = stats.byStatus   || {};
    const byCategory = stats.byCategory || {};

    const statsData = [
        { label: 'Total Issues',  value: stats.totalIssues || 0,        icon: 'bi-list-task',       color: 'info' },
        { label: 'Open',          value: byStatus['OPEN'] || 0,          icon: 'bi-exclamation-circle', color: 'warning' },
        { label: 'In Progress',   value: byStatus['IN_PROGRESS'] || 0,   icon: 'bi-arrow-repeat',    color: 'primary' },
        { label: 'Resolved',      value: byStatus['RESOLVED'] || 0,      icon: 'bi-check-circle',    color: 'success' }
    ];

    container.innerHTML = statsData.map(s => `
        <div class="col-md-3 mb-3">
            <div class="stats-card bg-${s.color} text-white p-3 rounded text-center">
                <i class="bi ${s.icon} fs-2"></i>
                <h3>${s.value}</h3>
                <p class="mb-0">${s.label}</p>
            </div>
        </div>
    `).join('');
}

// ── All Issues ────────────────────────────────────────
async function loadAllIssues() {
    try {
        const issues = await apiCall(`${API_BASE}/admin/issues`);
        displayAllIssues(issues);
    } catch (error) {
        console.error('Error loading all issues:', error);
    }
}

function displayAllIssues(issues) {
    const container = document.getElementById('all-issues-list');
    if (!container) return;

    if (!issues || issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No issues found.</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>#</th><th>Title</th><th>Category</th>
                        <th>Priority</th><th>Status</th><th>Reported By</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${issues.map(issue => `
                        <tr>
                            <td>${issue.id}</td>
                            <td>${escapeHtml(issue.title)}</td>
                            <td><span class="badge bg-secondary">${issue.category || ''}</span></td>
                            <td><span class="badge priority-${issue.priority.toLowerCase()}">${issue.priority}</span></td>
                            <td><span class="badge status-${issue.status.toLowerCase()}">${issue.status}</span></td>
                            <td>${escapeHtml(issue.reportedBy || '')}</td>
                            <td>
                                <select class="form-select form-select-sm"
                                        onchange="updateIssueStatus(${issue.id}, this.value)">
                                    <option value="">Update Status</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ── Status Update (PATCH as defined in backend) ───────
async function updateIssueStatus(issueId, status) {
    if (!status) return;
    try {
        await apiCall(`${API_BASE}/issues/${issueId}/status?status=${status}`, { method: 'PATCH' });
        alert('Status updated!');
        loadAllIssues();
        loadAdminDashboard();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ── Section Navigation ────────────────────────────────
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(`${section}-section`);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    if (section === 'issues') loadAllIssues();
    if (section === 'dashboard') loadAdminDashboard();
}

// ── Utilities ─────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

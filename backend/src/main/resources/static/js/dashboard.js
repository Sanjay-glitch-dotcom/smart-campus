// Uses relative URLs — no hardcoded port needed
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
        const infoEl = document.getElementById('user-info');
        if (infoEl) infoEl.textContent = currentUser.email;

        const assignedLink = document.getElementById('assigned-issues-link');
        if (assignedLink && (currentUser.role === 'ADMIN' || currentUser.role === 'DEPARTMENT_HEAD')) {
            assignedLink.style.display = 'block';
        }
    }

    loadMyIssues();
});

// ── My Issues ─────────────────────────────────────────
async function loadMyIssues() {
    try {
        const issues = await apiCall(`${API_BASE}/issues/my`);
        displayMyIssues(issues);
        displayRecentIssues(issues.slice(0, 5));
    } catch (error) {
        console.error('Error loading my issues:', error);
    }
}

function displayMyIssues(issues) {
    const container = document.getElementById('my-issues-list');
    if (!container) return;

    if (!issues || issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No issues reported yet.</p>';
        return;
    }

    container.innerHTML = issues.map(issue => `
        <div class="issue-card card mb-2">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${escapeHtml(issue.title)}</h5>
                        <p class="card-text">${escapeHtml(issue.description || '')}</p>
                        <small class="text-muted">
                            <i class="bi bi-geo-alt"></i> ${escapeHtml(issue.location || 'No location')} |
                            <i class="bi bi-calendar"></i> ${formatDate(issue.createdAt)}
                        </small>
                    </div>
                    <div class="text-end">
                        <span class="badge status-${issue.status.toLowerCase()}">${issue.status}</span><br>
                        <span class="badge priority-${issue.priority.toLowerCase()}">${issue.priority}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayRecentIssues(issues) {
    const container = document.getElementById('recent-issues');
    if (!container) return;

    if (!issues || issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent issues.</p>';
        return;
    }

    container.innerHTML = issues.map(issue => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${escapeHtml(issue.title)}</h6>
                    <small class="text-muted">${formatDate(issue.createdAt)}</small>
                </div>
                <span class="badge status-${issue.status.toLowerCase()}">${issue.status}</span>
            </div>
        </div>
    `).join('');
}

// ── Submit Issue ──────────────────────────────────────
async function submitIssue(event) {
    event.preventDefault();

    // Field names match backend IssueRequest DTO
    const formData = {
        title:       document.getElementById('title').value,
        description: document.getElementById('description').value,
        category:    document.getElementById('category')?.value || document.getElementById('type')?.value,
        priority:    document.getElementById('priority').value,
        location:    document.getElementById('location')?.value || ''
    };

    try {
        await apiCall(`${API_BASE}/issues`, { method: 'POST', body: JSON.stringify(formData) });
        alert('Issue reported successfully!');
        document.getElementById('issueForm').reset();
        loadMyIssues();
    } catch (error) {
        alert('Error reporting issue: ' + error.message);
    }
}

// ── Status Update (PATCH, not PUT) ────────────────────
async function updateIssueStatus(issueId, status) {
    if (!status) return;
    try {
        await apiCall(`${API_BASE}/issues/${issueId}/status?status=${status}`, { method: 'PATCH' });
        alert('Issue status updated successfully!');
        loadMyIssues();
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

// ── Section Navigation ────────────────────────────────
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(`${section}-section`);
    if (target) target.style.display = 'block';

    document.querySelectorAll('.list-group-item').forEach(item => item.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

// ── Utilities ─────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
}

// Dashboard JavaScript
const API_BASE = '/api';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('user-info').textContent = currentUser.fullName;
        
        // Show assigned issues link for staff/admin
        if (currentUser.role === 'ADMIN' || currentUser.role === 'DEPARTMENT_HEAD' || currentUser.role === 'STAFF') {
            document.getElementById('assigned-issues-link').style.display = 'block';
        }
    }
    
    loadDashboardData();
    loadMyIssues();
    
    // Setup issue form
    const issueForm = document.getElementById('issueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', submitIssue);
    }
});

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await apiCall(`${API_BASE}/issues/statistics`);
        displayStats(response);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Display statistics
function displayStats(stats) {
    const statsCards = document.getElementById('stats-cards');
    
    const statsData = [
        { label: 'Total Issues', value: stats.total_issues || 0, icon: 'bi-list-task', color: 'primary' },
        { label: 'Open Issues', value: stats.open_issues || 0, icon: 'bi-exclamation-circle', color: 'warning' },
        { label: 'In Progress', value: stats.in_progress || 0, icon: 'bi-arrow-repeat', color: 'info' },
        { label: 'Resolved', value: stats.resolved || 0, icon: 'bi-check-circle', color: 'success' }
    ];
    
    statsCards.innerHTML = statsData.map(stat => `
        <div class="col-md-3">
            <div class="stats-card bg-${stat.color}">
                <i class="bi ${stat.icon} fs-2"></i>
                <h3>${stat.value}</h3>
                <p>${stat.label}</p>
            </div>
        </div>
    `).join('');
}

// Load user's issues
async function loadMyIssues() {
    try {
        const issues = await apiCall(`${API_BASE}/issues/my`);
        displayMyIssues(issues);
        displayRecentIssues(issues.slice(0, 5));
    } catch (error) {
        console.error('Error loading my issues:', error);
    }
}

// Display my issues
function displayMyIssues(issues) {
    const container = document.getElementById('my-issues-list');
    
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No issues reported yet.</p>';
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="issue-card card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${issue.title}</h5>
                        <p class="card-text">${issue.description || 'No description'}</p>
                        <small class="text-muted">
                            <i class="bi bi-geo-alt"></i> ${issue.location || 'No location'} | 
                            <i class="bi bi-calendar"></i> ${new Date(issue.createdAt).toLocaleDateString()}
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

// Display recent issues
function displayRecentIssues(issues) {
    const container = document.getElementById('recent-issues');
    
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent issues.</p>';
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${issue.title}</h6>
                    <small class="text-muted">${new Date(issue.createdAt).toLocaleDateString()}</small>
                </div>
                <span class="badge status-${issue.status.toLowerCase()}">${issue.status}</span>
            </div>
        </div>
    `).join('');
}

// Submit new issue
async function submitIssue(event) {
    event.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        type: document.getElementById('type').value,
        priority: document.getElementById('priority').value,
        location: document.getElementById('location').value,
        building: document.getElementById('building').value,
        roomNumber: document.getElementById('roomNumber').value
    };
    
    try {
        await apiCall(`${API_BASE}/issues`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        alert('Issue reported successfully!');
        document.getElementById('issueForm').reset();
        showSection('overview');
        loadMyIssues();
        loadDashboardData();
        
    } catch (error) {
        alert('Error reporting issue: ' + error.message);
    }
}

// Load assigned issues
async function loadAssignedIssues() {
    try {
        const issues = await apiCall(`${API_BASE}/issues/assigned`);
        displayAssignedIssues(issues);
    } catch (error) {
        console.error('Error loading assigned issues:', error);
    }
}

// Display assigned issues
function displayAssignedIssues(issues) {
    const container = document.getElementById('assigned-issues-list');
    
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No issues assigned to you.</p>';
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="issue-card card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${issue.title}</h5>
                        <p class="card-text">${issue.description || 'No description'}</p>
                        <small class="text-muted">
                            <i class="bi bi-person"></i> ${issue.reportedBy?.fullName || 'Unknown'} | 
                            <i class="bi bi-geo-alt"></i> ${issue.location || 'No location'}
                        </small>
                    </div>
                    <div class="text-end">
                        <span class="badge status-${issue.status.toLowerCase()}">${issue.status}</span><br>
                        <span class="badge priority-${issue.priority.toLowerCase()}">${issue.priority}</span>
                        <div class="mt-2">
                            <select class="form-select form-select-sm" onchange="updateIssueStatus(${issue.id}, this.value)">
                                <option value="">Update Status</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update issue status
async function updateIssueStatus(issueId, status) {
    if (!status) return;
    
    try {
        await apiCall(`${API_BASE}/issues/${issueId}/status?status=${status}`, {
            method: 'PUT'
        });
        
        alert('Issue status updated successfully!');
        loadAssignedIssues();
        loadDashboardData();
        
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Update nav
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section-specific data
    if (section === 'assigned-issues') {
        loadAssignedIssues();
    }
}
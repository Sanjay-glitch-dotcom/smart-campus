// Admin Dashboard JavaScript
const API_BASE = '/api';

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'ADMIN') {
        document.getElementById('admin-info').textContent = currentUser.fullName;
    } else {
        window.location.href = '/dashboard';
        return;
    }
    
    loadAdminDashboard();
});

// Load admin dashboard data
async function loadAdminDashboard() {
    try {
        const response = await apiCall(`${API_BASE}/admin/dashboard`);
        displayAdminStats(response);
        loadAllIssues();
        loadUsers();
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

// Display admin statistics
function displayAdminStats(stats) {
    const container = document.getElementById('admin-stats');
    
    const statsData = [
        { label: 'Total Users', value: stats.totalUsers || 0, icon: 'bi-people', color: 'primary' },
        { label: 'Total Issues', value: stats.totalIssues || 0, icon: 'bi-list-task', color: 'info' },
        { label: 'Open Issues', value: stats.openIssues || 0, icon: 'bi-exclamation-circle', color: 'warning' },
        { label: 'Resolved Issues', value: stats.resolvedIssues || 0, icon: 'bi-check-circle', color: 'success' },
        { label: 'Students', value: stats.studentsCount || 0, icon: 'bi-mortarboard', color: 'secondary' },
        { label: 'Staff', value: stats.staffCount || 0, icon: 'bi-briefcase', color: 'dark' }
    ];
    
    container.innerHTML = statsData.map(stat => `
        <div class="col-md-4 mb-3">
            <div class="stats-card bg-${stat.color}">
                <i class="bi ${stat.icon} fs-2"></i>
                <h3>${stat.value}</h3>
                <p>${stat.label}</p>
            </div>
        </div>
    `).join('');
}

// Load all issues
async function loadAllIssues() {
    try {
        const issues = await apiCall(`${API_BASE}/issues`);
        displayAllIssues(issues);
        displayRecentIssuesAdmin(issues.slice(0, 5));
    } catch (error) {
        console.error('Error loading all issues:', error);
    }
}

// Display all issues
function displayAllIssues(issues) {
    const container = document.getElementById('all-issues-list');
    
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No issues found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Reported By</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${issues.map(issue => `
                        <tr>
                            <td>${issue.title}</td>
                            <td><span class="badge bg-secondary">${issue.type}</span></td>
                            <td><span class="badge priority-${issue.priority.toLowerCase()}">${issue.priority}</span></td>
                            <td><span class="badge status-${issue.status.toLowerCase()}">${issue.status}</span></td>
                            <td>${issue.reportedBy?.fullName || 'N/A'}</td>
                            <td>${issue.assignedTo?.fullName || 'Unassigned'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="openAssignModal(${issue.id})" 
                                        ${issue.assignedTo ? 'disabled' : ''}>
                                    Assign
                                </button>
                                <button class="btn btn-sm btn-info" onclick="viewIssueDetails(${issue.id})">
                                    View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Display recent issues for admin
function displayRecentIssuesAdmin(issues) {
    const container = document.getElementById('recent-issues-admin');
    
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No recent issues.</p>';
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${issue.title}</h6>
                    <small class="text-muted">
                        ${issue.reportedBy?.fullName} | ${new Date(issue.createdAt).toLocaleDateString()}
                    </small>
                </div>
                <div>
                    <span class="badge priority-${issue.priority.toLowerCase()}">${issue.priority}</span>
                    <span class="badge status-${issue.status.toLowerCase()} ms-2">${issue.status}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load unassigned issues
async function loadUnassignedIssues() {
    try {
        const issues = await apiCall(`${API_BASE}/issues/unassigned`);
        displayUnassignedIssues(issues);
    } catch (error) {
        console.error('Error loading unassigned issues:', error);
    }
}

// Display unassigned issues
function displayUnassignedIssues(issues) {
    const container = document.getElementById('unassigned-issues-list');
    
    if (issues.length === 0) {
        container.innerHTML = '<p class="text-muted">No unassigned issues.</p>';
        return;
    }
    
    container.innerHTML = issues.map(issue => `
        <div class="issue-card card ${issue.priority === 'HIGH' || issue.priority === 'URGENT' ? 'high-priority' : ''}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${issue.title}</h5>
                        <p class="card-text">${issue.description || 'No description'}</p>
                        <small class="text-muted">
                            <i class="bi bi-person"></i> ${issue.reportedBy?.fullName || 'Unknown'} | 
                            <i class="bi bi-geo-alt"></i> ${issue.location || 'No location'} | 
                            <i class="bi bi-calendar"></i> ${new Date(issue.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                    <div class="text-end">
                        <span class="badge priority-${issue.priority.toLowerCase()}">${issue.priority}</span>
                        <div class="mt-2">
                            <button class="btn btn-sm btn-primary" onclick="openAssignModal(${issue.id})">
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load users
async function loadUsers() {
    try {
        const users = await apiCall(`${API_BASE}/admin/users`);
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Display users
function displayUsers(users) {
    const container = document.getElementById('users-list');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="text-muted">No users found.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.fullName}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td><span class="badge bg-primary">${user.role}</span></td>
                            <td>${user.department || 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-warning" onclick="editUser(${user.id})">
                                    Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Open assignment modal
async function openAssignModal(issueId) {
    try {
        const staff = await apiCall(`${API_BASE}/admin/users/role/STAFF`);
        const select = document.getElementById('assignTo');
        
        select.innerHTML = '<option value="">Select Staff Member</option>' +
            staff.map(user => `<option value="${user.id}">${user.fullName} - ${user.department}</option>`).join('');
        
        select.dataset.issueId = issueId;
        
        const modal = new bootstrap.Modal(document.getElementById('assignModal'));
        modal.show();
        
    } catch (error) {
        alert('Error loading staff: ' + error.message);
    }
}

// Assign issue
async function assignIssue() {
    const select = document.getElementById('assignTo');
    const issueId = select.dataset.issueId;
    const assignedToId = select.value;
    
    if (!assignedToId) {
        alert('Please select a staff member');
        return;
    }
    
    try {
        await apiCall(`${API_BASE}/issues/${issueId}/assign?assignedToId=${assignedToId}`, {
            method: 'PUT'
        });
        
        alert('Issue assigned successfully!');
        bootstrap.Modal.getInstance(document.getElementById('assignModal')).hide();
        loadAllIssues();
        loadUnassignedIssues();
        
    } catch (error) {
        alert('Error assigning issue: ' + error.message);
    }
}

// Search issues
async function searchIssues() {
    const keyword = document.getElementById('search-issues').value;
    
    try {
        const issues = await apiCall(`${API_BASE}/issues/search?keyword=${keyword}`);
        displayAllIssues(issues);
    } catch (error) {
        alert('Error searching issues: ' + error.message);
    }
}

// Search users
async function searchUsers() {
    const keyword = document.getElementById('search-users').value;
    
    try {
        const users = await apiCall(`${API_BASE}/admin/users/search?keyword=${keyword}`);
        displayUsers(users);
    } catch (error) {
        alert('Error searching users: ' + error.message);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        await apiCall(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE'
        });
        
        alert('User deleted successfully!');
        loadUsers();
        
    } catch (error) {
        alert('Error deleting user: ' + error.message);
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
    switch(section) {
        case 'issues':
            loadAllIssues();
            break;
        case 'unassigned':
            loadUnassignedIssues();
            break;
        case 'users':
            loadUsers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const stats = await apiCall(`${API_BASE}/issues/statistics`);
        displayAnalytics(stats);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Display analytics
function displayAnalytics(stats) {
    // This would integrate with Chart.js for visualizations
    document.getElementById('type-chart').innerHTML = '<p>Issue type chart would be displayed here</p>';
    document.getElementById('priority-chart').innerHTML = '<p>Priority distribution chart would be displayed here</p>';
    document.getElementById('trends-chart').innerHTML = '<p>Resolution trends chart would be displayed here</p>';
}
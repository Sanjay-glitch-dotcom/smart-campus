const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    const currentUser = getCurrentUser();
    const infoEl = document.getElementById('user-info');
    if (infoEl && currentUser) infoEl.textContent = currentUser.email;

    const issueForm = document.getElementById('issueForm');
    if (issueForm) issueForm.addEventListener('submit', submitIssue);
});

async function submitIssue(event) {
    event.preventDefault();

    // Field names match backend IssueRequest: title, description, category, priority, location
    const formData = {
        title:       document.getElementById('title').value,
        description: document.getElementById('description').value,
        category:    document.getElementById('category')?.value || document.getElementById('type')?.value,
        priority:    document.getElementById('priority').value,
        location:    document.getElementById('location')?.value || ''
    };

    const errorDiv   = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    try {
        await apiCall(`${API_BASE}/issues`, { method: 'POST', body: JSON.stringify(formData) });

        if (successDiv) {
            successDiv.textContent = 'Issue reported successfully! Redirecting to dashboard...';
            successDiv.style.display = 'block';
        }
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
        }
    }
}

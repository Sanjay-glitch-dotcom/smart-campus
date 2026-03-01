// Issue Form JavaScript
const API_BASE = '/api';

// Initialize issue form
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('user-info').textContent = currentUser.fullName;
    }
    
    // Setup form submission
    const issueForm = document.getElementById('issueForm');
    if (issueForm) {
        issueForm.addEventListener('submit', submitIssue);
    }
});

// Submit issue
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
    
    // Handle file attachment
    const attachmentInput = document.getElementById('attachment');
    if (attachmentInput.files.length > 0) {
        // In a real implementation, you would upload the file first
        // and set the attachment path here
        formData.attachmentPath = '/uploads/' + attachmentInput.files[0].name;
    }
    
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    try {
        await apiCall(`${API_BASE}/issues`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        successDiv.textContent = 'Issue reported successfully! Redirecting to dashboard...';
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { submitIssue, getIssueById, updateIssue } from '../services/api';
import SelectBox from '../components/SelectBox';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';

export default function IssueForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const [form, setForm] = useState({
        title: '', description: '', category: 'WIFI',
        priority: 'MEDIUM', location: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            getIssueById(id)
                .then(res => {
                    const issue = res.data;
                    setForm({
                        title: issue.title,
                        description: issue.description,
                        category: issue.category,
                        priority: issue.priority,
                        location: issue.location || ''
                    });
                })
                .catch(() => setError('Issue not found'));
        }
    }, [id, isEdit]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isEdit) {
                await updateIssue(id, form);
                setSuccess('Issue updated successfully!');
            } else {
                await submitIssue(form);
                setSuccess('Issue submitted! You will receive a confirmation email.');
            }
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || `${isEdit ? 'Update' : 'Submission'} failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <button onClick={() => navigate('/dashboard')} style={styles.back}>
                        ← Back
                    </button>
                    <h2 style={styles.title}>
                        {isEdit ? 'Edit Issue' : 'Report New Issue'}
                    </h2>
                </div>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Issue Title *</label>
                        <input
                            style={styles.input}
                            name="title"
                            placeholder="e.g. WiFi not working in Block B"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <SelectBox
                                label="Category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                options={CATEGORY_OPTIONS}
                                placeholder="-- Select Category --"
                                required
                            />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                            <SelectBox
                                label="Priority"
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                options={PRIORITY_OPTIONS}
                                placeholder="-- Select Priority --"
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Location</label>
                        <input
                            style={styles.input}
                            name="location"
                            placeholder="e.g. Block A, Room 203"
                            value={form.location}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Description *</label>
                        <textarea
                            style={styles.textarea}
                            name="description"
                            placeholder="Describe the issue in detail..."
                            value={form.description}
                            onChange={handleChange}
                            rows={5}
                            required
                        />
                    </div>

                    <button style={styles.button} disabled={loading}>
                        {loading ? (isEdit ? 'Updating...' : 'Submitting...') : 
                                (isEdit ? 'Update Issue' : 'Submit Issue')}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'var(--bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
    },
    card: {
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '620px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)'
    },
    header: { marginBottom: '28px' },
    back: {
        background: 'none',
        border: 'none',
        color: 'var(--button-primary)',
        cursor: 'pointer',
        fontSize: '14px',
        padding: 0,
        marginBottom: '12px',
        display: 'block'
    },
    title: {
        margin: 0,
        color: 'var(--text-primary)',
        fontSize: '24px'
    },
    error: {
        background: '#fdecea',
        color: '#c0392b',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    success: {
        background: '#e8f5e9',
        color: '#2e7d32',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    field: { marginBottom: '18px' },
    row: { display: 'flex', gap: '16px' },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '600',
        fontSize: '14px',
        color: 'var(--text-primary)'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)'
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
        resize: 'vertical',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)'
    },
    button: {
        width: '100%',
        padding: '13px',
        background: 'var(--button-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: '600'
    }
};
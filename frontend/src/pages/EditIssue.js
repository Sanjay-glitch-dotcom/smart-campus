import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIssueById, updateIssue } from '../services/api';
import SelectBox from '../components/SelectBox';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';

export default function EditIssue() {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'WIFI',
        priority: 'MEDIUM',
        location: ''
    });

    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');

    useEffect(() => {
        getIssueById(id)
            .then(res => {
                const issue = res.data;

                if (issue.status !== 'OPEN') {
                    alert('Only OPEN issues can be edited.');
                    navigate(`/issues/${id}`);
                    return;
                }

                setForm({
                    title: issue.title,
                    description: issue.description,
                    category: issue.category,
                    priority: issue.priority,
                    location: issue.location || ''
                });
            })
            .catch(() => {
                setError('Failed to load issue.');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            await updateIssue(id, form);
            setSuccess('Issue updated successfully! Redirecting...');
            setTimeout(() => navigate(`/issues/${id}`), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p style={styles.center}>Loading issue...</p>;

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.header}>
                    <button
                        onClick={() => navigate(`/issues/${id}`)}
                        style={styles.back}
                    >
                        ← Back
                    </button>
                    <h2 style={styles.title}>Edit Issue #{id}</h2>
                    <p style={styles.subtitle}>
                        Only OPEN issues can be edited
                    </p>
                </div>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>

                    <div style={styles.field}>
                        <label style={styles.label}>Issue Title *</label>
                        <input
                            style={styles.input}
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. WiFi not working in Block B"
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
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Block A, Room 203"
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Description *</label>
                        <textarea
                            style={styles.textarea}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Describe the issue in detail..."
                            required
                        />
                    </div>

                    <div style={styles.actions}>
                        <button
                            type="button"
                            onClick={() => navigate(`/issues/${id}`)}
                            style={styles.cancelBtn}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            style={styles.submitBtn}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

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
        margin: '0 0 4px',
        color: 'var(--text-primary)',
        fontSize: '24px'
    },

    subtitle: {
        margin: 0,
        color: 'var(--text-muted)',
        fontSize: '13px'
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

    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '8px'
    },

    cancelBtn: {
        padding: '11px 24px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        background: 'transparent',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },

    submitBtn: {
        padding: '11px 28px',
        background: 'var(--button-primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },

    center: {
        textAlign: 'center',
        marginTop: '80px',
        color: 'var(--text-secondary)'
    }
};
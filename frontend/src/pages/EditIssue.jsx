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

    // 📸 Photo states
    const [photos, setPhotos] = useState([]);
    const [preview, setPreview] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);

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

                // Load existing photos
                setExistingPhotos(issue.photoUrls || []);
                setPreview(issue.photoUrls?.map(url => `http://localhost:8082${url}`) || []);
            })
            .catch(() => {
                setError('Failed to load issue.');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(prevPhotos => [...prevPhotos, ...files]);
        setPreview(prevPreview => [
            ...prevPreview, 
            ...files.map(file => URL.createObjectURL(file))
        ]);
    };

    const clearNewPhotos = () => {
        setPhotos([]);
        // Keep existing photos, only remove new ones
        setPreview(existingPhotos.map(url => `http://localhost:8082${url}`));
    };

    const removePhoto = (index) => {
        const newPreview = preview.filter((_, i) => i !== index);
        setPreview(newPreview);
        
        // Also remove from existing if it was an existing photo
        if (index < existingPhotos.length) {
            const newExisting = existingPhotos.filter((_, i) => i !== index);
            setExistingPhotos(newExisting);
        } else {
            // Remove from new photos
            const newPhotos = photos.filter((_, i) => i !== (index - existingPhotos.length));
            setPhotos(newPhotos);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            // 1. Upload new photos first
            const newPhotoUrls = [];

            for (const file of photos) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('http://localhost:8082/api/files/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    newPhotoUrls.push(result.photoUrl);
                }
            }

            // 2. Combine existing + new photos
            const allPhotoUrls = [...existingPhotos, ...newPhotoUrls];

            // 3. Update issue with all photos
            const issueData = {
                ...form,
                photoUrls: allPhotoUrls
            };

            await updateIssue(id, issueData);
            setSuccess('Issue updated successfully! Redirecting...');
            
            // ✅ Navigate immediately (triggers IssueDetail refresh)
            setTimeout(() => {
                navigate(`/issues/${id}`);
            }, 1000); // Shorter delay for better UX
            
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

                    {/* 📸 Photo Upload Section */}
                    <div style={styles.field}>
                        <label style={styles.label}>Add/Update Photos</label>
                        <div style={styles.photoButtons}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                                id="gallery-upload"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                capture="environment"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                                id="camera-upload"
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('gallery-upload').click()}
                                style={styles.photoButton}
                            >
                                📁 Add Photos
                            </button>
                            <button
                                type="button"
                                onClick={() => document.getElementById('camera-upload').click()}
                                style={styles.photoButton}
                            >
                                📸 Take Photos
                            </button>
                        </div>
                        <small style={styles.helpText}>
                            Add new photos or keep existing ones. Click × to remove any photo.
                        </small>
                    </div>

                    {/* 🖼️ Photo Preview */}
                    {preview.length > 0 && (
                        <div style={styles.previewSection}>
                            <div style={styles.previewHeader}>
                                <span style={styles.previewTitle}>Photos ({preview.length})</span>
                                {photos.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearNewPhotos}
                                        style={styles.clearButton}
                                    >
                                        Clear New
                                    </button>
                                )}
                            </div>
                            <div style={styles.previewGrid}>
                                {preview.map((src, index) => (
                                    <div key={index} style={styles.photoItem}>
                                        <img
                                            src={src}
                                            alt={`Photo ${index + 1}`}
                                            style={styles.photoPreview}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            style={styles.removeButton}
                                        >
                                            ×
                                        </button>
                                        {index < existingPhotos.length && (
                                            <div style={styles.existingBadge}>Existing</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button style={styles.button} disabled={saving}>
                        {saving ? 'Updating...' : 'Update Issue'}
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
        fontSize: '24px',
        marginBottom: '4px'
    },
    subtitle: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        margin: 0,
        fontStyle: 'italic'
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
    },
    center: {
        textAlign: 'center',
        marginTop: '80px',
        color: 'var(--text-secondary)'
    },
    
    // 📸 Photo Upload Styles
    photoButtons: {
        display: 'flex',
        gap: '10px',
        marginBottom: '8px'
    },
    photoButton: {
        flex: 1,
        padding: '10px',
        background: 'var(--button-secondary, #6c757d)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    helpText: {
        color: 'var(--text-secondary, #6c757d)',
        fontSize: '12px',
        fontStyle: 'italic'
    },
    previewSection: {
        marginBottom: '18px'
    },
    previewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    previewTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    clearButton: {
        padding: '4px 8px',
        background: '#ffc107',
        color: '#000',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        cursor: 'pointer'
    },
    previewGrid: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    photoItem: {
        position: 'relative',
        display: 'inline-block'
    },
    photoPreview: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '2px solid var(--border-color)'
    },
    removeButton: {
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        width: '20px',
        height: '20px',
        background: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        fontSize: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    existingBadge: {
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        fontSize: '8px',
        padding: '2px 4px',
        borderRadius: '2px'
    }
};
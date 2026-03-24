import React, { useState, useEffect } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom';
import { submitIssue, getIssueById, updateIssue, classifyIssue } from '../services/api';
import SelectBox from '../components/SelectBox';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../utils/constants';
import { getApiUrl } from '../utils/helpers';

export default function IssueForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;
    
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'WIFI',
        priority: 'MEDIUM',
        location: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiClassifying, setAiClassifying] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [preview, setPreview] = useState([]);

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        
        // Trigger AI classification when description changes
        if (e.target.name === 'description' && e.target.value.length > 10) {
            classifyDescription(e.target.value);
        }
    };

    const classifyDescription = async (description) => {
        if (aiClassifying) return; // Prevent multiple simultaneous calls
        
        setAiClassifying(true);
        try {
            const response = await classifyIssue(description);
            const { category, priority } = response.data;
            
            // Update form with AI-suggested values
            setForm(prev => ({
                ...prev,
                category: category || prev.category,
                priority: priority || prev.priority
            }));
        } catch (err) {
            console.warn('AI classification failed:', err);
            // Silently fail - user can still manually select
        } finally {
            setAiClassifying(false);
        }
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setPhotos(prevPhotos => [...prevPhotos, ...files]);
        setPreview(prevPreview => [
            ...prevPreview, 
            ...files.map(file => URL.createObjectURL(file))
        ]);
    };

    const clearPhotos = () => {
        setPhotos([]);
        setPreview([]);
    };

    const removePhoto = (index) => {
        const newPhotos = photos.filter((_, i) => i !== index);
        const newPreview = preview.filter((_, i) => i !== index);
        setPhotos(newPhotos);
        setPreview(newPreview);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // 1. Upload photos in parallel for better performance
            let photoUrls = [];
            
            if (photos.length > 0) {
                const uploadPromises = photos.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch(`${getApiUrl()}/files/upload`, {
                        method: 'POST',
                        body: formData,
                        signal: AbortSignal.timeout(30000) // 30 second timeout
                    });

                    const result = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(result.message || `Failed to upload ${file.name}`);
                    }
                    
                    if (!result.success) {
                        throw new Error(result.message || `Failed to upload ${file.name}`);
                    }
                    
                    return result.photoUrl;
                });

                try {
                    photoUrls = await Promise.all(uploadPromises);
                } catch (uploadError) {
                    throw new Error('Photo upload failed: ' + uploadError.message);
                }
            }

            // 2. Prepare issue data
            const issueData = {
                title: form.title,
                description: form.description,
                category: form.category,
                priority: form.priority,
                location: form.location,
                photoUrls: photoUrls
            };

            // 3. Submit or update
            if (isEdit) {
                await updateIssue(id, issueData);
                setSuccess('Issue updated successfully!');
            } else {
                await submitIssue(issueData);
                setSuccess('Issue submitted successfully!');
            }

            // 4. Navigate after a short delay to show success message
            setTimeout(() => navigate('/dashboard'), 1500);

        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
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
                            {aiClassifying && <small style={styles.aiHint}>AI will suggest category based on description</small>}
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
                            {aiClassifying && <small style={styles.aiHint}>AI will suggest priority based on description</small>}
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
                        <label style={styles.label}>
                            Description *
                            {aiClassifying && <span style={styles.aiIndicator}> 🤖 AI is categorizing...</span>}
                        </label>
                        <div style={styles.descriptionContainer}>
                            <textarea
                                style={styles.textarea}
                                name="description"
                                placeholder="Describe the issue in detail..."
                                value={form.description}
                                onChange={handleChange}
                                rows={5}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => classifyDescription(form.description)}
                                disabled={aiClassifying || !form.description.trim()}
                                style={{
                                    ...styles.aiButton,
                                    ...(aiClassifying ? styles.aiButtonDisabled : {})
                                }}
                            >
                                {aiClassifying ? '🤖 Classifying...' : '🤖 AI Classify'}
                            </button>
                        </div>
                        {aiClassifying && <small style={styles.aiHint}>AI is analyzing your description...</small>}
                    </div>

                    {/* 📸 Photo Upload Section */}
                    <div style={styles.field}>
                        <label style={styles.label}>Add Photos</label>
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
                                📁 Gallery
                            </button>
                            <button
                                type="button"
                                onClick={() => document.getElementById('camera-upload').click()}
                                style={styles.photoButton}
                            >
                                📸 Camera
                            </button>
                        </div>
                        <small style={styles.helpText}>
                            You can upload multiple photos from gallery or capture from camera
                        </small>
                    </div>

                    {/* 🖼️ Photo Preview */}
                    {preview.length > 0 && (
                        <div style={styles.previewSection}>
                            <div style={styles.previewHeader}>
                                <span style={styles.previewTitle}>Photos ({preview.length})</span>
                                <button
                                    type="button"
                                    onClick={clearPhotos}
                                    style={styles.clearButton}
                                >
                                    Clear All
                                </button>
                            </div>
                            <div style={styles.previewGrid}>
                                {preview.map((src, index) => (
                                    <div key={index} style={styles.photoItem}>
                                        <img
                                            src={src}
                                            alt={`preview ${index + 1}`}
                                            style={styles.photoPreview}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            style={styles.removeButton}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button style={styles.button} disabled={loading}>
                        {loading
                            ? (isEdit ? 'Updating...' : 'Submitting...')
                            : (isEdit ? 'Update Issue' : 'Submit Issue')}
                    </button>
                </form>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}
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
        padding: '16px',
        boxSizing: 'border-box'
    },
    card: {
        background: 'var(--card-bg)',
        borderRadius: '12px',
        padding: 'clamp(20px, 5vw, 40px)',
        width: '100%',
        maxWidth: '620px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)',
        boxSizing: 'border-box'
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
    row: { 
        display: 'flex', 
        gap: '16px',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontWeight: '600',
        fontSize: '14px',
        color: 'var(--text-primary)'
    },
    input: {
        width:'100%',
        padding:'12px',
        border:'1px solid var(--border-color)',
        borderRadius:'6px',
        fontSize:'16px',
        boxSizing:'border-box',
        background:'var(--input-bg)',
        color:'var(--text-primary)',
        minHeight: '44px' // Touch-friendly
    },
    textarea: {
        width:'100%',
        padding:'12px',
        border:'1px solid var(--border-color)',
        borderRadius:'6px',
        fontSize:'16px',
        boxSizing:'border-box',
        resize:'vertical',
        background:'var(--input-bg)',
        color:'var(--text-primary)',
        minHeight: '120px' // Touch-friendly
    },
    button: {
        width:'100%',
        padding:'12px',
        background:'var(--button-primary)',
        color:'#fff',
        border:'none',
        borderRadius:'6px',
        fontSize:'16px',
        cursor:'pointer',
        fontWeight:'600',
        minHeight: '48px' // Touch-friendly
    },
    // 🎨 New Photo Upload Styles
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
        background: '#dc3545',
        color: '#fff',
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
    aiIndicator: {
        fontSize: '12px',
        color: '#007bff',
        fontStyle: 'italic',
        marginLeft: '8px'
    },
    aiHint: {
        color: '#6c757d',
        fontSize: '11px',
        fontStyle: 'italic',
        marginTop: '4px',
        display: 'block'
    },
    // 🤖 AI Classification Styles
    descriptionContainer: {
        position: 'relative'
    },
    aiButton: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '6px 12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '20px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10
    },
    aiButtonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    }
};
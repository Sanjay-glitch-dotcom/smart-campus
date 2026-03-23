import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, deleteIssue } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/helpers';

const STATUS_COLORS = {
    OPEN:        { background: '#fff3e0', color: '#e65100' },
    IN_PROGRESS: { background: '#e3f2fd', color: '#1565c0' },
    RESOLVED:    { background: '#e8f5e9', color: '#2e7d32' },
    CLOSED:      { background: '#f5f5f5', color: '#616161' }
};

const PRIORITY_COLORS = {
    LOW:      '#4caf50',
    MEDIUM:   '#ff9800',
    HIGH:     '#f44336',
    CRITICAL: '#9c27b0'
};

export default function IssueDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const getBackDestination = () => {
        const userRole = user?.role;
        return userRole === 'ADMIN' ? '/admin' : '/dashboard';
    };

    useEffect(() => {
        getIssueById(id)
            .then(res => setIssue(res.data))
            .catch(() => setError('Issue not found or access denied'))
            .finally(() => setLoading(false));

        // ✅ Add this - refresh when window gets focus
        const handleFocus = () => {
            if (!loading) { // Prevent loading loops
                getIssueById(id)
                    .then(res => setIssue(res.data))
                    .catch(() => {}); // Silent refresh
            }
        };
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [id, loading]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            try {
                await deleteIssue(id);
                navigate('/dashboard');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete issue');
            }
        }
    };

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error) return <p style={{ ...styles.center, color: '#e53935' }}>{error}</p>;

    const sc = STATUS_COLORS[issue.status] || {};
    const isOwner = user?.email === issue.reportedBy;
    const canEdit = isOwner && issue.status === 'OPEN';

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <button onClick={() => navigate(getBackDestination())} style={styles.back}>
                    ← Back
                </button>

                <div style={styles.headerRow}>
                    <h2 style={styles.title}>{issue.title}</h2>
                    <span style={{ ...styles.statusBadge, background: sc.background, color: sc.color }}>
                        {issue.status.replace('_', ' ')}
                    </span>
                </div>

                {canEdit && (
                    <div style={styles.actionButtons}>
                        <button onClick={() => navigate(`/issues/${id}/edit`)} style={styles.editBtn}>
                            ✏️ Edit Issue
                        </button>
                        <button onClick={handleDelete} style={styles.deleteBtn}>
                            🗑️ Delete Issue
                        </button>
                    </div>
                )}

                <div style={styles.metaGrid}>
                    {[
                        { label: 'Issue ID', value: `#${issue.id}` },
                        { label: 'Category', value: issue.category },
                        { label: 'Reported By', value: issue.reportedBy },
                        { label: 'Location', value: issue.location || '—' },
                        { label: 'Submitted', value: new Date(issue.createdAt).toLocaleString() },
                        {
                            label: 'Resolved At',
                            value: issue.resolvedAt
                                ? new Date(issue.resolvedAt).toLocaleString()
                                : '—'
                        }
                    ].map(({ label, value }) => (
                        <div key={label} style={styles.metaItem}>
                            <div style={styles.metaLabel}>{label}</div>
                            <div style={styles.metaValue}>{value}</div>
                        </div>
                    ))}

                    <div style={styles.metaItem}>
                        <div style={styles.metaLabel}>Priority</div>
                        <span style={{
                            ...styles.priorityBadge,
                            background: PRIORITY_COLORS[issue.priority]
                        }}>
                            {issue.priority}
                        </span>
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Description</h3>
                    <p style={styles.description}>{issue.description}</p>
                </div>

                {issue.photoUrls?.length > 0 && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            📸 Photos ({issue.photoUrls.length})
                        </h3>
                        <div style={styles.photoGrid}>
                            {issue.photoUrls.map((url, index) => (
                                <div key={index} style={styles.photoContainer}>
                                    <img
                                        src={getImageUrl(url)}
                                        alt={`Issue ${index}`}
                                        style={styles.photo}
                                        onClick={() => setSelectedPhoto(getImageUrl(url))}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {issue.history?.length > 0 && (
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>📅 Issue History</h3>
                        <div style={styles.timeline}>
                            {issue.history.map((item, index) => (
                                <div key={index} style={styles.timelineItem}>
                                    <div style={styles.timelineDot}></div>
                                    <div style={styles.timelineContent}>
                                        <div style={styles.timelineHeader}>
                                            <span>
                                                {item.fromStatus
                                                    ? `${item.fromStatus} → ${item.toStatus}`
                                                    : 'Created'}
                                            </span>
                                            <span>
                                                {new Date(item.changedAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedPhoto && (
                    <div style={styles.modalOverlay} onClick={() => setSelectedPhoto(null)}>
                        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button style={styles.modalClose} onClick={() => setSelectedPhoto(null)}>×</button>
                            <img src={selectedPhoto} alt="preview" style={styles.modalImage} />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: 'var(--bg-tertiary)',
        padding: '32px 24px'
    },
    
    card: {
        background: 'var(--card-bg)',
        maxWidth: '760px',
        margin: '0 auto',
        borderRadius: '12px',
        padding: '36px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    
    back: {
        background: 'none',
        border: 'none',
        color: 'var(--button-primary)',
        cursor: 'pointer',
        fontSize: '14px',
        padding: 0
    },
    
    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px'
    },
    
    title: {
        margin: 0,
        fontSize: '22px',
        color: 'var(--text-primary)'
    },
    
    statusBadge: {
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '700',
        whiteSpace: 'nowrap'
    },
    
    actionButtons: {
        display: 'flex',
        gap: '10px'
    },
    
    editBtn: {
        background: 'var(--button-primary)',
        color: '#fff',
        border: 'none',
        padding: '9px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },
    
    deleteBtn: {
        background: '#f44336',
        color: '#fff',
        border: 'none',
        padding: '9px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },
    
    metaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))',
        gap: '16px',
        background: 'var(--bg-tertiary)',
        padding: '20px',
        borderRadius: '8px'
    },
    
    metaItem: {},
    
    metaLabel: {
        fontSize: '11px',
        color: 'var(--text-muted)',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    
    metaValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    
    priorityBadge: {
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600'
    },
    
    section: {
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        marginTop: '8px'
    },
    
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '10px'
    },
    
    description: {
        color: 'var(--text-secondary)',
        lineHeight: '1.7',
        margin: 0
    },
    
    center: {
        textAlign: 'center',
        marginTop: '80px',
        color: 'var(--text-secondary)'
    },
    
    // 📅 Timeline Styles
    timeline: {
        position: 'relative',
        paddingLeft: '30px'
    },
    
    timelineItem: {
        position: 'relative',
        paddingBottom: '20px'
    },
    
    timelineDot: {
        position: 'absolute',
        left: '-25px',
        top: '5px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: 'var(--button-primary)',
        border: '2px solid #fff'
    },
    
    timelineContent: {
        background: 'var(--bg-tertiary)',
        padding: '12px',
        borderRadius: '8px'
    },
    
    timelineHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px'
    },
    
    timelineAction: {
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    
    timelineTime: {
        fontSize: '12px',
        color: 'var(--text-secondary)'
    },
    
    // 📸 Photo Styles
    photoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
        marginTop: '12px'
    },
    
    photoContainer: {
        position: 'relative',
        cursor: 'pointer',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    
    photo: {
        width: '100%',
        height: '120px',
        objectFit: 'cover',
        borderRadius: '8px',
        border: '2px solid var(--border-color)'
    },
    
    // 🖼️ Modal
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
    },
    
    modalContent: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        background: '#fff',
        borderRadius: '12px',
        padding: '20px'
    },
    
    modalClose: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        fontSize: '18px',
        cursor: 'pointer'
    },
    
    modalImage: {
        maxWidth: '100%',
        maxHeight: '80vh',
        objectFit: 'contain',
        borderRadius: '8px'
    }
};
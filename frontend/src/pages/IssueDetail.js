import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, deleteIssue } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DarkModeToggle from '../components/DarkModeToggle';

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
    const { id }       = useParams();
    const navigate     = useNavigate();
    const { user }     = useAuth();
    
    const [issue,   setIssue]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        getIssueById(id)
            .then(res => setIssue(res.data))
            .catch(() => setError('Issue not found or access denied'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
            try {
                await deleteIssue(id);
                navigate('/dashboard');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete issue');
            }
        }
    };

    if (loading) return <p style={styles.center}>Loading...</p>;
    if (error)   return <p style={{ ...styles.center, color:'#e53935' }}>{error}</p>;

    const sc = STATUS_COLORS[issue.status] || {};

    // Show edit/delete buttons only if current user owns the issue and it's OPEN
    const isOwner  = user?.email === issue.reportedBy;
    const canEdit  = isOwner && issue.status === 'OPEN';

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Back */}
                <button onClick={() => navigate(-1)} style={styles.back}>
                    ← Back
                </button>

                {/* Header Row */}
                <div style={styles.headerRow}>
                    <h2 style={styles.title}>{issue.title}</h2>
                    <span style={{
                        ...styles.statusBadge,
                        background: sc.background,
                        color: sc.color
                    }}>
                        {issue.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Action Buttons */}
                {canEdit && (
                    <div style={styles.actionButtons}>
                        <button
                            onClick={() => navigate(`/issues/${id}/edit`)}
                            style={styles.editBtn}
                        >
                            ✏️ Edit Issue
                        </button>
                        <button
                            onClick={handleDelete}
                            style={styles.deleteBtn}
                        >
                            🗑️ Delete Issue
                        </button>
                    </div>
                )}

                {/* Meta Grid */}
                <div style={styles.metaGrid}>
                    {[
                        { label:'Issue ID',    value:`#${issue.id}` },
                        { label:'Category',    value: issue.category },
                        { label:'Reported By', value: issue.reportedBy },
                        { label:'Location',    value: issue.location || '—' },
                        { label:'Submitted',   value: new Date(issue.createdAt)
                                                        .toLocaleString() },
                        { label:'Resolved At', value: issue.resolvedAt
                            ? new Date(issue.resolvedAt).toLocaleString() : '—' }
                    ].map(({ label, value }) => (
                        <div key={label} style={styles.metaItem}>
                            <div style={styles.metaLabel}>{label}</div>
                            <div style={styles.metaValue}>{value}</div>
                        </div>
                    ))}

                    {/* Priority with color */}
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

                {/* Description */}
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Description</h3>
                    <p style={styles.description}>{issue.description}</p>
                </div>

            </div>
        </div>
    );
}

const styles = {
    page:         { minHeight:'100vh', background:'var(--bg-tertiary)',
                    padding:'32px 24px' },
    card:         { background:'var(--card-bg)', maxWidth:'760px',
                    margin:'0 auto', borderRadius:'12px', padding:'36px',
                    boxShadow:'var(--shadow)',
                    border:'1px solid var(--border-color)' },
    back:         { background:'none', border:'none',
                    color:'var(--button-primary)', cursor:'pointer',
                    fontSize:'14px', marginBottom:'20px', padding:0 },
    headerRow:    { display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', marginBottom:'16px', gap:'16px' },
    title:        { margin:0, fontSize:'22px', color:'var(--text-primary)' },
    statusBadge:  { padding:'6px 14px', borderRadius:'20px',
                    fontSize:'13px', fontWeight:'700', whiteSpace:'nowrap' },
    actionButtons: { display:'flex', gap:'8px', marginBottom:'24px' },
    editBtn:      { background:'var(--button-primary)', color:'#fff',
                    border:'none', padding:'9px 20px', borderRadius:'6px',
                    cursor:'pointer', fontSize:'14px', fontWeight:'600' },
    deleteBtn:    { background:'#f44336', color:'#fff',
                    border:'none', padding:'9px 20px', borderRadius:'6px',
                    cursor:'pointer', fontSize:'14px', fontWeight:'600' },
    metaGrid:     { display:'grid',
                    gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))',
                    gap:'16px', marginBottom:'28px',
                    background:'var(--bg-tertiary)',
                    padding:'20px', borderRadius:'8px' },
    metaItem:     {},
    metaLabel:    { fontSize:'11px', color:'var(--text-muted)',
                    marginBottom:'4px', textTransform:'uppercase',
                    letterSpacing:'0.5px' },
    metaValue:    { fontSize:'14px', fontWeight:'600',
                    color:'var(--text-primary)' },
    priorityBadge:{ display:'inline-block', padding:'4px 10px',
                    borderRadius:'12px', color:'#fff',
                    fontSize:'12px', fontWeight:'600' },
    section:      { borderTop:'1px solid var(--border-color)',
                    paddingTop:'20px' },
    sectionTitle: { fontSize:'16px', fontWeight:'700',
                    color:'var(--text-primary)', marginBottom:'10px' },
    description:  { color:'var(--text-secondary)', lineHeight:'1.7', margin:0 },
    center:       { textAlign:'center', marginTop:'80px',
                    color:'var(--text-secondary)' }
};
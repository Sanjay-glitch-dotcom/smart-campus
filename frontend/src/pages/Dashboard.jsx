import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyIssues, getAllIssues, getAllIssuesForDeptHead, deleteIssue } from '../services/api';
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

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [issues,  setIssues]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter,  setFilter]  = useState('ALL');
    const [error,   setError]   = useState('');

    useEffect(() => { fetchIssues(); }, []);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            // ✅ Department heads and admins see all issues
            const isDeptHead = user?.role === 'DEPARTMENT_HEAD';
            const isAdmin    = user?.role === 'ADMIN';

            const res = isAdmin
                ? await getAllIssues()        // Admin calls /admin/issues
                : isDeptHead
                ? await getAllIssuesForDeptHead()  // Dept Head calls /issues
                : await getMyIssues();         // Student calls /issues/my

            setIssues(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to load issues. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDelete = async (issueId, event) => {
        event.stopPropagation(); // prevent card click navigation
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await deleteIssue(issueId);
            setIssues(prev => prev.filter(issue => issue.id !== issueId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete issue');
        }
    };

    const filteredIssues = filter === 'ALL'
        ? issues
        : issues.filter(issue => issue.status === filter);

    const stats = [
        { label: 'Total',       value: issues.length,                                    color: '#1a73e8' },
        { label: 'Open',        value: issues.filter(i => i.status === 'OPEN').length,        color: '#e65100' },
        { label: 'In Progress', value: issues.filter(i => i.status === 'IN_PROGRESS').length, color: '#1565c0' },
        { label: 'Resolved',    value: issues.filter(i => i.status === 'RESOLVED').length,    color: '#2e7d32' }
    ];

    return (
        <div style={styles.page}>

            {/* ── Navbar ── */}
            <nav style={styles.nav}>
                <span style={styles.navBrand}>🏫 Smart Campus</span>
                <div style={styles.navRight}>
                    <DarkModeToggle />
                    <span style={styles.navEmail}>{user?.email}</span>
                    {user?.role !== 'ADMIN' && (
                        <Link to="/issues/new" style={styles.navBtn}>
                            + Report Issue
                        </Link>
                    )}
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            </nav>

            <div style={styles.content}>
                <h2 style={styles.heading}>My Reported Issues</h2>

                {/* ── Error Banner ── */}
                {error && (
                    <div style={styles.errorBanner}>{error}</div>
                )}

                {/* ── Filter Tabs ── */}
                <div style={styles.tabs}>
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            style={{
                                ...styles.tab,
                                ...(filter === status ? styles.tabActive : {})
                            }}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* ── Stats Row ── */}
                <div style={styles.statsRow}>
                    {stats.map(stat => (
                        <div key={stat.label} style={styles.statCard}>
                            <div style={{ ...styles.statNumber, color: stat.color }}>
                                {stat.value}
                            </div>
                            <div style={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Issues Grid ── */}
                {loading ? (
                    <p style={styles.loading}>Loading your issues...</p>

                ) : filteredIssues.length === 0 ? (
                    <div style={styles.empty}>
                        <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                            No issues found.
                        </p>
                        {user?.role !== 'ADMIN' && (
                            <Link to="/issues/new" style={styles.emptyLink}>
                                Report your first issue →
                            </Link>
                        )}
                    </div>

                ) : (
                    <div style={styles.issueGrid}>
                        {filteredIssues.map(issue => (
                            <div
                                key={issue.id}
                                style={styles.issueCard}
                                onClick={() => navigate(`/issues/${issue.id}`)}
                            >
                                {/* Card Header */}
                                <div style={styles.cardHeader}>
                                    <span style={styles.issueId}>#{issue.id}</span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        ...STATUS_COLORS[issue.status]
                                    }}>
                                        {issue.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Title */}
                                <h3 style={styles.issueTitle}>{issue.title}</h3>

                                {/* Description preview */}
                                <p style={styles.issueDesc}>
                                    {issue.description.length > 80
                                        ? issue.description.substring(0, 80) + '...'
                                        : issue.description}
                                </p>

                                {/* Footer — category, priority, delete */}
                                <div style={styles.cardFooter}>
                                    <span style={styles.category}>
                                        {issue.category}
                                    </span>
                                    <span style={{
                                        ...styles.priority,
                                        background: PRIORITY_COLORS[issue.priority]
                                    }}>
                                        {issue.priority}
                                    </span>

                                    {/* Only show delete for OPEN issues */}
                                    {issue.status === 'OPEN' && (
                                        <button
                                            onClick={(e) => handleDelete(issue.id, e)}
                                            style={styles.deleteBtn}
                                            title="Delete issue"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>

                                {/* Date */}
                                <div style={styles.cardDate}>
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
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
        fontFamily: 'sans-serif'
    },
    
    nav: {
        background: 'var(--bg-secondary)',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow)'
    },
    
    navBrand: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    
    navEmail: {
        color: 'var(--text-secondary)',
        fontSize: '14px'
    },
    
    navBtn: {
        background: 'var(--button-primary)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '14px'
    },
    
    logoutBtn: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        padding: '8px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    
    content: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    
    heading: {
        fontSize: '26px',
        marginBottom: '20px',
        color: 'var(--text-primary)'
    },
    
    errorBanner: {
        background: '#fdecea',
        color: '#c0392b',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    
    tabs: {
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap'
    },
    
    tab: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '13px'
    },
    
    tabActive: {
        background: 'var(--button-primary)',
        color: '#fff',
        border: '1px solid var(--button-primary)'
    },
    
    statsRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '28px',
        flexWrap: 'wrap'
    },
    
    statCard: {
        flex: '1',
        minWidth: '120px',
        padding: '20px',
        borderRadius: '10px',
        background: 'var(--card-bg)',
        textAlign: 'center',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-color)'
    },
    
    statNumber: {
        fontSize: '28px',
        fontWeight: '700'
    },
    
    statLabel: {
        fontSize: '13px',
        color: 'var(--text-muted)',
        marginTop: '4px'
    },
    
    loading: {
        textAlign: 'center',
        padding: '40px',
        color: 'var(--text-secondary)'
    },
    
    empty: {
        textAlign: 'center',
        padding: '60px',
        color: 'var(--text-secondary)'
    },
    
    emptyLink: {
        color: 'var(--button-primary)',
        textDecoration: 'none',
        fontWeight: '600'
    },
    
    issueGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
    },
    
    issueCard: {
        padding: '20px',
        borderRadius: '10px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        boxShadow: 'var(--shadow)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
    },
    
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    
    issueId: {
        fontSize: '13px',
        color: 'var(--text-muted)'
    },
    
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600'
    },
    
    issueTitle: {
        fontSize: '16px',
        marginBottom: '8px',
        color: 'var(--text-primary)',
        fontWeight: '600'
    },
    
    issueDesc: {
        fontSize: '13px',
        marginBottom: '12px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
    },
    
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    
    category: {
        padding: '4px 10px',
        borderRadius: '12px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        fontSize: '12px',
        fontWeight: '600'
    },
    
    priority: {
        padding: '4px 10px',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '600'
    },
    
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        marginLeft: 'auto',
        padding: '2px 4px',
        borderRadius: '4px',
        color: 'var(--text-muted)',
        transition: 'all 0.3s ease'
    },
    
    cardDate: {
        marginTop: '10px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        textAlign: 'right'
    }
};
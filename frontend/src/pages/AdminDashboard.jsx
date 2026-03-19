import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues, getDashboardStats, updateStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'];
const STATUS_COLORS  = {
    OPEN:        { bg:'#fff3e0', color:'#e65100' },
    IN_PROGRESS: { bg:'#e3f2fd', color:'#1565c0' },
    RESOLVED:    { bg:'#e8f5e9', color:'#2e7d32' },
    CLOSED:      { bg:'#f5f5f5', color:'#616161' }
};

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [issues,  setIssues]  = useState([]);
    const [stats,   setStats]   = useState(null);
    const [filter,  setFilter]  = useState('ALL');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [issueRes, statsRes] = await Promise.all([
                getAllIssues(),
                getDashboardStats()
            ]);
            setIssues(issueRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateStatus(id, newStatus);
            
            // ✅ Refresh data immediately
            const updatedIssues = await getAllIssues();
            setIssues(updatedIssues.data);
            
            const updatedStats = await getDashboardStats();
            setStats(updatedStats.data);
            
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const filtered = filter === 'ALL'
        ? issues
        : issues.filter(i => i.status === filter);

    const handleViewIssue = (issueId) => {
        navigate(`/issues/${issueId}`);
    };

    const priorityColor = (p) => ({
        LOW: '#4caf50',
        MEDIUM: '#ff9800',
        HIGH: '#f44336',
        CRITICAL: '#9c27b0'
    }[p]);

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        Logout
                    </button>
                </div>

                <div style={styles.statsGrid}>
                    {stats && [
                        { label: 'Total Issues', value: stats.totalIssues, color: '#2196f3' },
                        { label: 'Open', value: stats.openIssues, color: '#ff9800' },
                        { label: 'In Progress', value: stats.inProgressIssues, color: '#03a9f4' },
                        { label: 'Resolved', value: stats.resolvedIssues, color: '#4caf50' }
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ ...styles.statCard, borderColor: color }}>
                            <div style={{ ...styles.statNumber, color }}>{value}</div>
                            <div style={styles.statLabel}>{label}</div>
                        </div>
                    ))}
                </div>

                <div style={styles.filterRow}>
                    <select
                        style={styles.filterSelect}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="ALL">All Issues</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s.replace('_',' ')}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p style={styles.loading}>Loading issues...</p>
                ) : (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    {['ID','Title','Photos','Category','Priority',
                                    'Reported By','Location','Date','Status','Action']
                                        .map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((issue, idx) => {
                                    const sc = STATUS_COLORS[issue.status] || {};
                                    return (
                                        <tr key={issue.id}
                                            style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                            <td style={styles.td}>#{issue.id}</td>
                                            <td style={{ ...styles.td, fontWeight:'600',
                                                         maxWidth:'180px', cursor:'pointer' }}
                                                onClick={() => handleViewIssue(issue.id)}>
                                                {issue.title}
                                            </td>
                                            
                                            {/* 📸 Photos Column */}
                                            <td style={styles.td}>
                                                {issue.photoUrls && issue.photoUrls.length > 0 ? (
                                                    <div style={styles.photoIndicator}>
                                                        📸 {issue.photoUrls.length}
                                                        <div style={styles.photoTooltip}>
                                                            Click issue title to view photos
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={styles.noPhotos}>—</span>
                                                )}
                                            </td>
                                            
                                            <td style={styles.td}>{issue.category}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: priorityColor(issue.priority),
                                                    color:'#fff'
                                                }}>
                                                    {issue.priority}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{issue.reportedBy}</td>
                                            <td style={styles.td}>{issue.location || '—'}</td>
                                            <td style={styles.td}>
                                                {new Date(issue.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: sc.bg,
                                                    color: sc.color
                                                }}>
                                                    {issue.status.replace('_',' ')}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <select
                                                    style={styles.select}
                                                    value={issue.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(issue.id, e.target.value)
                                                    }
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s} value={s}>
                                                            {s.replace('_',' ')}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <p style={styles.noIssues}>No issues found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: '100vh', background: 'var(--bg-tertiary)', padding: '24px' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    title: { margin: 0, fontSize: '28px', color: 'var(--text-primary)' },
    logoutBtn: {
        background: '#f44336', color: '#fff', border: 'none',
        padding: '10px 20px', borderRadius: '6px', cursor: 'pointer',
        fontSize: '14px', fontWeight: '600'
    },
    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
        gap: '20px', marginBottom: '32px'
    },
    statCard: {
        background: 'var(--card-bg)', padding: '24px', borderRadius: '12px',
        textAlign: 'center', border: '2px solid', borderBottom: '4px solid'
    },
    statNumber: { fontSize: '32px', fontWeight: '700', marginBottom: '8px' },
    statLabel: { fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' },
    filterRow: { marginBottom: '20px' },
    filterSelect: {
        padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)',
        background: 'var(--card-bg)', fontSize: '14px'
    },
    loading: { textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' },
    tableWrap: {
        background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden',
        border: '1px solid var(--border-color)'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: 'var(--bg-tertiary)' },
    th: {
        padding: '14px', textAlign: 'left', fontWeight: '600',
        fontSize: '13px', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)'
    },
    trEven: { background: 'var(--card-bg)' },
    trOdd: { background: 'var(--bg-tertiary)' },
    td: { padding: '14px', borderBottom: '1px solid var(--border-color)', fontSize: '14px' },
    badge: {
        padding: '4px 10px', borderRadius: '12px', fontSize: '12px',
        fontWeight: '600', display: 'inline-block'
    },
    select: {
        padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)',
        background: '#fff', fontSize: '13px', cursor: 'pointer'
    },
    noIssues: { textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' },
    
    // 📸 Photo Indicator Styles
    photoIndicator: {
        position: 'relative', display: 'inline-block',
        padding: '4px 8px', background: '#e3f2fd',
        color: '#1565c0', borderRadius: '12px',
        fontSize: '12px', fontWeight: '600', cursor: 'default'
    },
    photoTooltip: {
        position: 'absolute', bottom: '100%', left: '50%',
        transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)',
        color: '#fff', padding: '4px 8px', borderRadius: '4px',
        fontSize: '11px', whiteSpace: 'nowrap',
        opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s'
    },
    noPhotos: { color: '#999', fontSize: '12px' }
};

// Add hover effect for photo tooltip
if (typeof document !== 'undefined') {
    document.styleSheets[0].insertRule(`
        .photoIndicator:hover .photoTooltip { opacity: 1; }
    `, document.styleSheets[0].cssRules.length);
}
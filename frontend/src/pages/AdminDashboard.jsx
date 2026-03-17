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
            fetchData(); // Refresh
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const filtered = filter === 'ALL'
        ? issues
        : issues.filter(i => i.status === filter);

    return (
        <div style={styles.page}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <span style={styles.navBrand}>🏫 Smart Campus — Admin</span>
                <div style={styles.navRight}>
                    <span style={styles.navEmail}>{user?.email}</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <div style={styles.content}>
                <h2 style={styles.heading}>Admin Dashboard</h2>

                {/* Stats Cards */}
                {stats && (
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <div style={{ ...styles.statNum, color:'#1a73e8' }}>
                                {stats.totalIssues}
                            </div>
                            <div style={styles.statLabel}>Total Issues</div>
                        </div>
                        {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                            <div key={status} style={styles.statCard}>
                                <div style={{
                                    ...styles.statNum,
                                    color: STATUS_COLORS[status]?.color || '#333'
                                }}>
                                    {count}
                                </div>
                                <div style={styles.statLabel}>
                                    {status.replace('_',' ')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Category Breakdown */}
                {stats?.byCategory && (
                    <div style={styles.categoryRow}>
                        {Object.entries(stats.byCategory).map(([cat, count]) => (
                            <div key={cat} style={styles.catChip}>
                                <span style={styles.catName}>{cat}</span>
                                <span style={styles.catCount}>{count}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter Tabs */}
                <div style={styles.tabs}>
                    {['ALL', ...STATUS_OPTIONS].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            style={{ ...styles.tab, ...(filter === s ? styles.tabActive : {}) }}
                        >
                            {s.replace('_',' ')}
                        </button>
                    ))}
                </div>

                {/* Issues Table */}
                {loading ? (
                    <p style={styles.loading}>Loading issues...</p>
                ) : (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    {['ID','Title','Category','Priority',
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
                                                         maxWidth:'180px' }}>
                                                {issue.title}
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
                            <p style={styles.noData}>No issues found for this filter.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const priorityColor = (p) => ({
    LOW:'#4caf50', MEDIUM:'#ff9800', HIGH:'#f44336', CRITICAL:'#9c27b0'
}[p] || '#999');

const styles = {
    page:       { minHeight:'100vh', background:'#f0f2f5', fontFamily:'sans-serif' },
    nav:        { background:'#1a1a2e', padding:'14px 24px', display:'flex',
                  alignItems:'center', justifyContent:'space-between' },
    navBrand:   { color:'#fff', fontSize:'18px', fontWeight:'700' },
    navRight:   { display:'flex', alignItems:'center', gap:'12px' },
    navEmail:   { color:'rgba(255,255,255,0.7)', fontSize:'13px' },
    logoutBtn:  { background:'transparent', border:'1px solid rgba(255,255,255,0.4)',
                  color:'#fff', padding:'7px 14px', borderRadius:'6px',
                  cursor:'pointer', fontSize:'13px' },
    content:    { maxWidth:'1300px', margin:'0 auto', padding:'32px 24px' },
    heading:    { fontSize:'26px', color:'#1a1a2e', marginBottom:'24px' },
    statsRow:   { display:'flex', gap:'16px', marginBottom:'16px', flexWrap:'wrap' },
    statCard:   { background:'#fff', padding:'20px 28px', borderRadius:'10px',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.07)', textAlign:'center',
                  flex:'1', minWidth:'110px' },
    statNum:    { fontSize:'30px', fontWeight:'700' },
    statLabel:  { color:'#666', fontSize:'12px', marginTop:'4px', textTransform:'uppercase' },
    categoryRow:{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px' },
    catChip:    { background:'#e8f0fe', borderRadius:'20px', padding:'6px 14px',
                  display:'flex', alignItems:'center', gap:'8px' },
    catName:    { color:'#1a73e8', fontSize:'13px', fontWeight:'600' },
    catCount:   { background:'#1a73e8', color:'#fff', borderRadius:'10px',
                  padding:'2px 8px', fontSize:'12px' },
    tabs:       { display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' },
    tab:        { padding:'8px 16px', border:'1px solid #ddd', borderRadius:'20px',
                  background:'#fff', cursor:'pointer', fontSize:'13px', color:'#555' },
    tabActive:  { background:'#1a1a2e', color:'#fff', border:'1px solid #1a1a2e' },
    tableWrap:  { background:'#fff', borderRadius:'10px', overflow:'auto',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.07)' },
    table:      { width:'100%', borderCollapse:'collapse', minWidth:'900px' },
    thead:      { background:'#1a1a2e' },
    th:         { padding:'14px 16px', color:'#fff', textAlign:'left',
                  fontSize:'13px', fontWeight:'600', whiteSpace:'nowrap' },
    trEven:     { background:'#fff' },
    trOdd:      { background:'#f8f9fa' },
    td:         { padding:'12px 16px', fontSize:'13px', color:'#333',
                  borderBottom:'1px solid #eee', verticalAlign:'middle' },
    badge:      { padding:'4px 10px', borderRadius:'12px', fontSize:'12px',
                  fontWeight:'600', whiteSpace:'nowrap' },
    select:     { padding:'6px 10px', border:'1px solid #ddd', borderRadius:'6px',
                  fontSize:'12px', cursor:'pointer', background:'#fff' },
    loading:    { textAlign:'center', padding:'40px', color:'#666' },
    noData:     { textAlign:'center', padding:'40px', color:'#999' }
};
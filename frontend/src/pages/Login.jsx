import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate  = useNavigate();

    const [form,  setForm]  = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginUser(form);
            login(res.data);
            const role = res.data.role;
            navigate(role.includes('ADMIN') ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Smart Campus</h2>
                <p style={styles.subtitle}>Sign in to your account</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="you@campus.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button style={styles.button} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>Register</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container:  { 
        minHeight:'100vh', 
        display:'flex', 
        alignItems:'center',
        justifyContent:'center', 
        background:'#f0f2f5',
        padding: '20px',
        boxSizing: 'border-box'
    },
    card:       { 
        background:'#fff', 
        padding:'40px', 
        borderRadius:'12px',
        boxShadow:'0 4px 20px rgba(0,0,0,0.1)', 
        width:'100%', 
        maxWidth:'400px',
        boxSizing: 'border-box'
    },
    title:      { 
        textAlign:'center', 
        color:'#1a73e8', 
        marginBottom:'4px',
        fontSize: 'clamp(20px, 5vw, 24px)'
    },
    subtitle:   { 
        textAlign:'center', 
        color:'#666', 
        marginBottom:'24px', 
        fontSize:'14px' 
    },
    error:      { 
        background:'#fdecea', 
        color:'#c0392b', 
        padding:'10px',
        borderRadius:'6px', 
        marginBottom:'16px', 
        fontSize:'14px',
        wordBreak: 'break-word'
    },
    field:      { 
        marginBottom:'16px' 
    },
    label:      { 
        display:'block', 
        marginBottom:'6px', 
        fontWeight:'600',
        fontSize:'14px', 
        color:'#333' 
    },
    input:      { 
        width:'100%', 
        padding:'12px', 
        border:'1px solid #ddd',
        borderRadius:'6px', 
        fontSize:'16px', 
        boxSizing:'border-box',
        outline:'none',
        minHeight: '44px' // Touch-friendly height
    },
    button:     { 
        width:'100%', 
        padding:'12px', 
        background:'#1a73e8', 
        color:'#fff',
        border:'none', 
        borderRadius:'6px', 
        fontSize:'16px',
        cursor:'pointer', 
        marginTop:'8px',
        minHeight: '48px', // Touch-friendly height
        fontWeight: '600'
    },
    footer:     { 
        textAlign:'center', 
        marginTop:'20px', 
        fontSize:'14px', 
        color:'#666' 
    },
    link:       { 
        color:'#1a73e8', 
        textDecoration:'none', 
        fontWeight:'600' 
    }
};
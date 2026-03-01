import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'STUDENT'
    });
    const [error,   setError]   = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await registerUser(form);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>Join Smart Campus</p>

                {error   && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit}>
                    {[
                        { label:'Full Name',  name:'name',     type:'text',     placeholder:'John Doe' },
                        { label:'Email',      name:'email',    type:'email',    placeholder:'you@campus.com' },
                        { label:'Password',   name:'password', type:'password', placeholder:'Min 6 characters' }
                    ].map(({ label, name, type, placeholder }) => (
                        <div style={styles.field} key={name}>
                            <label style={styles.label}>{label}</label>
                            <input
                                style={styles.input}
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                value={form[name]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}

                    <div style={styles.field}>
                        <label style={styles.label}>Role</label>
                        <select
                            style={styles.input}
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="DEPARTMENT_HEAD">Department Head</option>
                        </select>
                    </div>

                    <button style={styles.button} disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight:'100vh', display:'flex', alignItems:'center',
                 justifyContent:'center', background:'#f0f2f5' },
    card:      { background:'#fff', padding:'40px', borderRadius:'12px',
                 boxShadow:'0 4px 20px rgba(0,0,0,0.1)', width:'100%', maxWidth:'420px' },
    title:     { textAlign:'center', color:'#1a73e8', marginBottom:'4px' },
    subtitle:  { textAlign:'center', color:'#666', marginBottom:'24px', fontSize:'14px' },
    error:     { background:'#fdecea', color:'#c0392b', padding:'10px',
                 borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
    success:   { background:'#e8f5e9', color:'#2e7d32', padding:'10px',
                 borderRadius:'6px', marginBottom:'16px', fontSize:'14px' },
    field:     { marginBottom:'16px' },
    label:     { display:'block', marginBottom:'6px', fontWeight:'600',
                 fontSize:'14px', color:'#333' },
    input:     { width:'100%', padding:'10px 12px', border:'1px solid #ddd',
                 borderRadius:'6px', fontSize:'14px', boxSizing:'border-box' },
    button:    { width:'100%', padding:'12px', background:'#1a73e8', color:'#fff',
                 border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer' },
    footer:    { textAlign:'center', marginTop:'20px', fontSize:'14px', color:'#666' },
    link:      { color:'#1a73e8', textDecoration:'none', fontWeight:'600' }
};
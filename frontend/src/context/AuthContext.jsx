import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const role  = localStorage.getItem('role');
        const email = localStorage.getItem('email');
        return token ? { token, role, email } : null;
    });

    // AuthContext.js — confirm this exists
    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role',  data.role);
        localStorage.setItem('email', data.email);
        setUser({ token: data.token, role: data.role, email: data.email });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
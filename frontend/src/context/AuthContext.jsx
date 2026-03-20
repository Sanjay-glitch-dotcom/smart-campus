import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const role  = localStorage.getItem('role');
        const email = localStorage.getItem('email');
        
        // Validate token exists and is not expired
        if (token) {
            try {
                // Basic token validation (you can add more sophisticated validation)
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const isExpired = tokenData.exp * 1000 < Date.now();
                
                if (!isExpired) {
                    return { token, role, email };
                } else {
                    // Clear expired token
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('email');
                }
            } catch (error) {
                // Invalid token format, clear it
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('email');
            }
        }
        return null;
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
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateAuth = async () => {
            if (authService.isAuthenticated()) {
                const isValid = await authService.validateToken();
                if (!isValid) {
                    authService.logout();
                    setUser(null);
                }
            }
            setLoading(false);
        };

        validateAuth();
    }, []);

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        setUser(authService.getCurrentUser());
        return result;
    };

    const register = async (email, password, fullName, telephone) => {
        const result = await authService.register(email, password, fullName, telephone);
        setUser(authService.getCurrentUser());
        return result;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: authService.isAuthenticated(),
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Проверяем аутентификацию при загрузке
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const userInfo = authService.getUserInfo();
        const token = authService.getAccessToken();

        if (token && userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    };

    // Регистрация
    const register = async (userData) => {
        setError(null);
        try {
            const result = await authService.register(userData);

            if (result.success) {
                const userInfo = authService.getUserInfo();
                setUser(userInfo);
                return { success: true };
            } else {
                setError(result.error || 'Registration failed');
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Вход
    const login = async (email, password) => {
        setError(null);
        try {
            const result = await authService.login(email, password);

            if (result.success) {
                const userInfo = authService.getUserInfo();
                setUser(userInfo);
                return { success: true };
            } else {
                setError(result.error || 'Login failed');
                return { success: false, error: result.error };
            }
        } catch (error) {
            const errorMessage = error.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Выход
    const logout = async () => {
        setError(null);
        try {
            await authService.logout();
            setUser(null);
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        }
    };

    // Проверка email
    const checkEmailAvailability = async (email) => {
        try {
            return await authService.checkEmailAvailability(email);
        } catch (error) {
            console.error('Email check error:', error);
            return { available: false };
        }
    };

    // Очистка ошибок
    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        checkEmailAvailability,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
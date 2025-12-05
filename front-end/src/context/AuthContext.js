import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

// Создаем кастомный хук для удобства использования
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Проверяем наличие токена при загрузке приложения
        const token = localStorage.getItem('token');
        if (token) {
            validateToken(token);
        } else {
            setLoading(false);
        }
    }, []);

    const validateToken = async (token) => {
        try {
            setLoading(true);
            const userData = await authService.validateToken(token);
            setUser(userData);
            setError(null);
        } catch (error) {
            console.error('Token validation failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.login(email, password);

            if (response.accessToken) {
                localStorage.setItem('token', response.accessToken);

                // Получаем данные пользователя
                const userData = await authService.validateToken(response.accessToken);
                setUser(userData);

                toast.success('Вход выполнен успешно!');
                return { success: true, data: response };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ошибка входа. Проверьте данные.';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.register(userData);

            if (response.accessToken) {
                localStorage.setItem('token', response.accessToken);

                // Получаем данные пользователя
                const userInfo = await authService.validateToken(response.accessToken);
                setUser(userInfo);

                toast.success('Регистрация успешна!');
                return { success: true, data: response };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ошибка регистрации';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            const response = await authService.updateProfile(user.id, profileData);
            setUser({ ...user, ...response });
            toast.success('Профиль обновлен успешно!');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ошибка обновления профиля';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        validateToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
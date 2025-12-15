import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../services/auth';
import { jwtDecode } from 'jwt-decode'; // Установите: npm install jwt-decode

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Функция для декодирования JWT токена
    const decodeToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            console.log('Decoded JWT:', decoded);
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token) {
            try {
                // Декодируем токен для получения ролей
                const decodedToken = decodeToken(token);

                // Пробуем получить роли из разных мест
                let roles = ['USER'];

                if (decodedToken) {
                    // Пробуем разные поля, где могут быть роли
                    roles = decodedToken.roles ||
                        decodedToken.authorities ||
                        decodedToken.scope ||
                        ['USER'];

                    // Если roles строка, преобразуем в массив
                    if (typeof roles === 'string') {
                        roles = roles.split(',').map(r => r.trim());
                    }
                }

                // Сохраняем или обновляем пользователя
                const userObj = userData ? JSON.parse(userData) : {};
                const updatedUser = {
                    ...userObj,
                    token,
                    email: decodedToken?.sub || userObj.email || 'unknown',
                    roles: roles,
                    decoded: decodedToken // Для отладки
                };

                console.log('Final user object:', updatedUser);
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

            } catch (e) {
                console.error('Error processing auth data:', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            console.log('Logging in with:', email);
            const response = await authApi.login({
                email: email.trim(),
                password: password.trim()
            });

            console.log('Login response:', response.data);

            if (response.data.accessToken) {
                const token = response.data.accessToken;
                const decoded = decodeToken(token);

                // Извлекаем роли из токена
                let roles = ['USER'];
                if (decoded) {
                    roles = decoded.roles ||
                        decoded.authorities ||
                        decoded.scope ||
                        ['USER'];

                    if (typeof roles === 'string') {
                        roles = roles.split(',').map(r => r.trim());
                    }
                }

                const userData = {
                    email: response.data.email || email,
                    token: token,
                    roles: roles,
                    ...response.data,
                    decoded: decoded
                };

                console.log('User data after login:', userData);

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true, data: userData };
            }

            return { success: false, error: 'No token received' };
        } catch (error) {
            console.error('Login error details:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authApi.register(userData);

            if (response.data.accessToken) {
                const token = response.data.accessToken;
                const decoded = decodeToken(token);

                let roles = ['USER'];
                if (decoded) {
                    roles = decoded.roles || decoded.authorities || ['USER'];
                    if (typeof roles === 'string') {
                        roles = roles.split(',').map(r => r.trim());
                    }
                }

                const newUserData = {
                    email: response.data.email,
                    token: token,
                    roles: roles,
                    decoded: decoded
                };

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(newUserData));
                setUser(newUserData);
                return { success: true, data: newUserData };
            }

            return { success: false, error: 'No token received' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        console.log('Logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const hasToken = !!token && !!user;
        console.log('isAuthenticated check - Token exists:', !!token, 'User:', user);
        return hasToken;
    };

    const hasRole = (role) => {
        if (!user || !user.roles) {
            console.log('hasRole: No user or roles', { user });
            return false;
        }

        const userRoles = user.roles;
        console.log('hasRole check:', {
            requestedRole: role,
            userRoles,
            userEmail: user.email
        });

        // Проверяем разные форматы
        if (Array.isArray(userRoles)) {
            const result = userRoles.some(r => {
                const roleMatch =
                    r === role ||
                    r === `ROLE_${role}` ||
                    r === role.toUpperCase() ||
                    r === `ROLE_${role.toUpperCase()}` ||
                    r.toLowerCase() === role.toLowerCase() ||
                    r.toLowerCase().includes(role.toLowerCase());

                console.log(`Role comparison: ${r} vs ${role} = ${roleMatch}`);
                return roleMatch;
            });
            console.log('Final hasRole result:', result);
            return result;
        }

        if (typeof userRoles === 'string') {
            const rolesArray = userRoles.split(',').map(r => r.trim());
            return rolesArray.some(r =>
                r === role ||
                r === `ROLE_${role}` ||
                r.toLowerCase().includes(role.toLowerCase())
            );
        }

        return false;
    };

    const isAdmin = () => {
        const result = hasRole('ADMIN') || hasRole('ROLE_ADMIN');
        console.log('isAdmin check result:', result);
        return result;
    };

    const refreshUserData = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                let roles = decoded.roles || decoded.authorities || ['USER'];
                if (typeof roles === 'string') {
                    roles = roles.split(',').map(r => r.trim());
                }

                const updatedUser = {
                    ...user,
                    roles: roles,
                    decoded: decoded
                };

                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
        isAdmin,
        refreshUserData,
        decodeToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
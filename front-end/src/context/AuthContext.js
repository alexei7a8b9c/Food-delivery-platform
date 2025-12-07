import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { hasRole } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Функция для декодирования JWT токена
    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    // Функция для извлечения ролей из JWT
    const extractRolesFromJWT = (decodedToken) => {
        if (!decodedToken) return [];

        // Проверяем разные возможные места, где могут быть роли в JWT
        const roles = [];

        // 1. Проверяем поле 'roles'
        if (decodedToken.roles) {
            if (Array.isArray(decodedToken.roles)) {
                roles.push(...decodedToken.roles);
            } else if (typeof decodedToken.roles === 'string') {
                roles.push(...decodedToken.roles.split(',').map(r => r.trim()));
            }
        }

        // 2. Проверяем поле 'authorities' (Spring Security)
        if (decodedToken.authorities) {
            if (Array.isArray(decodedToken.authorities)) {
                decodedToken.authorities.forEach(auth => {
                    if (typeof auth === 'string') {
                        roles.push(auth);
                    } else if (auth.authority) {
                        roles.push(auth.authority);
                    }
                });
            } else if (typeof decodedToken.authorities === 'string') {
                roles.push(...decodedToken.authorities.split(',').map(r => r.trim()));
            }
        }

        // 3. Проверяем поле 'scope' (OAuth2)
        if (decodedToken.scope) {
            const scopes = decodedToken.scope.split(' ');
            scopes.forEach(scope => {
                if (scope.includes('ROLE_') || scope.includes('ADMIN') || scope.includes('MANAGER') || scope.includes('USER')) {
                    roles.push(scope);
                }
            });
        }

        return [...new Set(roles.filter(role => role))];
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const user = authService.getCurrentUser();
                if (user && user.accessToken) {
                    // Декодируем JWT чтобы получить роли
                    const decodedToken = decodeJWT(user.accessToken);
                    console.log('Decoded JWT:', decodedToken);

                    if (decodedToken) {
                        // Извлекаем роли из JWT
                        const roles = extractRolesFromJWT(decodedToken);
                        console.log('Extracted roles from JWT:', roles);

                        // Обновляем пользователя с ролями
                        const updatedUser = {
                            ...user,
                            userId: user.userId || user.id || decodedToken.userId || decodedToken.sub,
                            roles: roles.length > 0 ? roles : user.roles
                        };

                        setCurrentUser(updatedUser);

                        // Сохраняем обновлённого пользователя в localStorage
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    } else {
                        // Если не удалось декодировать, используем существующего пользователя
                        if (!user.userId && user.id) {
                            user.userId = user.id;
                        }
                        setCurrentUser(user);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login({ email, password });

            // Декодируем JWT чтобы получить роли
            const decodedToken = decodeJWT(response.accessToken);
            console.log('Login decoded JWT:', decodedToken);

            if (decodedToken) {
                // Извлекаем роли из JWT
                const roles = extractRolesFromJWT(decodedToken);
                console.log('Login extracted roles:', roles);

                // Создаём полного пользователя
                const fullUser = {
                    ...response,
                    userId: response.userId || response.id || decodedToken.userId || decodedToken.sub,
                    roles: roles.length > 0 ? roles : response.roles
                };

                setCurrentUser(fullUser);

                // Сохраняем в localStorage
                localStorage.setItem('user', JSON.stringify(fullUser));

                return fullUser;
            }

            // Fallback если не удалось декодировать
            const userWithId = {
                ...response,
                userId: response.userId || response.id
            };

            setCurrentUser(userWithId);
            return userWithId;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.accessToken) {
                const decodedToken = decodeJWT(response.accessToken);

                if (decodedToken) {
                    const roles = extractRolesFromJWT(decodedToken);
                    const fullUser = {
                        ...response,
                        userId: response.userId || response.id || decodedToken.userId || decodedToken.sub,
                        roles: roles.length > 0 ? roles : response.roles
                    };

                    setCurrentUser(fullUser);
                    localStorage.setItem('user', JSON.stringify(fullUser));
                } else {
                    const userWithId = {
                        ...response,
                        userId: response.userId || response.id
                    };
                    setCurrentUser(userWithId);
                }
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
        navigate('/login');
    };

    const isAuthenticated = () => {
        return !!currentUser && !!currentUser.accessToken;
    };

    const getUserRoles = () => {
        if (!currentUser) return [];

        let roles = [];
        if (currentUser.roles) {
            if (Array.isArray(currentUser.roles)) {
                roles = currentUser.roles;
            } else if (typeof currentUser.roles === 'string') {
                roles = currentUser.roles.split(',').map(r => r.trim());
            }
        }

        return [...new Set(roles.filter(role => role))];
    };

    // Проверяем, есть ли у пользователя роль
    const hasUserRole = (role) => {
        const userRoles = getUserRoles();
        return hasRole(userRoles, role);
    };

    const value = {
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        loading,
        getUserRoles,
        hasUserRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
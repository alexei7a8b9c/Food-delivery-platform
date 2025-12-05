import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Создаем экземпляр axios для запросов без авторизации
const publicApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Создаем экземпляр axios для авторизованных запросов
const privateApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Интерцептор для добавления токена к авторизованным запросам
privateApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    // Логин
    async login(email, password) {
        try {
            const response = await publicApi.post('/api/auth/login', {
                email,
                password
            });

            if (response.data && response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);

                // Сохраняем базовую информацию пользователя
                const userInfo = {
                    id: response.data.userId,
                    email: response.data.email,
                    fullName: response.data.fullName,
                    accessToken: response.data.accessToken
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                return userInfo;
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Регистрация
    async register(userData) {
        try {
            const response = await publicApi.post('/api/auth/register', userData);

            if (response.data && response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);

                const userInfo = {
                    id: response.data.userId,
                    email: response.data.email,
                    fullName: response.data.fullName,
                    accessToken: response.data.accessToken
                };

                localStorage.setItem('user', JSON.stringify(userInfo));
                return userInfo;
            }

            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Валидация токена
    async validateToken(token) {
        try {
            const response = await privateApi.post('/api/auth/validate-token', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.valid) {
                // Получаем профиль пользователя
                const profileResponse = await privateApi.get('/api/users/profile');
                const userData = {
                    ...response.data,
                    ...profileResponse.data
                };

                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }

            throw new Error('Invalid token');
        } catch (error) {
            console.error('Token validation error:', error);
            this.logout();
            throw error;
        }
    },

    // Получение профиля
    async getProfile() {
        try {
            const response = await privateApi.get('/api/users/profile');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Выход
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
    },

    // Проверка авторизации
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    // Получение текущего пользователя
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user:', error);
            return null;
        }
    },

    // Получение токена
    getToken() {
        return localStorage.getItem('token');
    },

    // Получение ролей из токена
    getUserRoles() {
        try {
            const user = this.getCurrentUser();
            return user?.roles || [];
        } catch (error) {
            console.error('Error getting roles:', error);
            return [];
        }
    },

    // Проверка роли
    hasRole(role) {
        const roles = this.getUserRoles();
        return roles.includes(role);
    },

    // Проверка админа
    isAdmin() {
        return this.hasRole('ROLE_ADMIN') || this.hasRole('ADMIN');
    },

    // Проверка менеджера
    isManager() {
        return this.hasRole('ROLE_MANAGER') || this.hasRole('MANAGER');
    }
};
import axios from 'axios';
import { toast } from 'react-toastify';

// ОБНОВИЛИ: Правильный базовый URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

// СОЗДАЕМ AXIOS ИНСТАНС с правильным baseURL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // ВАЖНО: для отправки куки
});

class AuthService {
    constructor() {
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    // ИСПРАВЛЕННЫЙ метод регистрации
    async register(userData) {
        try {
            console.log('📤 Регистрация пользователя:', userData);

            // Конвертируем данные для Spring Boot бэкенда
            const backendData = {
                username: userData.email.split('@')[0] || userData.fullName.replace(/\s+/g, '_').toLowerCase(),
                email: userData.email,
                password: userData.password
            };

            console.log('📤 Данные для бэкенда:', backendData);

            // ИСПРАВЛЕНО: используем правильный endpoint /api/auth/signup
            const response = await api.post('/api/auth/signup', backendData);

            console.log('📥 Ответ регистрации:', response.data);

            if (response.data.accessToken) {
                this.setTokens(response.data);

                // Сохраняем пользователя с дополнительными данными
                const userInfo = {
                    email: userData.email,
                    fullName: userData.fullName,
                    username: backendData.username,
                    telephone: userData.telephone
                };
                localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

                toast.success('Регистрация успешна!');
                return { success: true, data: response.data };
            } else {
                throw new Error('No access token in response');
            }
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);

            // Детальный лог ошибки
            if (error.response) {
                console.error('❌ Статус ошибки:', error.response.status);
                console.error('❌ Данные ошибки:', error.response.data);
                console.error('❌ Заголовки ошибки:', error.response.headers);

                const errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    'Ошибка регистрации';
                toast.error(errorMessage);
                throw new Error(errorMessage);
            } else if (error.request) {
                console.error('❌ Нет ответа от сервера:', error.request);
                toast.error('Нет ответа от сервера. Проверьте запущен ли бэкенд на порту 8080');
                throw new Error('Server not responding');
            } else {
                console.error('❌ Ошибка настройки запроса:', error.message);
                toast.error('Ошибка запроса: ' + error.message);
                throw error;
            }
        }
    }

    // ИСПРАВЛЕННЫЙ метод входа
    async login(email, password) {
        try {
            console.log('📤 Вход пользователя:', email);

            // Spring Boot ожидает username, но принимает email как username
            const loginData = {
                username: email, // Можно использовать email как username
                password: password
            };

            // ИСПРАВЛЕНО: используем /api/auth/signin
            const response = await api.post('/api/auth/signin', loginData);

            console.log('📥 Ответ входа:', response.data);

            if (response.data.accessToken) {
                this.setTokens(response.data);

                // Извлекаем username из токена или ответа
                const username = response.data.username || email.split('@')[0];
                const userInfo = {
                    email: email,
                    username: username
                };
                localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

                toast.success('Вход успешен!');
                return { success: true, data: response.data };
            }

            throw new Error('No access token in response');
        } catch (error) {
            console.error('❌ Ошибка входа:', error);

            if (error.response) {
                const errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    'Ошибка входа';
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            toast.error('Ошибка сети');
            throw error;
        }
    }

    // Проверка email (возможно, нужно реализовать в бэкенде)
    async checkEmailAvailability(email) {
        try {
            // ВРЕМЕННО: просто проверяем формат
            const emailRegex = /\S+@\S+\.\S+/;
            if (!emailRegex.test(email)) {
                return { available: false };
            }

            // Можно добавить реальную проверку позже
            return { available: true };
        } catch (error) {
            console.error('Ошибка проверки email:', error);
            return { available: true }; // Временно разрешаем
        }
    }

    // Остальные методы остаются как есть, но с исправленными endpoints
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            // ИСПРАВЛЕНО: endpoint для refresh
            const response = await api.post('/api/auth/refresh', {
                refreshToken: refreshToken
            });

            this.setTokens(response.data);
            return response.data.accessToken;
        } catch (error) {
            console.error('Refresh token error:', error);
            this.clearAuth();
            throw error;
        }
    }

    async logout() {
        try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                // ИСПРАВЛЕНО: endpoint для logout
                await api.post('/api/auth/logout', { refreshToken: refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            toast.info('Logged out successfully');
            window.location.href = '/login';
        }
    }

    // Вспомогательные методы
    setTokens(authData) {
        localStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }

    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    clearAuth() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }

    getUserInfo() {
        const userInfo = localStorage.getItem(USER_INFO_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    }
}

// Создаем и экспортируем экземпляр
const authService = new AuthService();
export default authService;
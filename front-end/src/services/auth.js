// services/auth.js
import api from './api';

const AUTH_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            this.setTokens(response.data);
            this.setUserInfo(response.data);
            return response.data;
        } catch (error) {
            this.clearAuth();
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            this.setTokens(response.data);
            this.setUserInfo(response.data);
            return response.data;
        } catch (error) {
            this.clearAuth();
            throw error;
        }
    },

    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.post('/auth/refresh', {
                refreshToken
            });

            this.setTokens(response.data);
            return response.data.accessToken;
        } catch (error) {
            this.clearAuth();
            throw error;
        }
    },

    async logout() {
        try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken });
            }
        } finally {
            this.clearAuth();
        }
    },

    async logoutAll() {
        try {
            await api.post('/auth/logout-all');
        } finally {
            this.clearAuth();
        }
    },

    async validateToken() {
        try {
            const token = this.getAccessToken();
            if (!token) {
                return false;
            }

            const response = await api.post('/auth/validate', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                // Попробуем обновить токен
                try {
                    await this.refreshToken();
                    return true;
                } catch (refreshError) {
                    return false;
                }
            }
            return false;
        }
    },

    setTokens(authData) {
        localStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);

        // Устанавливаем время истечения токена
        if (authData.expiresIn) {
            const expiresAt = Date.now() + (authData.expiresIn * 1000);
            localStorage.setItem('token_expires_at', expiresAt.toString());
        }
    },

    getAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setUserInfo(authData) {
        const userInfo = {
            email: authData.email,
            fullName: authData.fullName,
            userId: authData.userId
        };
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    },

    getUserInfo() {
        const userInfo = localStorage.getItem(USER_INFO_KEY);
        return userInfo ? JSON.parse(userInfo) : null;
    },

    isTokenExpired() {
        const expiresAt = localStorage.getItem('token_expires_at');
        if (!expiresAt) return true;

        return Date.now() > parseInt(expiresAt);
    },

    clearAuth() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
        localStorage.removeItem('token_expires_at');
    },

    isAuthenticated() {
        const token = this.getAccessToken();
        const userInfo = this.getUserInfo();
        return !!token && !!userInfo && !this.isTokenExpired();
    }
};

// Interceptor для автоматического обновления токена
api.interceptors.request.use(
    (config) => {
        const token = authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await authService.refreshToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                authService.clearAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default authService;
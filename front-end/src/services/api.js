import axios from 'axios';
import authService from './auth';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Включить диагностику
const ENABLE_API_DEBUG = true;

const logApiRequest = (config) => {
    if (ENABLE_API_DEBUG) {
        console.group('🚀 API Request Debug');
        console.log('📝 Method:', config.method?.toUpperCase());
        console.log('🔗 URL:', config.baseURL + config.url);
        console.log('📋 Headers:', config.headers);
        console.log('📦 Data:', config.data);
        console.groupEnd();
    }
};

const logApiResponse = (response) => {
    if (ENABLE_API_DEBUG) {
        console.group('✅ API Response Debug');
        console.log('📊 Status:', response.status);
        console.log('🔗 URL:', response.config.url);
        console.log('📦 Data:', response.data);
        console.groupEnd();
    }
};

const logApiError = (error) => {
    if (ENABLE_API_DEBUG) {
        console.group('❌ API Error Debug');
        console.error('📊 Status:', error.response?.status);
        console.error('📝 Status Text:', error.response?.statusText);
        console.error('📦 Response Data:', error.response?.data);
        console.error('🔗 Request URL:', error.config?.url);
        console.error('📋 Request Headers:', error.config?.headers);
        console.error('📦 Request Data:', error.config?.data);
        console.groupEnd();
    }
};

// Интерцептор запросов
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        let user = null;

        if (userStr) {
            try {
                user = JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }

        if (user && user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
            console.log('🔑 Added Authorization header');
        }

        // Добавляем X-User-Id если пользователь авторизован
        if (user && user.userId) {
            config.headers['X-User-Id'] = user.userId;
            console.log('👤 Added X-User-Id:', user.userId);
        }

        // Добавляем роли если есть
        if (user && user.roles) {
            config.headers['X-User-Roles'] = Array.isArray(user.roles) ? user.roles.join(',') : user.roles;
            console.log('🎭 Added X-User-Roles:', user.roles);
        }

        logApiRequest(config);
        return config;
    },
    (error) => {
        logApiError(error);
        return Promise.reject(error);
    }
);

// Интерцептор ответов
api.interceptors.response.use(
    (response) => {
        logApiResponse(response);
        return response;
    },
    async (error) => {
        logApiError(error);

        // Если ошибка 401 (Unauthorized)
        if (error.response?.status === 401) {
            console.log('🔒 Unauthorized, logging out...');
            authService.logout();

            if (window.location.pathname !== '/login') {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
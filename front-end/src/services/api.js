import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Перехватчик для логирования запросов
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Логируем запросы для отладки
        console.log('📤 API Request:', {
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers
        });

        return config;
    },
    error => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Перехватчик для логирования ответов
apiClient.interceptors.response.use(
    response => {
        console.log('📥 API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('❌ Response error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });
        return Promise.reject(error);
    }
);

// Функция форматирования ошибок
export const formatErrorMessage = (error) => {
    if (error.response) {
        const { status, data } = error.response;

        console.log('Error details:', { status, data });

        if (status === 401) {
            return 'Ошибка авторизации. Пожалуйста, войдите снова.';
        }

        if (status === 403) {
            return 'У вас нет прав для выполнения этого действия.';
        }

        if (status === 404) {
            return 'Ресурс не найден.';
        }

        if (status === 400) {
            if (data && data.message) {
                return data.message;
            }
            if (data && data.error) {
                return data.error;
            }
            return 'Некорректный запрос. Проверьте введенные данные.';
        }

        if (status === 422) {
            return 'Ошибка валидации данных. Проверьте правильность введенных данных.';
        }

        if (status >= 500) {
            return 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
        }

        if (data && data.error) {
            return data.error;
        }

        return `Ошибка сервера (${status})`;
    }

    if (error.request) {
        return 'Ошибка сети. Проверьте подключение к серверу.';
    }

    if (error.message) {
        return error.message;
    }

    return 'Неизвестная ошибка';
};

// API для ресторанов
export const restaurantApi = {
    getAll: (params) => apiClient.get('/restaurants', { params }),
    getById: (id) => apiClient.get(`/restaurants/${id}`),
    create: (data) => apiClient.post('/restaurants', data),
    update: (id, data) => apiClient.put(`/restaurants/${id}`, data),
    delete: (id) => apiClient.delete(`/restaurants/${id}`),
};

// API для блюд (упрощенная версия без updateWithImage)
export const dishApi = {
    getAll: (params) => apiClient.get('/dishes', { params }),
    getById: (id) => apiClient.get(`/dishes/${id}`),
    getByRestaurant: (restaurantId, params) =>
        apiClient.get(`/dishes/restaurant/${restaurantId}`, { params }),
    create: (data) => {
        console.log('Creating dish with data:', data);
        return apiClient.post('/dishes', data);
    },
    update: (id, data) => {
        console.log('Updating dish:', id, data);
        return apiClient.put(`/dishes/${id}`, data);
    },
    delete: (id) => apiClient.delete(`/dishes/${id}`),
    uploadImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return apiClient.post(`/dishes/${id}/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    deleteImage: (id) => apiClient.delete(`/dishes/${id}/image`),
    // Убрали updateWithImage, будем делать отдельные запросы
};

export default apiClient;
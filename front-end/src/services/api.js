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

// Перехватчик для автоматического добавления заголовков
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Для API Gateway добавляем заголовки пользователя
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.email) {
            config.headers['X-User-Id'] = user.id || '16';
            config.headers['X-User-Name'] = user.email;
        } else {
            // Значения по умолчанию для тестирования
            config.headers['X-User-Id'] = '16';
            config.headers['X-User-Name'] = 'admin@fooddelivery.com';
        }

        // ДОБАВЛЕНО: Роли для доступа к админским эндпоинтам
        config.headers['X-User-Roles'] = 'ROLE_ADMIN,ROLE_MANAGER,ROLE_USER';

        console.log('📤 API Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            data: config.data
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
            method: error.config?.method,
            headers: error.config?.headers
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

// API для блюд
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
};

// API для корзины
export const cartApi = {
    getCart: () => apiClient.get('/cart'),
    addToCart: (item) => apiClient.post('/cart/items', item),
    updateQuantity: (dishId, quantity) =>
        apiClient.put(`/cart/items/${dishId}`, { quantity }),
    removeFromCart: (dishId) => apiClient.delete(`/cart/items/${dishId}`),
    clearCart: () => apiClient.delete('/cart')
};

// API для заказов - ОБНОВЛЕННЫЙ
export const orderApi = {
    // Получить все заказы (для администратора)
    getAllOrders: () => {
        console.log('📤 Получение всех заказов...');
        return apiClient.get('/orders/admin/all');
    },

    // Получить заказ по ID с деталями
    getOrderById: (orderId) => {
        console.log(`📤 Получение заказа #${orderId}...`);
        return apiClient.get(`/orders/${orderId}`);
    },

    // ОБНОВИТЬ СТАТУС ЗАКАЗА - ИСПРАВЛЕННЫЙ МЕТОД
    updateOrderStatus: (orderId, status) => {
        console.log(`📤 Обновление статуса заказа #${orderId} -> ${status}`);
        const data = { status: status };
        return apiClient.put(`/orders/${orderId}/status`, data);
    },

    // Тестовые методы
    testConnection: () => apiClient.get('/orders/test'),
    testAuth: () => apiClient.get('/orders/test/auth'),

    // Другие методы
    getUserDetails: (userId) => apiClient.get(`/orders/user/${userId}/details`),
    createOrder: (orderData) => {
        console.log('Creating order:', orderData);
        return apiClient.post('/orders', orderData);
    },
    getUserOrders: (userId) => apiClient.get(`/orders/user/${userId}`),
    cancelOrder: (orderId) => apiClient.delete(`/orders/${orderId}`),
    getRestaurantOrders: (restaurantId) => apiClient.get(`/orders/restaurant/${restaurantId}`),
    createTestOrder: () => {
        const testOrder = {
            restaurantId: 1,
            items: [
                {
                    dishId: 1,
                    quantity: 2,
                    price: 1899,
                    dishName: "Margherita Pizza",
                    dishDescription: "Classic pizza with tomato sauce"
                }
            ],
            paymentMethod: "CREDIT_CARD",
            deliveryAddress: "123 Test Street",
            customerEmail: "test@example.com",
            customerFullName: "Test User",
            customerTelephone: "+1234567890"
        };
        return apiClient.post('/orders', testOrder);
    }
};

export default apiClient;
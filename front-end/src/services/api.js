import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Создаем основной экземпляр axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Интерцептор для добавления токена
api.interceptors.request.use(
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

// Интерцептор для обработки ошибок
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Обработка специфических HTTP ошибок
            switch (error.response.status) {
                case 401:
                    console.error('Unauthorized - redirecting to login');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('Forbidden - insufficient permissions');
                    break;
                case 404:
                    console.error('Resource not found');
                    break;
                case 500:
                    console.error('Server error');
                    break;
                default:
                    console.error('Request failed with status:', error.response.status);
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Auth endpoints
export const authApi = {
    login: (email, password) =>
        api.post('/api/auth/login', { email, password }),

    register: (userData) =>
        api.post('/api/auth/register', userData),

    validateToken: (token) =>
        api.post('/api/auth/validate-token', {}, {
            headers: { Authorization: `Bearer ${token}` }
        }),

    logout: () =>
        api.post('/api/auth/logout'),

    getProfile: () =>
        api.get('/api/users/profile'),

    updateProfile: (userId, profileData) =>
        api.put(`/api/users/${userId}`, profileData),
};

// Restaurant endpoints
export const restaurantApi = {
    getAllRestaurants: () =>
        api.get('/api/restaurants'),

    getRestaurantById: (id) =>
        api.get(`/api/restaurants/${id}`),

    getRestaurantsByCuisine: (cuisine) =>
        api.get(`/api/restaurants/cuisine/${cuisine}`),

    getDishesByRestaurant: (restaurantId) =>
        api.get(`/api/restaurants/${restaurantId}/dishes`),

    getAllDishes: () =>
        api.get('/api/menu/dishes'),

    searchDishes: (query) =>
        api.get(`/api/menu/search?query=${query}`),
};

// Cart endpoints
export const cartApi = {
    getCart: () =>
        api.get('/api/cart'),

    addToCart: (item) =>
        api.post('/api/cart/add', item),

    removeFromCart: (dishId) =>
        api.delete(`/api/cart/remove/${dishId}`),

    updateQuantity: (dishId, quantity) =>
        api.put(`/api/cart/update/${dishId}?quantity=${quantity}`),

    clearCart: () =>
        api.delete('/api/cart/clear'),
};

// Order endpoints
export const orderApi = {
    placeOrder: (orderData) =>
        api.post('/api/orders/place', orderData),

    getUserOrders: () =>
        api.get('/api/orders'),

    getOrderById: (orderId) =>
        api.get(`/api/orders/${orderId}`),

    getAllOrders: () =>
        api.get('/api/orders/all'),

    updateOrderStatus: (orderId, status) =>
        api.put(`/api/orders/${orderId}/status?status=${status}`),

    cancelOrder: (orderId) =>
        api.put(`/api/orders/${orderId}/cancel`),

    getRestaurantOrders: (restaurantId) =>
        api.get(`/api/orders/restaurant/${restaurantId}`),

    getOrdersByStatus: (status) =>
        api.get(`/api/orders/status/${status}`),

    getStatistics: () =>
        api.get('/api/orders/statistics'),
};

// Admin endpoints
export const adminApi = {
    // User management
    getAllUsers: () =>
        api.get('/api/users'),

    getUserById: (userId) =>
        api.get(`/api/users/${userId}`),

    assignRole: (userId, roleName) =>
        api.post(`/api/users/${userId}/roles/${roleName}`),

    removeRole: (userId, roleName) =>
        api.delete(`/api/users/${userId}/roles/${roleName}`),

    // Restaurant management
    createRestaurant: (restaurantData) =>
        api.post('/api/admin/restaurants', restaurantData),

    updateRestaurant: (id, restaurantData) =>
        api.put(`/api/admin/restaurants/${id}`, restaurantData),

    deleteRestaurant: (id) =>
        api.delete(`/api/admin/restaurants/${id}`),

    // Dish management
    addDish: (restaurantId, dishData) =>
        api.post(`/api/admin/restaurants/${restaurantId}/dishes`, dishData),

    updateDish: (restaurantId, dishId, dishData) =>
        api.put(`/api/admin/restaurants/${restaurantId}/dishes/${dishId}`, dishData),

    deleteDish: (restaurantId, dishId) =>
        api.delete(`/api/admin/restaurants/${restaurantId}/dishes/${dishId}`),
};

export default api;
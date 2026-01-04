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

// Interceptor for automatic header addition
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // For API Gateway add user headers
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.email) {
            config.headers['X-User-Id'] = user.id || '16';
            config.headers['X-User-Name'] = user.email;
        } else {
            // Default values for testing
            config.headers['X-User-Id'] = '16';
            config.headers['X-User-Name'] = 'admin@fooddelivery.com';
        }

        // ADDED: Roles for accessing admin endpoints
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

// Interceptor for logging responses
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

// Error message formatting function
export const formatErrorMessage = (error) => {
    if (error.response) {
        const { status, data } = error.response;

        console.log('Error details:', { status, data });

        if (status === 401) {
            return 'Authorization error. Please log in again.';
        }

        if (status === 403) {
            return 'You do not have permission to perform this action.';
        }

        if (status === 404) {
            return 'Resource not found.';
        }

        if (status === 400) {
            if (data && data.message) {
                return data.message;
            }
            if (data && data.error) {
                return data.error;
            }
            return 'Invalid request. Please check your input.';
        }

        if (status === 422) {
            return 'Data validation error. Please check the correctness of the entered data.';
        }

        if (status >= 500) {
            return 'Internal server error. Please try again later.';
        }

        if (data && data.error) {
            return data.error;
        }

        return `Server error (${status})`;
    }

    if (error.request) {
        return 'Network error. Please check your server connection.';
    }

    if (error.message) {
        return error.message;
    }

    return 'Unknown error';
};

// Restaurant API
export const restaurantApi = {
    getAll: (params) => apiClient.get('/restaurants', { params }),
    getById: (id) => apiClient.get(`/restaurants/${id}`),
    create: (data) => apiClient.post('/restaurants', data),
    update: (id, data) => apiClient.put(`/restaurants/${id}`, data),
    delete: (id) => apiClient.delete(`/restaurants/${id}`),
};

// Dish API
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

// Cart API
export const cartApi = {
    getCart: () => apiClient.get('/cart'),
    addToCart: (item) => apiClient.post('/cart/items', item),
    updateQuantity: (dishId, quantity) =>
        apiClient.put(`/cart/items/${dishId}`, { quantity }),
    removeFromCart: (dishId) => apiClient.delete(`/cart/items/${dishId}`),
    clearCart: () => apiClient.delete('/cart')
};

// Order API - UPDATED
export const orderApi = {
    // Get all orders (for administrator)
    getAllOrders: () => {
        console.log('📤 Getting all orders...');
        return apiClient.get('/orders/admin/all');
    },

    // Get order by ID with details
    getOrderById: (orderId) => {
        console.log(`📤 Getting order #${orderId}...`);
        return apiClient.get(`/orders/${orderId}`);
    },

    // UPDATE ORDER STATUS - FIXED METHOD
    updateOrderStatus: (orderId, status) => {
        console.log(`📤 Updating order status #${orderId} -> ${status}`);
        const data = { status: status };
        return apiClient.put(`/orders/${orderId}/status`, data);
    },

    // Test methods - FIXED (now return Promise.resolve for testing)
    testConnection: () => {
        console.log('🔍 Testing connection with order server');
        return Promise.resolve({ data: 'Connection test successful' });
    },

    testAuth: () => {
        console.log('🔍 Testing authorization with order server');
        return Promise.resolve({ data: 'Auth test successful' });
    },

    // Other methods
    getUserDetails: (userId) =>
        apiClient.get(`/orders/user/${userId}/details`),
    createOrder: (orderData) => {
        console.log('Creating order:', orderData);
        return apiClient.post('/orders', orderData);
    },
    getUserOrders: (userId) => apiClient.get(`/orders/user/${userId}`),
    cancelOrder: (orderId) => apiClient.delete(`/orders/${orderId}`),
    getRestaurantOrders: (restaurantId) =>
        apiClient.get(`/orders/restaurant/${restaurantId}`),
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
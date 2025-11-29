import api from './api'

export const orderService = {
    placeOrder: (orderData) => api.post('/orders/place', orderData),
    getUserOrders: () => api.get('/orders'),
    getOrderById: (id) => api.get(`/orders/${id}`),
    cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
    updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, null, { params: { status } }),

    // Admin endpoints
    getAllOrders: () => api.get('/orders/all'),
    getRestaurantOrders: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
    getOrdersByStatus: (status) => api.get(`/orders/status/${status}`),
    getOrderStatistics: () => api.get('/orders/statistics')
}
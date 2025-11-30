import api from './api'

export const orderService = {
    getCart: async () => {
        const response = await api.get('/cart')
        return response.data
    },

    addToCart: async (cartItem) => {
        const response = await api.post('/cart/add', cartItem)
        return response.data
    },

    updateCartItem: async (dishId, quantity) => {
        const response = await api.put(`/cart/update/${dishId}?quantity=${quantity}`)
        return response.data
    },

    removeFromCart: async (dishId) => {
        const response = await api.delete(`/cart/remove/${dishId}`)
        return response.data
    },

    clearCart: async () => {
        const response = await api.delete('/cart/clear')
        return response.data
    },

    placeOrder: async (orderData) => {
        const response = await api.post('/orders/place', orderData)
        return response.data
    },

    getUserOrders: async () => {
        const response = await api.get('/orders')
        return response.data
    },

    getOrderById: async (orderId) => {
        const response = await api.get(`/orders/${orderId}`)
        return response.data
    },

    cancelOrder: async (orderId) => {
        const response = await api.put(`/orders/${orderId}/cancel`)
        return response.data
    },

    // Admin methods
    getAllOrders: async () => {
        const response = await api.get('/orders/all')
        return response.data
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await api.put(`/orders/${orderId}/status-string?status=${status}`)
        return response.data
    },

    getRestaurantOrders: async (restaurantId) => {
        const response = await api.get(`/orders/restaurant/${restaurantId}`)
        return response.data
    },

    getOrderStatistics: async () => {
        const response = await api.get('/orders/statistics')
        return response.data
    }
}
import api from './api.js'

export const orderService = {
    async createOrder(orderData) {
        const response = await api.post('/orders', orderData)
        return response.data
    },

    async getUserOrders() {
        const response = await api.get('/orders/user')
        return response.data
    },

    async getOrderById(orderId) {
        const response = await api.get(`/orders/${orderId}`)
        return response.data
    },

    async getAllOrders() {
        const response = await api.get('/admin/orders')
        return response.data
    },

    async updateOrderStatus(orderId, status) {
        const response = await api.put(`/admin/orders/${orderId}/status`, { status })
        return response.data
    },

    async getCart() {
        const response = await api.get('/cart')
        return response.data
    },

    async addToCart(item) {
        const response = await api.post('/cart', item)
        return response.data
    },

    async removeFromCart(itemId) {
        const response = await api.delete(`/cart/${itemId}`)
        return response.data
    },

    async clearCart() {
        const response = await api.delete('/cart')
        return response.data
    },
}
import api from './api'

export const orderService = {
    getCart: async () => {
        try {
            const response = await api.get('/cart')
            console.log('Cart data:', response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching cart:', error)
            // Возвращаем пустую корзину при ошибке
            return []
        }
    },

    addToCart: async (cartItem) => {
        try {
            const response = await api.post('/cart/add', cartItem)
            console.log('Added to cart:', cartItem)
            return response.data
        } catch (error) {
            console.error('Error adding to cart:', error)
            throw error
        }
    },

    updateCartItem: async (dishId, quantity) => {
        try {
            const response = await api.put(`/cart/update/${dishId}?quantity=${quantity}`)
            return response.data
        } catch (error) {
            console.error(`Error updating cart item ${dishId}:`, error)
            throw error
        }
    },

    removeFromCart: async (dishId) => {
        try {
            const response = await api.delete(`/cart/remove/${dishId}`)
            return response.data
        } catch (error) {
            console.error(`Error removing item ${dishId} from cart:`, error)
            throw error
        }
    },

    clearCart: async () => {
        try {
            const response = await api.delete('/cart/clear')
            return response.data
        } catch (error) {
            console.error('Error clearing cart:', error)
            throw error
        }
    },

    placeOrder: async (orderData) => {
        try {
            const response = await api.post('/orders/place', orderData)
            console.log('Order placed:', response.data)
            return response.data
        } catch (error) {
            console.error('Error placing order:', error)
            throw error
        }
    },

    getUserOrders: async () => {
        try {
            const response = await api.get('/orders')
            console.log('User orders:', response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching user orders:', error)
            return []
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error)
            throw error
        }
    },

    cancelOrder: async (orderId) => {
        try {
            const response = await api.put(`/orders/${orderId}/cancel`)
            return response.data
        } catch (error) {
            console.error(`Error cancelling order ${orderId}:`, error)
            throw error
        }
    },

    // Admin methods
    getAllOrders: async () => {
        try {
            const response = await api.get('/orders/all')
            return response.data
        } catch (error) {
            console.error('Error fetching all orders:', error)
            return []
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.put(`/orders/${orderId}/status-string?status=${status}`)
            return response.data
        } catch (error) {
            console.error(`Error updating order status ${orderId}:`, error)
            throw error
        }
    },

    getRestaurantOrders: async (restaurantId) => {
        try {
            const response = await api.get(`/orders/restaurant/${restaurantId}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching restaurant orders ${restaurantId}:`, error)
            return []
        }
    },

    getOrderStatistics: async () => {
        try {
            const response = await api.get('/orders/statistics')
            return response.data
        } catch (error) {
            console.error('Error fetching order statistics:', error)
            throw error
        }
    }
}
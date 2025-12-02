import api from './api.js'

export const restaurantService = {
    async getAllRestaurants() {
        const response = await api.get('/restaurants')
        return response.data
    },

    async getRestaurantById(id) {
        const response = await api.get(`/restaurants/${id}`)
        return response.data
    },

    async getRestaurantMenu(restaurantId) {
        const response = await api.get(`/restaurants/${restaurantId}/menu`)
        return response.data
    },

    async createRestaurant(restaurantData) {
        const response = await api.post('/admin/restaurants', restaurantData)
        return response.data
    },

    async updateRestaurant(id, restaurantData) {
        const response = await api.put(`/admin/restaurants/${id}`, restaurantData)
        return response.data
    },

    async deleteRestaurant(id) {
        const response = await api.delete(`/admin/restaurants/${id}`)
        return response.data
    },

    async createDish(restaurantId, dishData) {
        const response = await api.post(`/admin/restaurants/${restaurantId}/dishes`, dishData)
        return response.data
    },

    async updateDish(dishId, dishData) {
        const response = await api.put(`/admin/dishes/${dishId}`, dishData)
        return response.data
    },

    async deleteDish(dishId) {
        const response = await api.delete(`/admin/dishes/${dishId}`)
        return response.data
    },
}
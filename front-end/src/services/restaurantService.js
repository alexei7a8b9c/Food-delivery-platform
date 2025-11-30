import api from './api'

export const restaurantService = {
    getAllRestaurants: async () => {
        try {
            console.log('🔄 Fetching restaurants from database...')
            const response = await api.get('/restaurants')
            console.log('✅ Restaurants loaded from database:', response.data.length)
            return response.data
        } catch (error) {
            console.error('❌ Error fetching restaurants:', error)
            throw new Error(`Failed to load restaurants: ${error.response?.data?.message || error.message}`)
        }
    },

    getAllDishes: async () => {
        try {
            console.log('🔄 Fetching ALL dishes from database...')
            const response = await api.get('/menu/dishes')
            console.log('✅ All dishes loaded from database:', response.data.length)
            return response.data
        } catch (error) {
            console.error('❌ Error fetching all dishes:', error)
            throw new Error(`Failed to load dishes: ${error.response?.data?.message || error.message}`)
        }
    },

    getRestaurantById: async (id) => {
        try {
            const response = await api.get(`/restaurants/${id}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching restaurant ${id}:`, error)
            throw error
        }
    },

    getRestaurantMenu: async (restaurantId) => {
        try {
            console.log(`🔄 Fetching menu for restaurant ${restaurantId}...`)
            const response = await api.get(`/restaurants/${restaurantId}/dishes`)
            console.log(`✅ Menu loaded for restaurant ${restaurantId}:`, response.data.length)
            return response.data
        } catch (error) {
            console.error(`Error fetching menu for restaurant ${restaurantId}:`, error)
            throw error
        }
    },

    searchDishes: async (query) => {
        try {
            const response = await api.get(`/menu/search?query=${encodeURIComponent(query)}`)
            return response.data
        } catch (error) {
            console.error(`Error searching dishes: ${query}`, error)
            throw error
        }
    }
}
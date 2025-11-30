import api from './api'

export const restaurantService = {
    getAllRestaurants: async () => {
        try {
            console.log('Fetching restaurants...')
            const response = await api.get('/restaurants')
            console.log('Restaurants response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching restaurants:', error)
            throw error
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

    getRestaurantsByCuisine: async (cuisine) => {
        try {
            const response = await api.get(`/restaurants/cuisine/${cuisine}`)
            return response.data
        } catch (error) {
            console.error(`Error fetching ${cuisine} restaurants:`, error)
            throw error
        }
    },

    getRestaurantMenu: async (restaurantId) => {
        try {
            const response = await api.get(`/restaurants/${restaurantId}/dishes`)
            console.log(`Menu for restaurant ${restaurantId}:`, response.data)
            return response.data
        } catch (error) {
            console.error(`Error fetching menu for restaurant ${restaurantId}:`, error)
            throw error
        }
    },

    getAllDishes: async () => {
        try {
            const response = await api.get('/menu/dishes')
            return response.data
        } catch (error) {
            console.error('Error fetching all dishes:', error)
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
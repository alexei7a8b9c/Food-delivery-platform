import api from './api'

export const restaurantService = {
    getAllRestaurants: async () => {
        const response = await api.get('/restaurants')
        return response.data
    },

    getRestaurantById: async (id) => {
        const response = await api.get(`/restaurants/${id}`)
        return response.data
    },

    getRestaurantsByCuisine: async (cuisine) => {
        const response = await api.get(`/restaurants/cuisine/${cuisine}`)
        return response.data
    },

    getRestaurantMenu: async (restaurantId) => {
        const response = await api.get(`/restaurants/${restaurantId}/dishes`)
        return response.data
    },

    getAllDishes: async () => {
        const response = await api.get('/menu/dishes')
        return response.data
    },

    searchDishes: async (query) => {
        const response = await api.get(`/menu/search?query=${query}`)
        return response.data
    }
}
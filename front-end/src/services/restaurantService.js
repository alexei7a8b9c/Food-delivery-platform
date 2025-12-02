import api from './api';

export const restaurantService = {
    // Получить все рестораны
    getAllRestaurants: async () => {
        try {
            const response = await api.get('/api/restaurants');
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            throw error;
        }
    },

    // Получить ресторан по ID
    getRestaurantById: async (id) => {
        try {
            const response = await api.get(`/api/restaurants/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            throw error;
        }
    },

    // Получить блюда ресторана
    getRestaurantDishes: async (restaurantId) => {
        try {
            const response = await api.get(`/api/restaurants/${restaurantId}/dishes`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dishes:', error);
            throw error;
        }
    },

    // Получить все блюда
    getAllDishes: async () => {
        try {
            const response = await api.get('/api/menu/dishes');
            return response.data;
        } catch (error) {
            console.error('Error fetching dishes:', error);
            throw error;
        }
    },

    // Поиск блюд
    searchDishes: async (query) => {
        try {
            const response = await api.get(`/api/menu/search?query=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching dishes:', error);
            throw error;
        }
    }
};
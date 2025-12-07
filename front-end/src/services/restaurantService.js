import api from './api';

class RestaurantService {
    async getAllRestaurants() {
        try {
            console.log('Fetching all restaurants');
            const response = await api.get('/api/restaurants');
            console.log('Restaurants response', response.data);
            return response;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            throw error;
        }
    }

    async getRestaurantById(id) {
        try {
            console.log(`Fetching restaurant ${id}`);
            const response = await api.get(`/api/restaurants/${id}`);
            return response;
        } catch (error) {
            console.error(`Error fetching restaurant ${id}:`, error);
            throw error;
        }
    }

    async getRestaurantDishes(restaurantId) {
        try {
            console.log(`Fetching dishes for restaurant ${restaurantId}`);
            const response = await api.get(`/api/restaurants/${restaurantId}/dishes`);
            console.log(`Dishes for restaurant ${restaurantId}`, response.data);
            return response;
        } catch (error) {
            console.error(`Error fetching dishes for restaurant ${restaurantId}:`, error);
            return { data: [] };
        }
    }

    async getAllDishes() {
        try {
            console.log('Fetching all dishes');
            const response = await api.get('/api/menu/dishes');
            console.log('Dishes response', response.data);
            return response;
        } catch (error) {
            console.error('Error fetching all dishes:', error);
            throw error;
        }
    }

    async getDishById(id) {
        try {
            console.log(`Fetching dish ${id}`);
            const response = await api.get(`/api/menu/dishes/${id}`);
            return response;
        } catch (error) {
            console.error(`Error fetching dish ${id}:`, error);
            throw error;
        }
    }

    async searchDishes(query) {
        const response = await api.get(`/api/menu/search?query=${query}`);
        return response;
    }
}

export default new RestaurantService();
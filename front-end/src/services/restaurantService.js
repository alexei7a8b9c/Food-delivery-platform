import api from './api';

class RestaurantService {
    async getAllRestaurants() {
        try {
            console.log('Fetching all restaurants');
            const response = await api.get('/api/restaurants');
            console.log('Restaurants response', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            throw error;
        }
    }

    async getRestaurantById(id) {
        try {
            console.log(`Fetching restaurant ${id}`);
            const response = await api.get(`/api/restaurants/${id}`);
            return response.data;
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
            return response.data;
        } catch (error) {
            console.error(`Error fetching dishes for restaurant ${restaurantId}:`, error);
            return [];
        }
    }

    async getAllDishes() {
        try {
            console.log('Fetching all dishes');
            const response = await api.get('/api/menu/dishes');
            console.log('Dishes response', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching all dishes:', error);
            throw error;
        }
    }

    async getDishById(id) {
        try {
            console.log(`Fetching dish ${id}`);
            const response = await api.get(`/api/menu/dishes/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching dish ${id}:`, error);
            throw error;
        }
    }

    async searchDishes(query) {
        const response = await api.get(`/api/menu/search?query=${query}`);
        return response.data;
    }

    // Admin methods
    async createRestaurant(restaurantData) {
        try {
            const response = await api.post('/api/admin/restaurants', restaurantData);
            return response.data;
        } catch (error) {
            console.error('Error creating restaurant:', error);
            throw error;
        }
    }

    async updateRestaurant(id, restaurantData) {
        try {
            const response = await api.put(`/api/admin/restaurants/${id}`, restaurantData);
            return response.data;
        } catch (error) {
            console.error('Error updating restaurant:', error);
            throw error;
        }
    }

    async deleteRestaurant(id) {
        try {
            await api.delete(`/api/admin/restaurants/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            throw error;
        }
    }

    async uploadRestaurantImage(id, imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await api.post(`/api/admin/restaurants/${id}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading restaurant image:', error);
            throw error;
        }
    }

    async createDish(restaurantId, dishData) {
        try {
            const response = await api.post(`/api/admin/restaurants/${restaurantId}/dishes`, dishData);
            return response.data;
        } catch (error) {
            console.error('Error creating dish:', error);
            throw error;
        }
    }

    async updateDish(id, dishData) {
        try {
            const response = await api.put(`/api/admin/dishes/${id}`, dishData);
            return response.data;
        } catch (error) {
            console.error('Error updating dish:', error);
            throw error;
        }
    }

    async deleteDish(id) {
        try {
            await api.delete(`/api/admin/dishes/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting dish:', error);
            throw error;
        }
    }

    async uploadDishImage(id, imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await api.post(`/api/admin/dishes/${id}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading dish image:', error);
            throw error;
        }
    }

    async getAdminRestaurants(page = 0, size = 10, sortBy = 'name', direction = 'asc') {
        try {
            const response = await api.get('/api/admin/restaurants', {
                params: { page, size, sortBy, direction }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching admin restaurants:', error);
            throw error;
        }
    }

    async getAdminDishes(page = 0, size = 10, sortBy = 'name', direction = 'asc') {
        try {
            const response = await api.get('/api/admin/dishes', {
                params: { page, size, sortBy, direction }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching admin dishes:', error);
            throw error;
        }
    }

    async searchRestaurants(query) {
        try {
            const response = await api.get(`/api/restaurants/search?query=${query}`);
            return response.data;
        } catch (error) {
            console.error('Error searching restaurants:', error);
            return [];
        }
    }
}

export default new RestaurantService();
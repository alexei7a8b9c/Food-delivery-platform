import api from './api'

export const restaurantService = {
    getAllRestaurants: () => api.get('/restaurants'),
    getRestaurantById: (id) => api.get(`/restaurants/${id}`),
    getRestaurantsByCuisine: (cuisine) => api.get(`/restaurants/cuisine/${cuisine}`),
    getRestaurantDishes: (restaurantId) => api.get(`/restaurants/${restaurantId}/dishes`),

    // Admin endpoints
    createRestaurant: (data) => api.post('/admin/restaurants', data),
    updateRestaurant: (id, data) => api.put(`/admin/restaurants/${id}`, data),
    deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`),
    addDish: (restaurantId, data) => api.post(`/admin/restaurants/${restaurantId}/dishes`, data),
    updateDish: (restaurantId, dishId, data) => api.put(`/admin/restaurants/${restaurantId}/dishes/${dishId}`, data),
    deleteDish: (restaurantId, dishId) => api.delete(`/admin/restaurants/${restaurantId}/dishes/${dishId}`)
}
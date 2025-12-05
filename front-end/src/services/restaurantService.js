import api from './api';

export const restaurantService = {
    // Получить все рестораны
    getAllRestaurants: () =>
        api.get('/restaurants').then(response => response.data),

    // Получить ресторан по ID
    getRestaurantById: (id) =>
        api.get(`/restaurants/${id}`).then(response => response.data),

    // Получить рестораны по кухне
    getRestaurantsByCuisine: (cuisine) =>
        api.get(`/restaurants/cuisine/${cuisine}`).then(response => response.data),

    // Получить блюда ресторана
    getDishesByRestaurant: (restaurantId) =>
        api.get(`/restaurants/${restaurantId}/dishes`).then(response => response.data),

    // Получить все блюда
    getAllDishes: () =>
        api.get('/menu/dishes').then(response => response.data),

    // Поиск блюд
    searchDishes: (query) =>
        api.get(`/menu/search?query=${query}`).then(response => response.data),
};
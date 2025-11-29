import api from './api'

export const userService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/users/profile'),
    getUserById: (id) => api.get(`/users/${id}`),
    validateToken: () => api.post('/auth/validate')
}
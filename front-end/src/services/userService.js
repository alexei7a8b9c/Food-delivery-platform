import api from './api.js'

export const userService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials)
        return response.data
    },

    async register(userData) {
        const response = await api.post('/auth/register', userData)
        return response.data
    },

    async getProfile() {
        const response = await api.get('/users/profile')
        return response.data
    },

    async updateProfile(userData) {
        const response = await api.put('/users/profile', userData)
        return response.data
    },

    async getAllUsers() {
        const response = await api.get('/admin/users')
        return response.data
    },

    async updateUserRole(userId, role) {
        const response = await api.put(`/admin/users/${userId}/role`, { role })
        return response.data
    },
}
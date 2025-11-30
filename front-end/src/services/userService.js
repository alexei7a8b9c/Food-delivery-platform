import api from './api'

export const userService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        return response.data
    },

    register: async (userData) => {
        const response = await api.post('/auth/register', userData)
        return response.data
    },

    getProfile: async () => {
        const response = await api.get('/users/profile')
        return response.data
    },

    validateToken: async () => {
        const response = await api.post('/auth/validate')
        return response.data
    }
}
import api from './api'

export const userService = {
    login: async (email, password) => {
        try {
            console.log('Attempting login for:', email)
            const response = await api.post('/auth/login', { email, password })
            console.log('Login successful:', response.data)
            return response.data
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message)
            throw new Error(error.response?.data?.message || 'Login failed')
        }
    },

    register: async (userData) => {
        try {
            console.log('Attempting registration for:', userData.email)
            const response = await api.post('/auth/register', userData)
            console.log('Registration successful:', response.data)
            return response.data
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message)
            throw new Error(error.response?.data?.message || 'Registration failed')
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/users/profile')
            return response.data
        } catch (error) {
            console.error('Get profile failed:', error)
            throw error
        }
    },

    validateToken: async () => {
        try {
            const response = await api.post('/auth/validate')
            return response.data
        } catch (error) {
            console.error('Token validation failed:', error)
            throw error
        }
    }
}
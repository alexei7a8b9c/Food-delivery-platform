import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`)
        return config
    },
    (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log(`Response received from ${response.config.url}:`, response.status)
        return response
    },
    (error) => {
        console.error('API Response Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        })

        if (error.response?.status === 401) {
            console.log('Authentication required, redirecting to login...')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Не редиректим автоматически, чтобы не мешать просмотру ресторанов
        }

        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - backend might be down')
        }

        if (error.response?.status === 404) {
            console.error('Endpoint not found - check API Gateway routing')
        }

        if (error.response?.status === 500) {
            console.error('Server error - check backend services')
        }

        return Promise.reject(error)
    }
)

export default api
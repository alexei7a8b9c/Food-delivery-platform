import axios from 'axios';

const API_BASE_URL = '/api';

const authAxios = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

authAxios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (credentials) => authAxios.post('/auth/login', credentials),
    register: (userData) => authAxios.post('/auth/register', userData),
    logout: () => authAxios.post('/auth/logout'),
};

export default authApi;
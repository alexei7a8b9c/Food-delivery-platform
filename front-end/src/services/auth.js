import api from './api';
import toast from 'react-hot-toast';

export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { token, email: userEmail, fullName, userId } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: userEmail, fullName, userId }));

            toast.success('Login successful!');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    },

    async register(email, password, fullName, telephone) {
        try {
            const response = await api.post('/api/auth/register', {
                email,
                password,
                fullName,
                telephone
            });

            const { token, email: userEmail, fullName: userName, userId } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ email: userEmail, fullName: userName, userId }));

            toast.success('Registration successful!');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    async validateToken() {
        try {
            const token = this.getToken();
            if (!token) return false;

            const response = await api.post('/api/auth/validate', null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.status === 200;
        } catch (error) {
            this.logout();
            return false;
        }
    }
};
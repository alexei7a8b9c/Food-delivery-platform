import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const API_URL = `${API_BASE_URL}/api/auth`;

class AuthService {
    async register(userData) {
        const response = await axios.post(`${API_URL}/register`, userData);
        if (response.data.accessToken) {
            localStorage.setItem('user', JSON.stringify(response.data));
            console.log('User registered and saved to localStorage:', response.data.userId);
        }
        return response.data;
    }

    async login(credentials) {
        const response = await axios.post(`${API_URL}/login`, credentials);
        if (response.data.accessToken) {
            localStorage.setItem('user', JSON.stringify(response.data));
            console.log('User logged in and saved to localStorage:', response.data.userId);
        }
        return response.data;
    }

    logout() {
        console.log('Logging out user');
        localStorage.removeItem('user');
        // Также можно очистить все корзины при logout
        this.clearAllCarts();
    }

    // Очищаем все корзины в localStorage
    clearAllCarts() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('cart_')) {
                localStorage.removeItem(key);
                console.log('Removed cart:', key);
            }
        });
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    getAuthHeader() {
        const user = this.getCurrentUser();
        if (user && user.accessToken) {
            return {
                Authorization: 'Bearer ' + user.accessToken,
                'Content-Type': 'application/json'
            };
        }
        return {};
    }

    async validateToken() {
        const user = this.getCurrentUser();
        if (!user || !user.accessToken) {
            return false;
        }

        try {
            const response = await axios.post(
                `${API_URL}/validate-token`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`
                    }
                }
            );
            return response.data.valid === true;
        } catch (error) {
            return false;
        }
    }
}

export default new AuthService();
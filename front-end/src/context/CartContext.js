import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const { currentUser, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    // Получаем ключ для localStorage на основе пользователя
    const getCartKey = () => {
        if (currentUser && currentUser.userId) {
            return `cart_user_${currentUser.userId}`;
        }
        return 'cart_anonymous';
    };

    // Инициализация корзины при загрузке
    useEffect(() => {
        if (isAuthenticated() && currentUser) {
            fetchCart();
        } else {
            loadLocalCart();
        }
    }, [currentUser]);

    // Загружаем корзину из localStorage
    const loadLocalCart = () => {
        try {
            const cartKey = getCartKey();
            const localCart = localStorage.getItem(cartKey);
            if (localCart) {
                const items = JSON.parse(localCart);
                console.log(`Loaded local cart for ${cartKey}:`, items);
                setCartItems(items);
                setCartCount(items.length);
            } else {
                setCartItems([]);
                setCartCount(0);
            }
        } catch (error) {
            console.error('Error loading local cart:', error);
            setCartItems([]);
            setCartCount(0);
        }
    };

    // Сохраняем корзину в localStorage
    const saveLocalCart = (items) => {
        try {
            const cartKey = getCartKey();
            console.log(`Saving local cart for ${cartKey}:`, items);
            localStorage.setItem(cartKey, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving local cart:', error);
        }
    };

    // Получаем корзину с сервера
    const fetchCart = async () => {
        if (!isAuthenticated()) {
            loadLocalCart();
            return;
        }

        try {
            console.log('Fetching cart from server for user:', currentUser.userId);
            const response = await api.get('/api/cart');
            console.log('Cart from server:', response.data);
            const items = response.data || [];
            setCartItems(items);
            setCartCount(items.length);

            // Также сохраняем в localStorage как backup
            saveLocalCart(items);
        } catch (error) {
            console.warn('Failed to fetch cart from server, using localStorage:', error.message);
            loadLocalCart();
        }
    };

    // Добавляем в корзину
    const addToCart = async (item) => {
        console.log('Adding to cart for user:', currentUser?.userId);

        if (!isAuthenticated()) {
            // Для неавторизованных пользователей
            const newItems = [...cartItems, item];
            setCartItems(newItems);
            setCartCount(newItems.length);
            saveLocalCart(newItems);

            if (window.confirm('You need to login to save your cart. Go to login page?')) {
                navigate('/login');
            }
            return;
        }

        try {
            // Для авторизованных пользователей пробуем сервер
            console.log('Trying to add to server cart...');
            await api.post('/api/cart/add', item);
            console.log('Successfully added to server cart');

            // Обновляем локальную корзину после успешного добавления на сервер
            const newItems = [...cartItems, item];
            setCartItems(newItems);
            setCartCount(newItems.length);
            saveLocalCart(newItems);
        } catch (error) {
            console.warn('Failed to add to server cart, using localStorage:', error.message);
            // Fallback на localStorage
            const newItems = [...cartItems, item];
            setCartItems(newItems);
            setCartCount(newItems.length);
            saveLocalCart(newItems);
        }
    };

    // Удаляем из корзины
    const removeFromCart = async (dishId) => {
        console.log('Removing from cart:', dishId);

        if (!isAuthenticated()) {
            const newItems = cartItems.filter(item => item.dishId !== dishId);
            setCartItems(newItems);
            setCartCount(newItems.length);
            saveLocalCart(newItems);
            return;
        }

        try {
            // Пробуем удалить с сервера
            await api.delete(`/api/cart/remove/${dishId}`);
        } catch (error) {
            console.warn('Failed to remove from server cart:', error.message);
        }

        // Всегда обновляем локально
        const newItems = cartItems.filter(item => item.dishId !== dishId);
        setCartItems(newItems);
        setCartCount(newItems.length);
        saveLocalCart(newItems);
    };

    // Обновляем количество
    const updateQuantity = async (dishId, quantity) => {
        console.log('Updating quantity:', dishId, quantity);

        if (!isAuthenticated()) {
            const newItems = cartItems.map(item =>
                item.dishId === dishId ? { ...item, quantity } : item
            );
            setCartItems(newItems);
            setCartCount(newItems.length);
            saveLocalCart(newItems);
            return;
        }

        try {
            // Пробуем обновить на сервере
            await api.put(`/api/cart/update/${dishId}?quantity=${quantity}`);
        } catch (error) {
            console.warn('Failed to update quantity on server:', error.message);
        }

        // Всегда обновляем локально
        const newItems = cartItems.map(item =>
            item.dishId === dishId ? { ...item, quantity } : item
        );
        setCartItems(newItems);
        setCartCount(newItems.length);
        saveLocalCart(newItems);
    };

    // Очищаем корзину
    const clearCart = async () => {
        console.log('Clearing cart for user:', currentUser?.userId);

        if (!isAuthenticated()) {
            setCartItems([]);
            setCartCount(0);
            const cartKey = getCartKey();
            localStorage.removeItem(cartKey);
            return;
        }

        try {
            // Пробуем очистить на сервере
            await api.delete('/api/cart/clear');
        } catch (error) {
            console.warn('Failed to clear server cart:', error.message);
        }

        // Всегда очищаем локально
        setCartItems([]);
        setCartCount(0);
        const cartKey = getCartKey();
        localStorage.removeItem(cartKey);
    };

    // Рассчитываем общую сумму
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        refreshCart: fetchCart,
        isAuthenticated
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
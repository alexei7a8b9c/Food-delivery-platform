import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { cartService } from '../services/api';

export const CartContext = createContext();

// Создаем кастомный хук для удобства использования
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    // Загружаем корзину из localStorage при монтировании
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Синхронизируем корзину с сервером при авторизации
    useEffect(() => {
        if (user) {
            syncCartWithServer();
        }
    }, [user]);

    // Сохраняем корзину в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const syncCartWithServer = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const serverCart = await cartService.getCart();

            // Слияние локальной и серверной корзины
            const mergedCart = [...serverCart];
            cartItems.forEach(localItem => {
                const existingItem = mergedCart.find(item => item.dishId === localItem.dishId);
                if (existingItem) {
                    existingItem.quantity += localItem.quantity;
                } else {
                    mergedCart.push(localItem);
                }
            });

            // Обновляем серверную корзину
            await Promise.all(
                mergedCart.map(item =>
                    cartService.addToCart(item)
                )
            );

            // Получаем обновленную корзину с сервера
            const updatedCart = await cartService.getCart();
            setCartItems(updatedCart);
        } catch (error) {
            console.error('Error syncing cart with server:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (item) => {
        if (user) {
            try {
                await cartService.addToCart(item);
                const updatedCart = await cartService.getCart();
                setCartItems(updatedCart);
            } catch (error) {
                console.error('Error adding to cart on server:', error);
                // Локальное добавление при ошибке
                const existingItem = cartItems.find(cartItem => cartItem.dishId === item.dishId);
                if (existingItem) {
                    setCartItems(cartItems.map(cartItem =>
                        cartItem.dishId === item.dishId
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem
                    ));
                } else {
                    setCartItems([...cartItems, { ...item, quantity: 1 }]);
                }
            }
        } else {
            // Локальное добавление для неавторизованных пользователей
            const existingItem = cartItems.find(cartItem => cartItem.dishId === item.dishId);
            if (existingItem) {
                setCartItems(cartItems.map(cartItem =>
                    cartItem.dishId === item.dishId
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                ));
            } else {
                setCartItems([...cartItems, { ...item, quantity: 1 }]);
            }
        }
    };

    const removeFromCart = async (dishId) => {
        if (user) {
            try {
                await cartService.removeFromCart(dishId);
                const updatedCart = await cartService.getCart();
                setCartItems(updatedCart);
            } catch (error) {
                console.error('Error removing from cart on server:', error);
                setCartItems(cartItems.filter(item => item.dishId !== dishId));
            }
        } else {
            setCartItems(cartItems.filter(item => item.dishId !== dishId));
        }
    };

    const updateQuantity = async (dishId, quantity) => {
        if (quantity < 1) {
            removeFromCart(dishId);
            return;
        }

        if (user) {
            try {
                await cartService.updateQuantity(dishId, quantity);
                const updatedCart = await cartService.getCart();
                setCartItems(updatedCart);
            } catch (error) {
                console.error('Error updating quantity on server:', error);
                setCartItems(cartItems.map(item =>
                    item.dishId === dishId ? { ...item, quantity } : item
                ));
            }
        } else {
            setCartItems(cartItems.map(item =>
                item.dishId === dishId ? { ...item, quantity } : item
            ));
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                await cartService.clearCart();
                setCartItems([]);
            } catch (error) {
                console.error('Error clearing cart on server:', error);
                setCartItems([]);
            }
        } else {
            setCartItems([]);
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
        syncCartWithServer,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
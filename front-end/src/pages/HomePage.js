import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RestaurantSelector from '../components/HomePage/RestaurantSelector';
import MenuList from '../components/HomePage/MenuList';
import ShoppingCart from '../components/HomePage/ShoppingCart';
import { restaurantApi, cartApi, orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';

const STATUS_COLORS = {
    'PENDING': '#ffc107',
    'CONFIRMED': '#17a2b8',
    'PREPARING': '#007bff',
    'OUT_FOR_DELIVERY': '#6f42c1',
    'DELIVERED': '#28a745',
    'CANCELLED': '#dc3545'
};

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [restaurantInfo, setRestaurantInfo] = useState(null);
    const [restaurantLoading, setRestaurantLoading] = useState(false);

    const { user, isAuthenticated } = useAuth();

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Loading restaurants...');
            const response = await restaurantApi.getAll({
                page: 0,
                size: 50,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            console.log('Restaurants response:', response.data);
            const restaurantsData = response.data.content || [];
            setRestaurants(restaurantsData);

            if (restaurantsData.length > 0 && !selectedRestaurant) {
                setSelectedRestaurant(restaurantsData[0]);
            }
        } catch (error) {
            console.error('Error loading restaurants:', error);
            setError('Не удалось загрузить рестораны. Проверьте подключение к серверу.');
        } finally {
            setLoading(false);
        }
    }, [selectedRestaurant]);

    const loadCartFromServer = useCallback(async () => {
        try {
            console.log('Loading cart from server...');
            const response = await cartApi.getCart();
            console.log('Cart from server:', response.data);

            if (response.data && Array.isArray(response.data)) {
                const serverCart = response.data.map(item => ({
                    id: item.dishId,
                    name: item.dishName || `Блюдо ${item.dishId}`,
                    price: item.price / 100,
                    quantity: item.quantity || 1,
                    description: item.dishDescription,
                    restaurantId: item.restaurantId
                }));
                setCart(serverCart);
            }
        } catch (error) {
            console.warn('Could not load cart from server, using local cart:', error.message);
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                try {
                    setCart(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Error parsing saved cart:', e);
                }
            }
        }
    }, []);

    const loadRestaurantInfo = useCallback(async (restaurantId) => {
        if (!restaurantId) {
            setRestaurantInfo(null);
            return;
        }

        setRestaurantLoading(true);
        try {
            console.log(`Загрузка информации о ресторане ID: ${restaurantId}`);
            const response = await restaurantApi.getRestaurantById(restaurantId);
            console.log('Информация о ресторане:', response.data);
            setRestaurantInfo(response.data);
        } catch (error) {
            console.error('Ошибка загрузки информации о ресторане:', error);
            const foundRestaurant = restaurants.find(r => r.id === restaurantId);
            if (foundRestaurant) {
                setRestaurantInfo(foundRestaurant);
            } else {
                setRestaurantInfo({
                    id: restaurantId,
                    name: `Ресторан #${restaurantId}`,
                    address: 'Адрес не указан',
                    cuisine: 'Тип кухни не указан'
                });
            }
        } finally {
            setRestaurantLoading(false);
        }
    }, [restaurants]);

    const loadUserOrders = useCallback(async () => {
        if (!user?.id) return;

        setOrdersLoading(true);
        try {
            console.log('Загрузка заказов пользователя ID:', user.id);

            const response = await orderApi.getAllOrders();
            console.log('Все заказы с сервера:', response.data);

            let ordersData = [];

            if (response && response.data) {
                if (Array.isArray(response.data)) {
                    ordersData = response.data;
                } else if (response.data.content && Array.isArray(response.data.content)) {
                    ordersData = response.data.content;
                } else if (typeof response.data === 'object') {
                    ordersData = [response.data];
                }
            }

            const userEmail = user.email;
            const userOrdersData = ordersData.filter(order =>
                order.customerEmail === userEmail
            );

            console.log(`Найдено ${userOrdersData.length} заказов пользователя ${userEmail}`);

            let restaurantsList = [];
            try {
                const restaurantsResponse = await restaurantApi.getAll({
                    page: 0,
                    size: 100
                });
                restaurantsList = restaurantsResponse.data.content || [];
                console.log('Загружено ресторанов:', restaurantsList.length);
            } catch (restaurantError) {
                console.error('Ошибка загрузки ресторанов:', restaurantError);
            }

            const enrichedOrders = userOrdersData.map(order => {
                const restaurant = restaurantsList.find(r =>
                    r.id === order.restaurantId ||
                    r.id == order.restaurantId
                );

                let restaurantName = order.restaurantName;

                if (!restaurantName && restaurant) {
                    restaurantName = restaurant.name;
                }

                if (!restaurantName) {
                    restaurantName = `Ресторан #${order.restaurantId || 'Неизвестно'}`;
                }

                return {
                    ...order,
                    restaurantName: restaurantName
                };
            });

            enrichedOrders.sort((a, b) => {
                const dateA = new Date(a.orderDate || a.createdAt || a.date || 0);
                const dateB = new Date(b.orderDate || b.createdAt || b.date || 0);
                return dateB - dateA;
            });

            setUserOrders(enrichedOrders);
        } catch (error) {
            console.error('Ошибка загрузки заказов пользователя:', error);
            setUserOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }, [user]);

    const saveCartToServer = useCallback(async (cartItems) => {
        try {
            localStorage.setItem('cart', JSON.stringify(cartItems));

            for (const item of cartItems) {
                const cartItemDto = {
                    dishId: item.id,
                    dishName: item.name,
                    dishDescription: item.description,
                    price: Math.round(item.price * 100),
                    quantity: item.quantity,
                    restaurantId: item.restaurantId || selectedRestaurant?.id
                };

                await cartApi.addToCart(cartItemDto);
            }
        } catch (error) {
            console.warn('Could not save cart to server:', error.message);
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [selectedRestaurant?.id]);

    useEffect(() => {
        loadRestaurants();
        loadCartFromServer();
    }, [loadRestaurants, loadCartFromServer]);

    useEffect(() => {
        if (isAuthenticated() && user?.id) {
            loadUserOrders();
        } else {
            setUserOrders([]);
        }
    }, [user, isAuthenticated, loadUserOrders]);

    useEffect(() => {
        if (isOrderModalOpen && selectedOrder?.restaurantId) {
            loadRestaurantInfo(selectedOrder.restaurantId);
        } else {
            setRestaurantInfo(null);
        }
    }, [isOrderModalOpen, selectedOrder, loadRestaurantInfo]);

    const handleRestaurantChange = useCallback((restaurant) => {
        if (cart.length > 0) {
            if (!window.confirm('При смене ресторана корзина будет очищена. Продолжить?')) {
                return;
            }
            setCart([]);
            localStorage.removeItem('cart');
            cartApi.clearCart().catch(err => console.warn('Could not clear cart on server:', err));
        }
        setSelectedRestaurant(restaurant);
    }, [cart.length]);

    const addToCart = useCallback(async (dish) => {
        if (!selectedRestaurant) {
            alert('Пожалуйста, выберите ресторан');
            return;
        }

        const newCart = [...cart];
        const existingItem = newCart.find(item => item.id === dish.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            newCart.push({
                ...dish,
                quantity: 1,
                restaurantId: selectedRestaurant.id
            });
        }

        setCart(newCart);
        await saveCartToServer(newCart);
    }, [cart, selectedRestaurant, saveCartToServer]);

    const removeFromCart = useCallback(async (dishId) => {
        const newCart = cart.filter(item => item.id !== dishId);
        setCart(newCart);
        await saveCartToServer(newCart);
    }, [cart, saveCartToServer]);

    const updateQuantity = useCallback(async (dishId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(dishId);
            return;
        }

        const newCart = cart.map(item =>
            item.id === dishId ? { ...item, quantity } : item
        );
        setCart(newCart);
        await saveCartToServer(newCart);
    }, [cart, removeFromCart, saveCartToServer]);

    const clearCart = useCallback(async () => {
        if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
            setCart([]);
            localStorage.removeItem('cart');

            try {
                await cartApi.clearCart();
            } catch (error) {
                console.warn('Could not clear cart on server:', error.message);
            }
        }
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Н/Д';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const getStatusBadge = useCallback((status) => {
        const color = STATUS_COLORS[status] || '#6c757d';
        return (
            <span
                className="status-badge"
                style={{
                    backgroundColor: color,
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    display: 'inline-block'
                }}
            >
                {status}
            </span>
        );
    }, []);

    const formatTotalPrice = useCallback((price) => {
        if (price === undefined || price === null) return '0.00';
        const priceInRubles = price / 100;
        return priceInRubles.toFixed(2);
    }, []);

    const handleViewOrderDetails = useCallback(async (order) => {
        try {
            console.log(`Загрузка деталей заказа #${order.id}...`);
            const response = await orderApi.getOrderById(order.id);

            if (response.data) {
                setSelectedOrder(response.data);
                setIsOrderModalOpen(true);
            } else {
                setSelectedOrder(order);
                setIsOrderModalOpen(true);
            }
        } catch (error) {
            console.error('Ошибка загрузки деталей заказа:', error);
            setSelectedOrder(order);
            setIsOrderModalOpen(true);
        }
    }, []);

    const refreshUserOrders = useCallback(() => {
        if (isAuthenticated() && user?.id) {
            loadUserOrders();
        }
    }, [isAuthenticated, user?.id, loadUserOrders]);

    const getTotalPrice = useMemo(() => {
        return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    }, [cart]);

    const getOrderRestaurantName = useMemo(() => {
        if (!selectedOrder) return 'Неизвестно';

        if (selectedOrder.restaurantName) {
            return selectedOrder.restaurantName;
        }

        if (restaurantInfo?.name) {
            return restaurantInfo.name;
        }

        if (selectedOrder.restaurantId) {
            return `Ресторан #${selectedOrder.restaurantId}`;
        }

        return 'Неизвестно';
    }, [selectedOrder, restaurantInfo]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Загрузка ресторанов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={loadRestaurants} className="btn btn-retry">
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="home-page">
            <div className="container">
                <div className="grid-layout">
                    <div className="sidebar">
                        {/* Блок выбора ресторана */}
                        <div className="sidebar-section restaurant-selector-section">
                            <RestaurantSelector
                                restaurants={restaurants}
                                selectedRestaurant={selectedRestaurant}
                                onSelect={handleRestaurantChange}
                            />
                        </div>

                        {/* Блок корзины */}
                        <div className="sidebar-section cart-section">
                            <ShoppingCart
                                cart={cart}
                                onRemove={removeFromCart}
                                onUpdateQuantity={updateQuantity}
                                onClear={clearCart}
                                totalPrice={getTotalPrice}
                                restaurantId={selectedRestaurant?.id}
                                restaurantName={selectedRestaurant?.name}
                                user={user}
                            />
                        </div>

                        {/* Блок заказов пользователя */}
                        {isAuthenticated() && (
                            <div className="sidebar-section orders-section">
                                <div className="user-orders-section">
                                    <div className="section-header" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '15px'
                                    }}>
                                        <h2 className="section-title">Мои заказы</h2>
                                        <button
                                            onClick={refreshUserOrders}
                                            className="btn-refresh"
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.85rem',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            title="Обновить заказы"
                                        >
                                            🔄
                                        </button>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="loading" style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '20px'
                                        }}>
                                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>Загрузка заказов...</p>
                                        </div>
                                    ) : userOrders.length === 0 ? (
                                        <div className="empty-state" style={{ padding: '15px', textAlign: 'center' }}>
                                            <p>У вас пока нет заказов</p>
                                            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>
                                                Сделайте ваш первый заказ!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="orders-list">
                                            {userOrders.map(order => (
                                                <div key={order.id} className="order-item" style={{
                                                    border: '1px solid #000',
                                                    borderRadius: '8px',
                                                    padding: '12px',
                                                    marginBottom: '10px',
                                                    backgroundColor: '#fff',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <div className="order-header" style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <div>
                                                            <strong style={{ fontSize: '0.9rem' }}>
                                                                Заказ #{order.id}
                                                            </strong>
                                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                                                                {formatDate(order.orderDate)}
                                                            </div>
                                                        </div>
                                                        {getStatusBadge(order.status)}
                                                    </div>

                                                    <div className="order-info" style={{
                                                        fontSize: '0.85rem',
                                                        marginBottom: '10px'
                                                    }}>
                                                        <div>
                                                            <strong>Ресторан:</strong> {order.restaurantName}
                                                        </div>
                                                        <div>
                                                            <strong>Сумма:</strong> ${formatTotalPrice(order.totalPrice)}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleViewOrderDetails(order)}
                                                        className="btn btn-view-details"
                                                        style={{
                                                            width: '100%',
                                                            padding: '6px 12px',
                                                            fontSize: '0.85rem',
                                                            backgroundColor: '#fff',
                                                            border: '1px solid #000',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        Детали заказа
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="main-content-area">
                        {selectedRestaurant && (
                            <div className="restaurant-header">
                                <h1 className="restaurant-name">{selectedRestaurant.name}</h1>
                                <p className="restaurant-info">
                                    <span className="cuisine">{selectedRestaurant.cuisine}</span>
                                    <span className="separator">•</span>
                                    <span className="address">{selectedRestaurant.address}</span>
                                </p>
                            </div>
                        )}

                        <MenuList
                            restaurantId={selectedRestaurant?.id}
                            onAddToCart={addToCart}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => {
                    setIsOrderModalOpen(false);
                    setSelectedOrder(null);
                    setRestaurantInfo(null);
                }}
                title={`Детали заказа #${selectedOrder?.id}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="order-details-modal">
                        {(selectedOrder.restaurantId || restaurantInfo) && (
                            <div className="restaurant-section" style={{
                                backgroundColor: '#e8f4fd',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '20px',
                                border: '1px solid #b6d4fe'
                            }}>
                                <h4 style={{
                                    marginBottom: '10px',
                                    color: '#084298',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>🍽️</span>
                                    <span>Информация о ресторане</span>
                                </h4>

                                {restaurantLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                        <span>Загрузка информации о ресторане...</span>
                                    </div>
                                ) : (
                                    <div className="restaurant-details">
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '10px',
                                            fontSize: '0.9rem'
                                        }}>
                                            <div>
                                                <strong>Название:</strong>
                                                <div style={{ marginTop: '4px' }}>{getOrderRestaurantName}</div>
                                            </div>

                                            {restaurantInfo?.address && (
                                                <div>
                                                    <strong>Адрес:</strong>
                                                    <div style={{ marginTop: '4px' }}>{restaurantInfo.address}</div>
                                                </div>
                                            )}

                                            {restaurantInfo?.cuisine && (
                                                <div>
                                                    <strong>Кухня:</strong>
                                                    <div style={{ marginTop: '4px' }}>{restaurantInfo.cuisine}</div>
                                                </div>
                                            )}

                                            {restaurantInfo?.phone && (
                                                <div>
                                                    <strong>Телефон:</strong>
                                                    <div style={{ marginTop: '4px' }}>{restaurantInfo.phone}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="order-summary" style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '20px',
                            border: '2px solid #000000'
                        }}>
                            <h4 style={{
                                marginBottom: '15px',
                                color: '#000000',
                                borderBottom: '2px solid #dee2e6',
                                paddingBottom: '8px'
                            }}>
                                Основная информация
                            </h4>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '15px'
                            }}>
                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>ID заказа:</div>
                                    <div>#{selectedOrder.id}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Статус:</div>
                                    <div>{getStatusBadge(selectedOrder.status)}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Дата и время:</div>
                                    <div>{formatDate(selectedOrder.orderDate)}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Клиент:</div>
                                    <div>{selectedOrder.customerFullName || 'Не указано'}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Телефон:</div>
                                    <div>{selectedOrder.customerTelephone || 'Не указан'}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Email:</div>
                                    <div>{selectedOrder.customerEmail || 'Не указан'}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Адрес доставки:</div>
                                    <div>{selectedOrder.deliveryAddress || 'Не указан'}</div>
                                </div>

                                <div className="summary-row">
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Общая сумма:</div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#198754' }}>
                                        ${formatTotalPrice(selectedOrder.totalPrice)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="order-items">
                                <h4 style={{
                                    marginBottom: '15px',
                                    color: '#000000',
                                    borderBottom: '2px solid #dee2e6',
                                    paddingBottom: '8px'
                                }}>
                                    Состав заказа ({selectedOrder.items.length} позиций)
                                </h4>
                                <div className="items-list" style={{
                                    maxHeight: '250px',
                                    overflowY: 'auto',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '6px'
                                }}>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                        padding: '10px 12px',
                                        backgroundColor: '#f8f9fa',
                                        fontWeight: '600',
                                        borderBottom: '2px solid #dee2e6'
                                    }}>
                                        <div>Блюдо</div>
                                        <div>Кол-во</div>
                                        <div>Цена</div>
                                        <div>Сумма</div>
                                    </div>

                                    {selectedOrder.items.map((item, index) => {
                                        const itemTotal = (item.price || 0) * (item.quantity || 1);
                                        return (
                                            <div key={index} className="item-row" style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                                padding: '10px 12px',
                                                borderBottom: '1px solid #e0e0e0',
                                                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>
                                                        {item.dishName || `Блюдо #${item.dishId}`}
                                                    </div>
                                                    {item.dishDescription && (
                                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
                                                            {item.dishDescription}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: '500' }}>{item.quantity || 1}</span>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>
                                                        ${formatTotalPrice(item.price)}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                        за шт.
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: '600', color: '#198754' }}>
                                                    ${formatTotalPrice(itemTotal)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '15px',
                                    paddingTop: '15px',
                                    borderTop: '2px solid #dee2e6'
                                }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                                            Итого:
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#000000' }}>
                                            ${formatTotalPrice(selectedOrder.totalPrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions" style={{
                            marginTop: '25px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                onClick={() => {
                                    setIsOrderModalOpen(false);
                                    setSelectedOrder(null);
                                    setRestaurantInfo(null);
                                }}
                                className="btn btn-close"
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Закрыть
                            </button>

                            {selectedOrder?.status === 'PENDING' && (
                                <button
                                    onClick={() => {
                                        if (window.confirm('Вы уверены, что хотите отменить заказ?')) {
                                            alert('Функция отмены заказа в разработке');
                                        }
                                    }}
                                    className="btn btn-cancel"
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#dc3545',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Отменить заказ
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .home-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #f5f5f5;
                }
                
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                    flex: 1;
                    width: 100%;
                }
                
                .grid-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 30px;
                    align-items: start;
                    min-height: 0;
                }
                
                .sidebar {
                    position: sticky;
                    top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    height: auto;
                    max-height: none;
                    overflow: visible;
                }
                
                .sidebar-section {
                    width: 100%;
                    margin-bottom: 0;
                }
                
                .user-orders-section {
                    background-color: #ffffff;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .orders-list {
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 5px;
                }
                
                .orders-list::-webkit-scrollbar {
                    width: 6px;
                }
                
                .orders-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                
                .orders-list::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }
                
                .orders-list::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                
                .order-item {
                    border: 1px solid #000;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 10px;
                    background-color: #fff;
                    transition: all 0.3s ease;
                }
                
                .order-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .btn-view-details:hover {
                    background-color: #000000 !important;
                    color: #ffffff !important;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .btn-refresh:hover {
                    opacity: 0.7;
                    transform: rotate(180deg);
                }
                
                .main-content-area {
                    min-height: 100vh;
                    overflow: visible;
                }
                
                .restaurant-header {
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #000000;
                }
                
                .restaurant-name {
                    font-size: 2rem;
                    margin-bottom: 8px;
                    color: #000000;
                }
                
                .restaurant-info {
                    font-size: 1rem;
                    color: #666;
                }
                
                .cuisine, .address {
                    margin: 0 5px;
                }
                
                .separator {
                    margin: 0 10px;
                }
                
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    gap: 15px;
                }
                
                .spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #000000;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .error-container {
                    text-align: center;
                    padding: 40px 20px;
                }
                
                .btn-retry {
                    background-color: #000000;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 15px;
                }
                
                .btn-retry:hover {
                    background-color: #333333;
                }
                
                /* Футер (если есть) */
                .footer {
                    margin-top: auto;
                    background-color: #000;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                
                /* Адаптивность */
                @media (max-width: 1200px) {
                    .container {
                        padding: 15px;
                    }
                    
                    .grid-layout {
                        gap: 20px;
                    }
                }
                
                @media (max-width: 1024px) {
                    .grid-layout {
                        grid-template-columns: 300px 1fr;
                    }
                    
                    .orders-list {
                        max-height: 350px;
                    }
                }
                
                @media (max-width: 768px) {
                    .grid-layout {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    .sidebar {
                        position: static;
                        gap: 15px;
                    }
                    
                    .orders-list {
                        max-height: 300px;
                    }
                }
                
                @media (max-width: 480px) {
                    .container {
                        padding: 10px;
                    }
                    
                    .grid-layout {
                        gap: 15px;
                    }
                    
                    .user-orders-section {
                        padding: 15px;
                    }
                    
                    .orders-list {
                        max-height: 250px;
                    }
                }
            `}</style>
        </div>
    );
};

export default HomePage;
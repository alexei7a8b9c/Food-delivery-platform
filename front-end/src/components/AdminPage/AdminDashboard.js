import React, { useState, useEffect } from 'react';
import { restaurantApi, dishApi, orderApi, formatErrorMessage } from '../../services/api';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import ImageUploader from '../common/ImageUploader';

const AdminDashboard = () => {
    // Состояния для ресторанов
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantsLoading, setRestaurantsLoading] = useState(true);
    const [restaurantsCurrentPage, setRestaurantsCurrentPage] = useState(0);
    const [restaurantsTotalPages, setRestaurantsTotalPages] = useState(0);
    const [restaurantsTotalElements, setRestaurantsTotalElements] = useState(0);
    const [restaurantsSearchTerm, setRestaurantsSearchTerm] = useState('');

    // Состояния для блюд
    const [dishes, setDishes] = useState([]);
    const [dishesLoading, setDishesLoading] = useState(true);
    const [dishesCurrentPage, setDishesCurrentPage] = useState(0);
    const [dishesTotalPages, setDishesTotalPages] = useState(0);
    const [dishesTotalElements, setDishesTotalElements] = useState(0);
    const [dishesSearchTerm, setDishesSearchTerm] = useState('');

    // Состояния для заказов
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(0);
    const [ordersTotalPages, setOrdersTotalPages] = useState(0);
    const [ordersTotalElements, setOrdersTotalElements] = useState(0);
    const [ordersSearchTerm, setOrdersSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ordersError, setOrdersError] = useState('');

    // Общие состояния
    const [activeTab, setActiveTab] = useState('restaurants');
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [editingDish, setEditingDish] = useState(null);
    const [error, setError] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [apiStatus, setApiStatus] = useState('');

    // Данные форм
    const [restaurantFormData, setRestaurantFormData] = useState({
        name: '',
        cuisine: '',
        address: ''
    });

    const [dishFormData, setDishFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        restaurantId: ''
    });

    const [orderFormData, setOrderFormData] = useState({
        status: ''
    });

    // Загрузка ресторанов
    useEffect(() => {
        loadRestaurants();
    }, [restaurantsCurrentPage, restaurantsSearchTerm]);

    // Загрузка блюд
    useEffect(() => {
        if (activeTab === 'dishes') {
            if (selectedRestaurant) {
                loadDishesByRestaurant();
            } else {
                loadAllDishes();
            }
        }
    }, [dishesCurrentPage, dishesSearchTerm, selectedRestaurant, activeTab]);

    // Загрузка заказов
    useEffect(() => {
        if (activeTab === 'orders') {
            loadOrders();
        }
    }, [ordersCurrentPage, ordersSearchTerm, activeTab]);

    // Функции загрузки данных
    const loadRestaurants = async () => {
        setRestaurantsLoading(true);
        setError('');
        try {
            const response = await restaurantApi.getAll({
                search: restaurantsSearchTerm || undefined,
                page: restaurantsCurrentPage,
                size: 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setRestaurants(response.data.content || []);
            setRestaurantsTotalPages(response.data.totalPages || 1);
            setRestaurantsTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading restaurants:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Не удалось загрузить рестораны: ${errorMessage}`);
        } finally {
            setRestaurantsLoading(false);
        }
    };

    const loadAllDishes = async () => {
        setDishesLoading(true);
        setError('');
        try {
            const response = await dishApi.getAll({
                search: dishesSearchTerm || undefined,
                page: dishesCurrentPage,
                size: 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setDishes(response.data.content || []);
            setDishesTotalPages(response.data.totalPages || 1);
            setDishesTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading dishes:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Не удалось загрузить блюда: ${errorMessage}`);
        } finally {
            setDishesLoading(false);
        }
    };

    const loadDishesByRestaurant = async () => {
        if (!selectedRestaurant) return;

        setDishesLoading(true);
        setError('');
        try {
            const response = await dishApi.getByRestaurant(selectedRestaurant.id, {
                search: dishesSearchTerm || undefined,
                page: dishesCurrentPage,
                size: 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setDishes(response.data.content || []);
            setDishesTotalPages(response.data.totalPages || 1);
            setDishesTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading dishes by restaurant:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Не удалось загрузить блюда ресторана: ${errorMessage}`);
        } finally {
            setDishesLoading(false);
        }
    };

    // ФУНКЦИЯ ЗАГРУЗКИ ЗАКАЗОВ
    const loadOrders = async () => {
        setOrdersLoading(true);
        setOrdersError('');
        setApiStatus('');

        try {
            console.log('🔄 Загрузка заказов через API Gateway...');

            // Используем реальный API вместо демо-данных
            const response = await orderApi.getAllOrders();
            console.log('✅ Ответ от сервера заказов:', response.data);

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

            console.log(`✅ Загружено ${ordersData.length} заказов из БД`);
            setApiStatus(`Загружено ${ordersData.length} реальных заказов из базы данных`);

            // Фильтрация по поиску
            if (ordersSearchTerm) {
                const term = ordersSearchTerm.toLowerCase();
                ordersData = ordersData.filter(order =>
                    (order.id && order.id.toString().includes(term)) ||
                    (order.status && order.status.toLowerCase().includes(term)) ||
                    (order.customerTelephone && order.customerTelephone.includes(term)) ||
                    (order.customerFullName && order.customerFullName.toLowerCase().includes(term))
                );
            }

            setOrders(ordersData);
            setOrdersTotalPages(1);
            setOrdersTotalElements(ordersData.length);

        } catch (error) {
            console.error('❌ Ошибка загрузки заказов:', error);
            const errorMessage = formatErrorMessage(error);
            setOrdersError(`Не удалось загрузить заказов: ${errorMessage}`);

            // В случае ошибки показываем пустой список
            setOrders([]);
            setOrdersTotalPages(1);
            setOrdersTotalElements(0);
            setApiStatus('Ошибка подключения к серверу заказов');
        } finally {
            setOrdersLoading(false);
        }
    };


    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ПРОСМОТРА ДЕТАЛЕЙ ЗАКАЗА
    const handleViewOrderDetails = async (order) => {
        try {
            // Загружаем полные данные заказа из сервера
            console.log(`🔍 Загрузка деталей заказа #${order.id}...`);
            const response = await orderApi.getOrderById(order.id);
            console.log('✅ Детали заказа загружены:', response.data);

            if (response.data) {
                setSelectedOrder(response.data);
                setOrderFormData({ status: response.data.status || '' });
                setIsOrderModalOpen(true);
            } else {
                setSelectedOrder(order);
                setOrderFormData({ status: order.status || '' });
                setIsOrderModalOpen(true);
                setError('Не удалось загрузить полные данные заказа');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки деталей заказа:', error);
            // Если не удалось загрузить, показываем то, что есть
            setSelectedOrder(order);
            setOrderFormData({ status: order.status || '' });
            setIsOrderModalOpen(true);
            setError('Не удалось загрузить полные данные заказа');
        }
    };

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТУСА
    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТУСА
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            console.log(`🔄 Обновление статуса заказа #${orderId} на ${newStatus}`);

            // 1. Формируем корректные данные
            const orderData = {
                status: newStatus
            };

            console.log('Данные для обновления:', orderData);

            // 2. Отправляем запрос на сервер через наш API
            const response = await orderApi.updateOrderStatus(orderId, newStatus);
            console.log('✅ Ответ сервера при обновлении статуса:', response.data);

            if (response.data) {
                alert(`✅ Статус заказа #${orderId} успешно изменен на: ${newStatus}`);

                // 3. Обновляем локальное состояние
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId ? {
                            ...order,
                            status: newStatus
                        } : order
                    )
                );

                // 4. Обновляем выбранный заказ в модальном окне
                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({
                        ...prev,
                        status: newStatus
                    }));
                }

                // 5. Если модальное окно открыто - закрываем его
                if (isOrderModalOpen) {
                    setIsOrderModalOpen(false);
                    setOrderFormData({ status: '' });
                }

                // 6. Перезагружаем заказы для обновления данных
                setTimeout(() => {
                    loadOrders();
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Ошибка обновления статуса:', error);
            console.error('Детали ошибки:', {
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            let errorMessage = formatErrorMessage(error);

            // Добавляем детали ошибки из ответа сервера
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    }
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                    if (error.response.data.details) {
                        errorMessage += `\nДетали: ${error.response.data.details}`;
                    }
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }

            alert(`❌ Не удалось обновить статус заказа #${orderId}:\n${errorMessage}`);

            // Показываем дополнительные детали для отладки
            if (error.response?.data) {
                console.error('Данные ошибки:', error.response.data);
            }
        }
    };

    // Тестирование соединения с сервером заказов
    const testOrderConnection = async () => {
        setIsTestingConnection(true);
        setOrdersError('');
        setApiStatus('Тестирование соединения...');

        try {
            // Тест 1: Проверка тестового эндпоинта
            const testResponse = await orderApi.testConnection();
            console.log('✅ Тестовый ответ:', testResponse);

            // Тест 2: Проверка авторизации
            const authResponse = await orderApi.testAuth();
            console.log('✅ Ответ авторизации:', authResponse);

            // Тест 3: Попытка получить реальные данные (если сервер доступен)
            try {
                const ordersResponse = await orderApi.getAllOrders();
                console.log('✅ Ответ с заказами:', ordersResponse.data);
                setApiStatus(`✅ Соединение установлено! Получено ${ordersResponse.data?.length || 0} заказов`);
            } catch (serverError) {
                console.warn('⚠️ Сервер доступен, но данные получить не удалось:', serverError.message);
                setApiStatus('✅ Соединение установлено, но сервер заказов вернул ошибку');
            }

        } catch (error) {
            console.error('❌ Ошибка тестирования:', error);
            setApiStatus('❌ Ошибка соединения.');
            setOrdersError(formatErrorMessage(error));
        } finally {
            setIsTestingConnection(false);
        }
    };

    // Поиск
    const handleRestaurantSearch = (term) => {
        setRestaurantsSearchTerm(term);
        setRestaurantsCurrentPage(0);
    };

    const handleDishSearch = (term) => {
        setDishesSearchTerm(term);
        setDishesCurrentPage(0);
    };

    const handleOrderSearch = (term) => {
        setOrdersSearchTerm(term);
        setOrdersCurrentPage(0);

        // Фильтруем заказы на клиенте
        if (orders.length > 0) {
            const filtered = orders.filter(order =>
                (order.id && order.id.toString().includes(term)) ||
                (order.status && order.status.toLowerCase().includes(term.toLowerCase())) ||
                (order.customerTelephone && order.customerTelephone.includes(term)) ||
                (order.customerFullName && order.customerFullName.toLowerCase().includes(term.toLowerCase())) ||
                (order.restaurantName && order.restaurantName.toLowerCase().includes(term.toLowerCase()))
            );
            setOrders(filtered);
            setOrdersTotalElements(filtered.length);
        } else {
            loadOrders();
        }
    };

    // Рестораны CRUD
    const handleCreateRestaurant = () => {
        setEditingRestaurant(null);
        setRestaurantFormData({ name: '', cuisine: '', address: '' });
        setIsRestaurantModalOpen(true);
    };

    const handleEditRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant);
        setRestaurantFormData({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            address: restaurant.address
        });
        setIsRestaurantModalOpen(true);
    };

    const handleDeleteRestaurant = async (id, name) => {
        if (window.confirm(`Вы уверены, что хотите удалить ресторан "${name}"?`)) {
            try {
                await restaurantApi.delete(id);
                alert('Ресторан успешно удален');
                loadRestaurants();
                if (selectedRestaurant?.id === id) {
                    setSelectedRestaurant(null);
                }
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Не удалось удалить ресторан: ${errorMessage}`);
            }
        }
    };

    // Блюда CRUD
    const handleCreateDish = () => {
        if (!selectedRestaurant && activeTab === 'dishes') {
            alert('Пожалуйста, выберите ресторан для добавления блюда');
            return;
        }

        setEditingDish(null);
        const restaurantId = selectedRestaurant?.id || '';
        setDishFormData({
            name: '',
            description: '',
            price: '',
            imageUrl: '',
            restaurantId: restaurantId
        });
        setUploadedImage(null);
        setIsDishModalOpen(true);
    };

    const handleEditDish = (dish) => {
        setEditingDish(dish);
        setDishFormData({
            name: dish.name,
            description: dish.description || '',
            price: dish.price,
            imageUrl: dish.imageUrl || '',
            restaurantId: dish.restaurantId
        });
        setUploadedImage(null);
        setIsDishModalOpen(true);
    };

    const handleDeleteDish = async (id, name) => {
        if (window.confirm(`Вы уверены, что хотите удалить блюдо "${name}"?`)) {
            try {
                await dishApi.delete(id);
                alert('Блюдо успешно удалено');
                if (selectedRestaurant) {
                    loadDishesByRestaurant();
                } else {
                    loadAllDishes();
                }
            } catch (error) {
                console.error('Error deleting dish:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Не удалось удалить блюдо: ${errorMessage}`);
            }
        }
    };

    // Заказы CRUD
    const handleCancelOrder = async (orderId) => {
        if (window.confirm(`Вы уверены, что хотите отменить заказ #${orderId}?`)) {
            try {
                // Получаем текущий заказ для проверки статуса
                const order = orders.find(o => o.id === orderId);
                if (!order) {
                    alert('Заказ не найден');
                    return;
                }

                // Проверяем, можно ли отменить заказ
                if (order.status === 'CANCELLED') {
                    alert('Заказ уже отменен');
                    return;
                }

                if (order.status === 'DELIVERED') {
                    alert('Нельзя отменить доставленный заказ');
                    return;
                }

                // Используем функцию обновления статуса для отмены
                await handleUpdateOrderStatus(orderId, 'CANCELLED');
            } catch (error) {
                console.error('Error cancelling order:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Не удалось отменить заказ: ${errorMessage}`);
            }
        }
    };

    // Обработка изображений для блюд
    const handleImageUpload = async (file) => {
        setImageUploading(true);
        setError('');

        try {
            console.log('Uploading image:', file.name, file.size, file.type);

            // Проверяем размер файла
            if (file.size > 10 * 1024 * 1024) {
                throw new Error('Размер файла не должен превышать 10MB');
            }

            // Проверяем тип файла
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
            }

            // Для нового блюда просто сохраняем файл
            if (!editingDish) {
                setUploadedImage(file);
                return Promise.resolve();
            }

            // Для существующего блюда - загружаем на сервер
            console.log('Uploading image for existing dish:', editingDish.id);
            const response = await dishApi.uploadImage(editingDish.id, file);
            console.log('Image upload response:', response.data);

            // Обновляем URL изображения в форме
            const imageUrl = response.data?.imageUrl || response.data?.fileDownloadUri;
            if (imageUrl) {
                setDishFormData(prev => ({ ...prev, imageUrl }));
            }

            setUploadedImage(null); // Сбрасываем после загрузки
            return Promise.resolve();
        } catch (error) {
            console.error('Image upload error:', error);
            const errorMessage = error.message || formatErrorMessage(error);
            setError(`Ошибка загрузки изображения: ${errorMessage}`);
            return Promise.reject(error);
        } finally {
            setImageUploading(false);
        }
    };

    const handleImageDelete = async () => {
        if (!editingDish) {
            // Для нового блюда просто очищаем
            setUploadedImage(null);
            setDishFormData(prev => ({ ...prev, imageUrl: '' }));
            return Promise.resolve();
        }

        try {
            await dishApi.deleteImage(editingDish.id);
            setDishFormData(prev => ({ ...prev, imageUrl: '' }));
            return Promise.resolve();
        } catch (error) {
            const errorMessage = formatErrorMessage(error);
            setError(`Ошибка удаления изображения: ${errorMessage}`);
            return Promise.reject(error);
        }
    };

    // Сохранение форм
    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Валидация данных
            if (!restaurantFormData.name.trim()) {
                throw new Error('Название ресторана обязательно');
            }
            if (!restaurantFormData.cuisine.trim()) {
                throw new Error('Тип кухни обязателен');
            }
            if (!restaurantFormData.address.trim()) {
                throw new Error('Адрес обязателен');
            }

            const restaurantData = {
                name: restaurantFormData.name.trim(),
                cuisine: restaurantFormData.cuisine.trim(),
                address: restaurantFormData.address.trim()
            };

            console.log('Submitting restaurant data:', restaurantData);

            if (editingRestaurant) {
                await restaurantApi.update(editingRestaurant.id, restaurantData);
                alert('Ресторан успешно обновлен');
            } else {
                await restaurantApi.create(restaurantData);
                alert('Ресторан успешно создан');
            }

            setIsRestaurantModalOpen(false);
            loadRestaurants();
        } catch (error) {
            console.error('Error saving restaurant:', error);
            let errorMessage = formatErrorMessage(error);
            setError(errorMessage);
        }
    };

    const handleDishSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log('Submitting dish form:', dishFormData);
            console.log('Uploaded image:', uploadedImage);

            // Проверяем обязательные поля
            if (!dishFormData.restaurantId) {
                throw new Error('Выберите ресторан для блюда');
            }

            if (!dishFormData.name.trim()) {
                throw new Error('Название блюда обязательно');
            }

            // Преобразуем цену
            const price = parseFloat(dishFormData.price);
            if (isNaN(price) || price <= 0) {
                throw new Error('Укажите корректную цену (больше 0)');
            }

            // Подготавливаем данные для отправки
            const dishData = {
                name: dishFormData.name.trim(),
                description: dishFormData.description?.trim() || '',
                price: price,
                restaurantId: parseInt(dishFormData.restaurantId, 10),
                imageUrl: dishFormData.imageUrl?.trim() || null
            };

            console.log('Prepared dish data for API:', dishData);

            let savedDish;

            if (editingDish) {
                // Обновление существующего блюда
                console.log('Updating dish...');
                const response = await dishApi.update(editingDish.id, dishData);
                savedDish = response.data;
                console.log('Dish updated:', savedDish);

                // Если есть загруженное изображение, загружаем его отдельно
                if (uploadedImage) {
                    try {
                        console.log('Uploading image for updated dish...');
                        await dishApi.uploadImage(editingDish.id, uploadedImage);
                    } catch (imgError) {
                        console.warn('Failed to upload image:', imgError);
                        // Не прерываем поток, блюдо уже обновлено
                    }
                }

                alert('Блюдо успешно обновлено');
            } else {
                // Создание нового блюда
                console.log('Creating new dish...');
                const response = await dishApi.create(dishData);
                savedDish = response.data;
                console.log('Dish created:', savedDish);

                // Если есть загруженное изображение, загружаем его отдельно
                if (uploadedImage && savedDish?.id) {
                    try {
                        console.log('Uploading image for new dish...');
                        await dishApi.uploadImage(savedDish.id, uploadedImage);
                    } catch (imgError) {
                        console.warn('Failed to upload image for new dish:', imgError);
                        alert('Блюдо создано, но возникла ошибка при загрузке изображения');
                    }
                }

                alert('Блюдо успешно создано');
            }

            // Закрываем модальное окно и обновляем данные
            setIsDishModalOpen(false);
            setTimeout(() => {
                if (selectedRestaurant) {
                    loadDishesByRestaurant();
                } else {
                    loadAllDishes();
                }
            }, 500);

        } catch (error) {
            console.error('Error saving dish:', error);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            console.error('Error message:', error.message);

            let errorMessage = formatErrorMessage(error);

            // Добавляем детали из ответа сервера
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            if (error.message && error.message.includes('Выберите') ||
                error.message.includes('обязательно') ||
                error.message.includes('корректную')) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        }
    };

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ СТАТУСА ЗАКАЗА
    const handleOrderStatusSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!selectedOrder || !orderFormData.status) {
                throw new Error('Выберите новый статус');
            }

            // Проверяем, что статус изменился
            if (orderFormData.status === selectedOrder.status) {
                setError('Статус уже установлен на это значение');
                return;
            }

            console.log(`Отправка обновления статуса для заказа #${selectedOrder.id}: ${orderFormData.status}`);

            await handleUpdateOrderStatus(selectedOrder.id, orderFormData.status);

            // Закрываем модальное окно после успешного обновления
            setIsOrderModalOpen(false);
            setSelectedOrder(null);
            setOrderFormData({ status: '' });

        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.message || formatErrorMessage(error));
        }
    };

    // Обработчики изменений форм
    const handleRestaurantFormChange = (e) => {
        const { name, value } = e.target;
        setRestaurantFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDishFormChange = (e) => {
        const { name, value } = e.target;
        setDishFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOrderFormChange = (e) => {
        const { name, value } = e.target;
        setOrderFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Выбор ресторана для блюд
    const handleSelectRestaurantForDishes = (restaurant) => {
        setSelectedRestaurant(restaurant);
        setDishesCurrentPage(0);
        setDishesSearchTerm('');
    };

    const handleClearRestaurantSelection = () => {
        setSelectedRestaurant(null);
        setDishesCurrentPage(0);
        setDishesSearchTerm('');
    };

    // Статусы заказов
    const orderStatuses = [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ];

    const getStatusBadge = (status) => {
        const statusColors = {
            'PENDING': '#ffc107',
            'CONFIRMED': '#17a2b8',
            'PREPARING': '#007bff',
            'OUT_FOR_DELIVERY': '#6f42c1',
            'DELIVERED': '#28a745',
            'CANCELLED': '#dc3545'
        };

        const color = statusColors[status] || '#6c757d';
        return (
            <span
                className="status-badge"
                style={{
                    backgroundColor: color,
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}
            >
        {status}
      </span>
        );
    };

    // Статистика
    const getStats = () => {
        const totalRestaurants = restaurantsTotalElements;
        const totalDishes = dishesTotalElements;
        const totalOrders = ordersTotalElements;
        const selectedRestaurantDishCount = selectedRestaurant
            ? dishes.length
            : null;

        return {
            totalRestaurants,
            totalDishes,
            totalOrders,
            selectedRestaurantDishCount
        };
    };

    const stats = getStats();

    // Функция для получения названия ресторана по ID
    const getRestaurantNameById = (restaurantId) => {
        if (!restaurantId) return 'Не указан';

        const restaurant = restaurants.find(r => r.id === restaurantId);
        return restaurant ? restaurant.name : `ID: ${restaurantId}`;
    };

    // Функция для форматирования суммы (деление на 100 для перевода из копеек в рубли)
    const formatTotalPrice = (price) => {
        if (price === undefined || price === null) return '0.00';

        // Если цена хранится в копейках (как в вашем backend), делим на 100
        const priceInRubles = price / 100;
        return priceInRubles.toFixed(2);
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">🍽️ Административная панель</h1>
                <div className="dashboard-stats">
                    <div className="stat-item">
                        <span className="stat-label">Рестораны:</span>
                        <span className="stat-value">{stats.totalRestaurants}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Блюда:</span>
                        <span className="stat-value">{stats.totalDishes}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Заказы:</span>
                        <span className="stat-value">{stats.totalOrders}</span>
                    </div>
                    {selectedRestaurant && (
                        <div className="stat-item">
                            <span className="stat-label">Выбранный ресторан:</span>
                            <span className="stat-value">{selectedRestaurant.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Ошибка:</strong> {error}
                </div>
            )}

            {/* Навигация между вкладками */}
            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('restaurants')}
                >
                    🏪 Рестораны
                </button>
                <button
                    className={`tab-btn ${activeTab === 'dishes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dishes')}
                >
                    🍽️ Блюда
                </button>
                <button
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    📋 Заказы
                </button>
            </div>

            {/* Вкладка ресторанов */}
            {activeTab === 'restaurants' && (
                <div className="tab-content">
                    <div className="section-header">
                        <div className="section-actions">
                            <SearchBar
                                onSearch={handleRestaurantSearch}
                                placeholder="Поиск ресторанов по названию или адресу..."
                            />
                            <button
                                onClick={handleCreateRestaurant}
                                className="btn btn-create"
                            >
                                + Добавить ресторан
                            </button>
                        </div>
                    </div>

                    {restaurantsLoading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Загрузка ресторанов...</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Название</th>
                                        <th>Тип кухни</th>
                                        <th>Адрес</th>
                                        <th style={{ width: '200px' }}>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {restaurants.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-cell">
                                                <div className="empty-state">
                                                    <div className="empty-icon">🏪</div>
                                                    <h3>Рестораны не найдены</h3>
                                                    <p>Добавьте первый ресторан</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        restaurants.map(restaurant => (
                                            <tr key={restaurant.id}>
                                                <td className="id-cell">{restaurant.id}</td>
                                                <td>
                                                    <strong>{restaurant.name}</strong>
                                                    <button
                                                        className="btn-select"
                                                        onClick={() => {
                                                            handleSelectRestaurantForDishes(restaurant);
                                                            setActiveTab('dishes');
                                                        }}
                                                        title="Управлять блюдами этого ресторана"
                                                    >
                                                        👁️
                                                    </button>
                                                </td>
                                                <td>
                                                    <span className="badge">{restaurant.cuisine}</span>
                                                </td>
                                                <td className="truncate" title={restaurant.address}>
                                                    {restaurant.address}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleEditRestaurant(restaurant)}
                                                            className="btn-action btn-edit"
                                                        >
                                                            ✏️ Редактировать
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                                                            className="btn-action btn-delete"
                                                        >
                                                            🗑️ Удалить
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {restaurants.length > 0 && (
                                <Pagination
                                    currentPage={restaurantsCurrentPage}
                                    totalPages={restaurantsTotalPages}
                                    totalElements={restaurantsTotalElements}
                                    onPageChange={setRestaurantsCurrentPage}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Вкладка блюд */}
            {activeTab === 'dishes' && (
                <div className="tab-content">
                    <div className="section-header">
                        <div className="section-title-area">
                            <h2 className="section-title">Управление блюдами</h2>
                            {selectedRestaurant && (
                                <div className="selected-restaurant">
                                    <span>Ресторан: </span>
                                    <strong>{selectedRestaurant.name}</strong>
                                    <button
                                        onClick={handleClearRestaurantSelection}
                                        className="btn btn-clear"
                                        title="Показать все блюда"
                                    >
                                        ❌ Снять выбор
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="section-actions">
                            <SearchBar
                                onSearch={handleDishSearch}
                                placeholder={selectedRestaurant
                                    ? `Поиск блюд в "${selectedRestaurant.name}"...`
                                    : "Поиск всех блюд..."
                                }
                            />
                            <button
                                onClick={handleCreateDish}
                                className="btn btn-create"
                                disabled={!selectedRestaurant}
                            >
                                + Добавить блюдо
                            </button>
                        </div>
                    </div>

                    {!selectedRestaurant && (
                        <div className="restaurant-selection-hint">
                            <div className="hint-content">
                                <div className="hint-icon">ℹ️</div>
                                <div>
                                    <h4>Выберите ресторан</h4>
                                    <p>Чтобы добавить новое блюдо, выберите ресторан из списка:</p>
                                    <div className="quick-restaurant-list">
                                        {restaurants.slice(0, 5).map(restaurant => (
                                            <button
                                                key={restaurant.id}
                                                onClick={() => handleSelectRestaurantForDishes(restaurant)}
                                                className="btn btn-restaurant-select"
                                            >
                                                {restaurant.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {dishesLoading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Загрузка блюд...</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Название</th>
                                        <th>Описание</th>
                                        <th>Цена</th>
                                        <th>Ресторан</th>
                                        <th>Изображение</th>
                                        <th style={{ width: '200px' }}>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dishes.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="empty-cell">
                                                <div className="empty-state">
                                                    <div className="empty-icon">🍽️</div>
                                                    <h3>Блюда не найдены</h3>
                                                    <p>{selectedRestaurant
                                                        ? `В ресторане "${selectedRestaurant.name}" пока нет блюд`
                                                        : 'Блюда не найдены'
                                                    }</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        dishes.map(dish => (
                                            <tr key={dish.id}>
                                                <td className="id-cell">{dish.id}</td>
                                                <td>
                                                    <strong>{dish.name}</strong>
                                                </td>
                                                <td className="truncate" title={dish.description}>
                                                    {dish.description || '---'}
                                                </td>
                                                <td className="price">
                                                    ${parseFloat(dish.price).toFixed(2)}
                                                </td>
                                                <td>
                                                    {dish.restaurantName || 'Неизвестно'}
                                                </td>
                                                <td>
                                                    {dish.imageUrl ? (
                                                        <div className="image-indicator">
                                                            📷 Есть
                                                        </div>
                                                    ) : (
                                                        <span className="no-image">Нет</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleEditDish(dish)}
                                                            className="btn-action btn-edit"
                                                        >
                                                            ✏️ Редактировать
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteDish(dish.id, dish.name)}
                                                            className="btn-action btn-delete"
                                                        >
                                                            🗑️ Удалить
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {dishes.length > 0 && (
                                <Pagination
                                    currentPage={dishesCurrentPage}
                                    totalPages={dishesTotalPages}
                                    totalElements={dishesTotalElements}
                                    onPageChange={setDishesCurrentPage}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Вкладка заказов */}
            {activeTab === 'orders' && (
                <div className="tab-content">
                    <div className="section-header">
                        <div className="section-actions">
                            <SearchBar
                                onSearch={handleOrderSearch}
                                placeholder="Поиск заказов по ID, статусу, телефону или имени..."
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={loadOrders}
                                    className="btn btn-refresh"
                                    disabled={ordersLoading || isTestingConnection}
                                >
                                    {ordersLoading ? '🔄 Загрузка...' : '🔄 Обновить'}
                                </button>
                                <button
                                    onClick={testOrderConnection}
                                    className="btn btn-test"
                                    disabled={isTestingConnection}
                                    style={{ backgroundColor: '#17a2b8', color: 'white' }}
                                >
                                    {isTestingConnection ? '🔍 Тестирование...' : '🔍 Тест соединения'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {apiStatus && (
                        <div className={`api-status ${apiStatus.includes('✅') ? 'success' : apiStatus.includes('❌') ? 'error' : 'info'}`}>
                            {apiStatus}
                        </div>
                    )}

                    {ordersError && (
                        <div className="alert alert-warning">
                            <strong>Внимание:</strong> {ordersError}
                        </div>
                    )}

                    {ordersLoading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Загрузка заказов...</p>
                            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                                Пытаюсь подключиться к серверу заказов...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="admin-table">
                                    <thead>
                                    <tr>
                                        <th>ID заказа</th>
                                        <th>Клиент</th>
                                        <th>Телефон</th>
                                        <th>Ресторан</th>
                                        <th>Статус</th>
                                        <th>Общая сумма</th>
                                        <th>Дата заказа</th>
                                        <th style={{ width: '220px' }}>Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="empty-cell">
                                                <div className="empty-state">
                                                    <div className="empty-icon">📋</div>
                                                    <h3>Заказы не найдены</h3>
                                                    <p>Пока нет заказов или возникла ошибка при загрузке</p>
                                                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={loadOrders}
                                                            className="btn btn-retry"
                                                        >
                                                            🔄 Попробовать снова
                                                        </button>
                                                        <button
                                                            onClick={testOrderConnection}
                                                            className="btn btn-test"
                                                            style={{ backgroundColor: '#17a2b8', color: 'white' }}
                                                        >
                                                            🔍 Тест соединения
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="id-cell">#{order.id}</td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{order.customerFullName || 'Не указано'}</div>
                                                </td>
                                                <td className="phone-column">
                                                    <div style={{ fontWeight: '500', fontFamily: 'monospace' }}>
                                                        {order.customerTelephone || 'Не указан'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '500' }}>
                                                        {order.restaurantName || getRestaurantNameById(order.restaurantId)}
                                                    </div>
                                                </td>
                                                <td>
                                                    {getStatusBadge(order.status)}
                                                </td>
                                                <td className="price">
                                                    ${formatTotalPrice(order.totalPrice)}
                                                </td>
                                                <td>
                                                    {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleViewOrderDetails(order)}
                                                            className="btn-action btn-view"
                                                            style={{ borderColor: '#17a2b8', color: '#17a2b8' }}
                                                        >
                                                            👁️ Подробнее
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="btn-action btn-delete"
                                                            disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                                            style={order.status === 'CANCELLED' || order.status === 'DELIVERED' ?
                                                                { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                        >
                                                            🗑️ Отменить
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {orders.length > 0 && (
                                <Pagination
                                    currentPage={ordersCurrentPage}
                                    totalPages={ordersTotalPages}
                                    totalElements={ordersTotalElements}
                                    onPageChange={setOrdersCurrentPage}
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Модальное окно ресторана */}
            <Modal
                isOpen={isRestaurantModalOpen}
                onClose={() => setIsRestaurantModalOpen(false)}
                title={editingRestaurant ? 'Редактировать ресторан' : 'Добавить ресторан'}
            >
                <form onSubmit={handleRestaurantSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Название ресторана *</label>
                        <input
                            type="text"
                            name="name"
                            value={restaurantFormData.name}
                            onChange={handleRestaurantFormChange}
                            required
                            minLength="2"
                            maxLength="100"
                            placeholder="Введите название ресторана"
                        />
                    </div>

                    <div className="form-group">
                        <label>Тип кухни *</label>
                        <input
                            type="text"
                            name="cuisine"
                            value={restaurantFormData.cuisine}
                            onChange={handleRestaurantFormChange}
                            required
                            minLength="2"
                            maxLength="50"
                            placeholder="Например: Итальянская, Японская"
                        />
                    </div>

                    <div className="form-group">
                        <label>Адрес *</label>
                        <textarea
                            name="address"
                            value={restaurantFormData.address}
                            onChange={handleRestaurantFormChange}
                            required
                            minLength="5"
                            maxLength="255"
                            rows="3"
                            placeholder="Полный адрес ресторана"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-submit">
                            {editingRestaurant ? 'Сохранить изменения' : 'Создать ресторан'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRestaurantModalOpen(false)}
                            className="btn btn-cancel"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Модальное окно блюда */}
            <Modal
                isOpen={isDishModalOpen}
                onClose={() => {
                    setIsDishModalOpen(false);
                    setError('');
                    setUploadedImage(null);
                }}
                title={editingDish ? 'Редактировать блюдо' : 'Добавить блюдо'}
            >
                <form onSubmit={handleDishSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Название блюда *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={dishFormData.name}
                                    onChange={handleDishFormChange}
                                    required
                                    minLength="2"
                                    maxLength="100"
                                    placeholder="Введите название блюда"
                                />
                            </div>

                            <div className="form-group">
                                <label>Описание</label>
                                <textarea
                                    name="description"
                                    value={dishFormData.description}
                                    onChange={handleDishFormChange}
                                    maxLength="500"
                                    rows="3"
                                    placeholder="Описание блюда (необязательно)"
                                />
                            </div>

                            <div className="form-group">
                                <label>Цена *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={dishFormData.price}
                                    onChange={handleDishFormChange}
                                    required
                                    min="1"
                                    max="10000"
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ресторан *</label>
                                <select
                                    name="restaurantId"
                                    value={dishFormData.restaurantId}
                                    onChange={handleDishFormChange}
                                    required
                                    disabled={!!selectedRestaurant}
                                >
                                    <option value="">Выберите ресторан</option>
                                    {restaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedRestaurant && (
                                    <p className="form-hint">Ресторан выбран из списка: {selectedRestaurant.name}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>URL изображения (необязательно)</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={dishFormData.imageUrl || ''}
                                    onChange={handleDishFormChange}
                                    maxLength="2048"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        <div className="form-column">
                            <ImageUploader
                                onUpload={handleImageUpload}
                                onDelete={handleImageDelete}
                                initialImageUrl={dishFormData.imageUrl}
                                label="Или загрузите изображение"
                                maxSizeMB={10}
                            />
                            <div className="image-info">
                                <p className="image-info-text">Максимальный размер: 10MB</p>
                                <p className="image-info-text">Форматы: JPG, PNG, GIF, WebP</p>
                                <p className="image-info-text">Рекомендуемый размер: 800×600px</p>
                            </div>
                        </div>
                    </div>

                    {error && activeTab === 'dishes' && (
                        <div className="alert alert-error">
                            <strong>Ошибка:</strong> {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={imageUploading}
                        >
                            {imageUploading ? 'Загрузка...' : (editingDish ? 'Сохранить изменения' : 'Создать блюдо')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsDishModalOpen(false);
                                setError('');
                                setUploadedImage(null);
                            }}
                            className="btn btn-cancel"
                            disabled={imageUploading}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Модальное окно заказа */}
            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => {
                    setIsOrderModalOpen(false);
                    setSelectedOrder(null);
                    setOrderFormData({ status: '' });
                }}
                title={`Заказ #${selectedOrder?.id}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="order-details">
                        <div className="order-summary">
                            <div className="summary-row">
                                <span className="summary-label">ID заказа:</span>
                                <span className="summary-value">#{selectedOrder.id}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Статус:</span>
                                <span className="summary-value">{getStatusBadge(selectedOrder.status)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Клиент:</span>
                                <span className="summary-value">{selectedOrder.customerFullName || 'Не указано'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Телефон:</span>
                                <span className="summary-value">
                  <strong>{selectedOrder.customerTelephone || 'Не указан'}</strong>
                </span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Email:</span>
                                <span className="summary-value">{selectedOrder.customerEmail || 'Не указан'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Адрес доставки:</span>
                                <span className="summary-value">{selectedOrder.deliveryAddress || 'Не указан'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Ресторан:</span>
                                <span className="summary-value">{selectedOrder.restaurantName || getRestaurantNameById(selectedOrder.restaurantId)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Общая сумма:</span>
                                <span className="summary-value">${formatTotalPrice(selectedOrder.totalPrice)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Дата заказа:</span>
                                <span className="summary-value">
                  {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : 'N/A'}
                </span>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="order-items">
                                <h4>Состав заказа:</h4>
                                <table className="items-table">
                                    <thead>
                                    <tr>
                                        <th>Блюдо</th>
                                        <th>Количество</th>
                                        <th>Цена за шт.</th>
                                        <th>Сумма</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>{item.dishName || `Блюдо #${item.dishId}`}</div>
                                                {item.dishDescription && (
                                                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                        {item.dishDescription}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>${formatTotalPrice(item.price)}</td>
                                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                                                ${((item.price || 0) * item.quantity / 100).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', fontWeight: '600' }}>Итого:</td>
                                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                                            ${formatTotalPrice(selectedOrder.totalPrice)}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        {/* Отладочная информация */}
                        <div className="debug-info" style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            fontSize: '0.85rem'
                        }}>
                            <h4 style={{ marginBottom: '10px' }}>Отладочная информация:</h4>
                            <p><strong>ID заказа:</strong> {selectedOrder?.id}</p>
                            <p><strong>Текущий статус:</strong> {selectedOrder?.status}</p>
                            <p><strong>Выбранный статус:</strong> {orderFormData.status}</p>
                            <p><strong>API Endpoint:</strong> PUT /orders/{selectedOrder?.id}/status</p>
                            <p><strong>Request Data:</strong> {JSON.stringify({ status: orderFormData.status })}</p>
                        </div>

                        <form onSubmit={handleOrderStatusSubmit} className="status-form">
                            <div className="form-group">
                                <label>Изменить статус:</label>
                                <select
                                    name="status"
                                    value={orderFormData.status}
                                    onChange={handleOrderFormChange}
                                    className="status-select"
                                >
                                    <option value="">Выберите новый статус</option>
                                    {orderStatuses.map(status => (
                                        <option
                                            key={status}
                                            value={status}
                                            disabled={status === selectedOrder.status}
                                        >
                                            {status} {status === selectedOrder.status ? '(текущий)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <div className="alert alert-error">
                                    <strong>Ошибка:</strong> {error}
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-submit"
                                    disabled={!orderFormData.status || orderFormData.status === selectedOrder.status}
                                >
                                    Обновить статус
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOrderModalOpen(false);
                                        setSelectedOrder(null);
                                        setOrderFormData({ status: '' });
                                    }}
                                    className="btn btn-cancel"
                                >
                                    Закрыть
                                </button>

                                {/* Тестовая кнопка для отладки */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('Тестовый вызов updateOrderStatus...');
                                        handleUpdateOrderStatus(selectedOrder.id, 'DELIVERED');
                                    }}
                                    className="btn"
                                    style={{ backgroundColor: '#6c757d', color: 'white' }}
                                >
                                    Тест (DELIVERED)
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            <style jsx>{`
        .order-details {
          max-height: 70vh;
          overflow-y: auto;
        }

        .order-summary {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          border: 2px solid #000000;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
        }

        .summary-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .summary-label {
          font-weight: 600;
          color: #000000;
          min-width: 150px;
        }

        .summary-value {
          color: #000000;
          text-align: right;
          flex: 1;
        }

        .order-items {
          margin-bottom: 20px;
        }

        .order-items h4 {
          margin-bottom: 15px;
          color: #000000;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          background-color: #ffffff;
          border: 2px solid #000000;
          border-radius: 8px;
          overflow: hidden;
        }

        .items-table th {
          background-color: #000000;
          color: #ffffff;
          padding: 12px 15px;
          text-align: left;
          font-weight: 600;
        }

        .items-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #e0e0e0;
        }

        .items-table tr:last-child td {
          border-bottom: none;
        }

        .items-table tr:hover {
          background-color: #f5f5f5;
        }

        .items-table tfoot {
          background-color: #f8f9fa;
          font-weight: bold;
        }

        .status-form {
          border-top: 2px solid #000000;
          padding-top: 20px;
        }

        .status-select {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #000000;
          border-radius: 8px;
          font-size: 1rem;
          background-color: #ffffff;
          color: #000000;
        }

        .btn-refresh {
          background-color: #000000;
          color: #ffffff;
        }

        .btn-refresh:hover {
          background-color: #333333;
        }

        .btn-retry {
          background-color: #000000;
          color: #ffffff;
        }

        .btn-retry:hover {
          background-color: #333333;
        }

        .btn-view {
          background-color: #ffffff;
        }

        .btn-view:hover {
          background-color: #17a2b8;
          color: #ffffff;
        }

        .api-status {
          padding: 10px 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-weight: 500;
        }

        .api-status.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .api-status.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .api-status.info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .alert-warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .phone-column {
          font-family: monospace;
          color: #000000;
          font-weight: 500;
        }

        .customer-phone {
          background-color: #f8f9fa;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #000000;
          font-weight: 600;
          font-size: 1.1rem;
          display: inline-block;
          margin: 5px 0;
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
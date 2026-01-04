import React, { useState, useEffect, useCallback } from 'react';
import { restaurantApi, dishApi, orderApi, formatErrorMessage } from '../../services/api';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import ImageUploader from '../common/ImageUploader';

// Component for styled pagination
const MobilePagination = ({ currentPage, totalPages, onPageChange, totalElements }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 3; // Maximum number of visible pages on mobile

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage < 2) {
                // Show first 3 pages
                for (let i = 0; i < 3; i++) {
                    pages.push(i);
                }
                if (totalPages > 3) {
                    pages.push('...');
                    pages.push(totalPages - 1);
                }
            } else if (currentPage > totalPages - 3) {
                // Show last 3 pages
                pages.push(0);
                pages.push('...');
                for (let i = totalPages - 3; i < totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show current page and adjacent pages
                pages.push(0);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages - 1);
            }
        }

        return pages;
    };

    return (
        <div className="mobile-pagination">
            <div className="mobile-pagination-controls">
                <button
                    className={`mobile-pagination-btn ${currentPage === 0 ? 'disabled' : ''}`}
                    onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    ← Back
                </button>

                <div className="mobile-pagination-pages">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="mobile-pagination-ellipsis">...</span>
                        ) : (
                            <button
                                key={page}
                                className={`mobile-pagination-page ${currentPage === page ? 'active' : ''}`}
                                onClick={() => onPageChange(page)}
                            >
                                {page + 1}
                            </button>
                        )
                    ))}
                </div>

                <button
                    className={`mobile-pagination-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
                    onClick={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                >
                    Next →
                </button>
            </div>

            <div className="mobile-pagination-info">
                Page {currentPage + 1} of {totalPages} • Total: {totalElements}
            </div>

            <style jsx>{`
                .mobile-pagination {
                    margin-top: 20px;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 12px;
                    border: 2px solid #000000;
                }

                .mobile-pagination-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                }

                .mobile-pagination-btn {
                    padding: 15px 25px;
                    border: 3px solid #000000;
                    border-radius: 10px;
                    background-color: #ffffff;
                    color: #000000;
                    font-size: 1.2rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 140px;
                    text-align: center;
                    font-family: inherit;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .mobile-pagination-btn:hover:not(.disabled) {
                    background-color: #000000;
                    color: #ffffff;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                }

                .mobile-pagination-btn.disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    border-color: #666666;
                    color: #666666;
                    box-shadow: none;
                }

                .mobile-pagination-pages {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .mobile-pagination-page {
                    width: 60px;
                    height: 60px;
                    border: 3px solid #000000;
                    border-radius: 10px;
                    background-color: #ffffff;
                    color: #000000;
                    font-size: 1.3rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: inherit;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .mobile-pagination-page:hover {
                    background-color: #f5f5f5;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                }

                .mobile-pagination-page.active {
                    background-color: #000000;
                    color: #ffffff;
                    transform: scale(1.05);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
                }

                .mobile-pagination-ellipsis {
                    padding: 0 15px;
                    color: #666666;
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .mobile-pagination-info {
                    text-align: center;
                    font-size: 1.1rem;
                    color: #000000;
                    font-weight: 600;
                    padding-top: 15px;
                    border-top: 2px solid #e0e0e0;
                    font-family: inherit;
                    margin-top: 10px;
                }

                @media (max-width: 768px) {
                    .mobile-pagination {
                        padding: 15px;
                        border-width: 2px;
                    }

                    .mobile-pagination-controls {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .mobile-pagination-btn {
                        width: 100%;
                        padding: 18px 20px;
                        font-size: 1.3rem;
                        min-width: auto;
                    }

                    .mobile-pagination-pages {
                        width: 100%;
                        justify-content: center;
                        gap: 8px;
                    }

                    .mobile-pagination-page {
                        width: 55px;
                        height: 55px;
                        font-size: 1.2rem;
                    }

                    .mobile-pagination-ellipsis {
                        font-size: 1.3rem;
                    }

                    .mobile-pagination-info {
                        font-size: 1rem;
                    }
                }

                @media (max-width: 480px) {
                    .mobile-pagination {
                        padding: 12px;
                    }

                    .mobile-pagination-btn {
                        padding: 16px 18px;
                        font-size: 1.2rem;
                        border-width: 2px;
                    }

                    .mobile-pagination-page {
                        width: 50px;
                        height: 50px;
                        font-size: 1.1rem;
                        border-width: 2px;
                    }

                    .mobile-pagination-ellipsis {
                        padding: 0 10px;
                        font-size: 1.2rem;
                    }

                    .mobile-pagination-info {
                        font-size: 0.95rem;
                        padding-top: 12px;
                    }
                }
            `}</style>
        </div>
    );
};

const AdminDashboard = () => {
    // States for restaurants
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantsLoading, setRestaurantsLoading] = useState(true);
    const [restaurantsCurrentPage, setRestaurantsCurrentPage] = useState(0);
    const [restaurantsTotalPages, setRestaurantsTotalPages] = useState(0);
    const [restaurantsTotalElements, setRestaurantsTotalElements] = useState(0);
    const [restaurantsSearchTerm, setRestaurantsSearchTerm] = useState('');

    // States for dishes
    const [dishes, setDishes] = useState([]);
    const [dishesLoading, setDishesLoading] = useState(true);
    const [dishesCurrentPage, setDishesCurrentPage] = useState(0);
    const [dishesTotalPages, setDishesTotalPages] = useState(0);
    const [dishesTotalElements, setDishesTotalElements] = useState(0);
    const [dishesSearchTerm, setDishesSearchTerm] = useState('');

    // States for orders
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(0);
    const [ordersTotalPages, setOrdersTotalPages] = useState(0);
    const [ordersTotalElements, setOrdersTotalElements] = useState(0);
    const [ordersSearchTerm, setOrdersSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [ordersError, setOrdersError] = useState('');

    // Common states
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
    const [isMobileView, setIsMobileView] = useState(false);
    const [allRestaurants, setAllRestaurants] = useState([]); // All restaurants for dropdown

    // Form data
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

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Load all restaurants for dropdown
    useEffect(() => {
        loadAllRestaurantsForDropdown();
    }, []);

    // Load restaurants
    useEffect(() => {
        loadRestaurants();
    }, [restaurantsCurrentPage, restaurantsSearchTerm]);

    // Load dishes
    useEffect(() => {
        if (activeTab === 'dishes') {
            if (selectedRestaurant) {
                loadDishesByRestaurant();
            } else {
                loadAllDishes();
            }
        }
    }, [dishesCurrentPage, dishesSearchTerm, selectedRestaurant, activeTab]);

    // Load orders
    useEffect(() => {
        if (activeTab === 'orders') {
            loadOrders();
        }
    }, [ordersCurrentPage, ordersSearchTerm, activeTab]);

    // Function to load all restaurants for dropdown
    const loadAllRestaurantsForDropdown = useCallback(async () => {
        try {
            const response = await restaurantApi.getAll({
                page: 0,
                size: 100, // Large number to get all restaurants
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setAllRestaurants(response.data.content || []);
        } catch (error) {
            console.error('Error loading restaurants for dropdown:', error);
        }
    }, []);

    // Data loading functions
    const loadRestaurants = useCallback(async () => {
        setRestaurantsLoading(true);
        setError('');
        try {
            const response = await restaurantApi.getAll({
                search: restaurantsSearchTerm || undefined,
                page: restaurantsCurrentPage,
                size: isMobileView ? 5 : 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setRestaurants(response.data.content || []);
            setRestaurantsTotalPages(response.data.totalPages || 1);
            setRestaurantsTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading restaurants:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Failed to load restaurants: ${errorMessage}`);
        } finally {
            setRestaurantsLoading(false);
        }
    }, [restaurantsSearchTerm, restaurantsCurrentPage, isMobileView]);

    const loadAllDishes = useCallback(async () => {
        setDishesLoading(true);
        setError('');
        try {
            const response = await dishApi.getAll({
                search: dishesSearchTerm || undefined,
                page: dishesCurrentPage,
                size: isMobileView ? 5 : 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setDishes(response.data.content || []);
            setDishesTotalPages(response.data.totalPages || 1);
            setDishesTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading dishes:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Failed to load dishes: ${errorMessage}`);
        } finally {
            setDishesLoading(false);
        }
    }, [dishesSearchTerm, dishesCurrentPage, isMobileView]);

    const loadDishesByRestaurant = useCallback(async () => {
        if (!selectedRestaurant) return;

        setDishesLoading(true);
        setError('');
        try {
            const response = await dishApi.getByRestaurant(selectedRestaurant.id, {
                search: dishesSearchTerm || undefined,
                page: dishesCurrentPage,
                size: isMobileView ? 5 : 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setDishes(response.data.content || []);
            setDishesTotalPages(response.data.totalPages || 1);
            setDishesTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading dishes by restaurant:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Failed to load restaurant dishes: ${errorMessage}`);
        } finally {
            setDishesLoading(false);
        }
    }, [selectedRestaurant, dishesSearchTerm, dishesCurrentPage, isMobileView]);

    const loadOrders = useCallback(async () => {
        setOrdersLoading(true);
        setOrdersError('');
        setApiStatus('');

        try {
            console.log('Loading orders via API...');
            const response = await orderApi.getAllOrders();
            console.log('Order server response:', response.data);

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

            console.log(`Loaded ${ordersData.length} orders from DB`);
            setApiStatus(`Loaded ${ordersData.length} orders from database`);

            // Sort orders by creation date
            ordersData.sort((a, b) => {
                const dateA = new Date(a.orderDate || a.createdAt || a.date || 0);
                const dateB = new Date(b.orderDate || b.createdAt || b.date || 0);
                return dateB - dateA;
            });

            // Search filtering
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
            console.error('Error loading orders:', error);
            const errorMessage = formatErrorMessage(error);
            setOrdersError(`Failed to load orders: ${errorMessage}`);
            setOrders([]);
            setOrdersTotalPages(1);
            setOrdersTotalElements(0);
            setApiStatus('Error connecting to order server');
        } finally {
            setOrdersLoading(false);
        }
    }, [ordersSearchTerm]);

    const handleViewOrderDetails = useCallback(async (order) => {
        try {
            console.log(`Loading order details #${order.id}...`);
            const response = await orderApi.getOrderById(order.id);
            console.log('Order details loaded:', response.data);

            if (response.data) {
                setSelectedOrder(response.data);
                setOrderFormData({ status: response.data.status || '' });
                setIsOrderModalOpen(true);
            } else {
                setSelectedOrder(order);
                setOrderFormData({ status: order.status || '' });
                setIsOrderModalOpen(true);
                setError('Failed to load full order data');
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            setSelectedOrder(order);
            setOrderFormData({ status: order.status || '' });
            setIsOrderModalOpen(true);
            setError('Failed to load full order data');
        }
    }, []);

    const handleUpdateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            console.log(`Updating order #${orderId} status to ${newStatus}`);

            const orderData = {
                status: newStatus
            };

            console.log('Update data:', orderData);
            const response = await orderApi.updateOrderStatus(orderId, newStatus);
            console.log('Server response when updating status:', response.data);

            if (response.data) {
                alert(`Order #${orderId} status successfully changed to: ${newStatus}`);

                setOrders(prevOrders => {
                    const updatedOrders = prevOrders.map(order =>
                        order.id === orderId ? {
                            ...order,
                            status: newStatus
                        } : order
                    );

                    updatedOrders.sort((a, b) => {
                        const dateA = new Date(a.orderDate || a.createdAt || a.date || 0);
                        const dateB = new Date(b.orderDate || b.createdAt || b.date || 0);
                        return dateB - dateA;
                    });

                    return updatedOrders;
                });

                if (selectedOrder && selectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({
                        ...prev,
                        status: newStatus
                    }));
                }

                if (isOrderModalOpen) {
                    setIsOrderModalOpen(false);
                    setOrderFormData({ status: '' });
                }

                setTimeout(() => {
                    loadOrders();
                }, 1000);
            }

        } catch (error) {
            console.error('Error updating status:', error);
            console.error('Error details:', {
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            let errorMessage = formatErrorMessage(error);

            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    if (error.response.data.error) {
                        errorMessage = error.response.data.error;
                    }
                    if (error.response.data.message) {
                        errorMessage = error.response.data.message;
                    }
                    if (error.response.data.details) {
                        errorMessage += `\nDetails: ${error.response.data.details}`;
                    }
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }

            alert(`Failed to update order #${orderId} status:\n${errorMessage}`);

            if (error.response?.data) {
                console.error('Error data:', error.response.data);
            }
        }
    }, [selectedOrder, isOrderModalOpen, loadOrders]);

    // Test connection to orders server
    const testOrderConnection = useCallback(async () => {
        setIsTestingConnection(true);
        setOrdersError('');
        setApiStatus('Testing connection...');

        try {
            try {
                const ordersResponse = await orderApi.getAllOrders();
                console.log('Orders response:', ordersResponse.data);
                setApiStatus(`Connection established! Received ${ordersResponse.data?.length || 0} orders`);
            } catch (serverError) {
                console.warn('Server is available but failed to get data:', serverError.message);
                setApiStatus('Connection established, but order server returned an error');
            }

        } catch (error) {
            console.error('Testing error:', error);
            setApiStatus('Connection error.');
            setOrdersError(formatErrorMessage(error));
        } finally {
            setIsTestingConnection(false);
        }
    }, []);

    // Search
    const handleRestaurantSearch = useCallback((term) => {
        setRestaurantsSearchTerm(term);
        setRestaurantsCurrentPage(0);
    }, []);

    const handleDishSearch = useCallback((term) => {
        setDishesSearchTerm(term);
        setDishesCurrentPage(0);
    }, []);

    const handleOrderSearch = useCallback((term) => {
        setOrdersSearchTerm(term);
        setOrdersCurrentPage(0);

        if (orders.length > 0) {
            const filtered = orders.filter(order =>
                (order.id && order.id.toString().includes(term)) ||
                (order.status && order.status.toLowerCase().includes(term.toLowerCase())) ||
                (order.customerTelephone && order.customerTelephone.includes(term)) ||
                (order.customerFullName && order.customerFullName.toLowerCase().includes(term.toLowerCase())) ||
                (order.restaurantName && order.restaurantName.toLowerCase().includes(term.toLowerCase()))
            );

            filtered.sort((a, b) => {
                const dateA = new Date(a.orderDate || a.createdAt || a.date || 0);
                const dateB = new Date(b.orderDate || b.createdAt || b.date || 0);
                return dateB - dateA;
            });

            setOrders(filtered);
            setOrdersTotalElements(filtered.length);
        } else {
            loadOrders();
        }
    }, [orders, loadOrders]);

    // Restaurants CRUD
    const handleCreateRestaurant = useCallback(() => {
        setEditingRestaurant(null);
        setRestaurantFormData({ name: '', cuisine: '', address: '' });
        setIsRestaurantModalOpen(true);
    }, []);

    const handleEditRestaurant = useCallback((restaurant) => {
        setEditingRestaurant(restaurant);
        setRestaurantFormData({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            address: restaurant.address
        });
        setIsRestaurantModalOpen(true);
    }, []);

    const handleDeleteRestaurant = useCallback(async (id, name) => {
        if (window.confirm(`Are you sure you want to delete restaurant "${name}"?`)) {
            try {
                await restaurantApi.delete(id);
                alert('Restaurant successfully deleted');
                loadRestaurants();
                loadAllRestaurantsForDropdown(); // Update dropdown list
                if (selectedRestaurant?.id === id) {
                    setSelectedRestaurant(null);
                }
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Failed to delete restaurant: ${errorMessage}`);
            }
        }
    }, [loadRestaurants, selectedRestaurant, loadAllRestaurantsForDropdown]);

    // Dishes CRUD
    const handleCreateDish = useCallback(() => {
        if (!selectedRestaurant && activeTab === 'dishes') {
            alert('Please select a restaurant to add a dish');
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
    }, [selectedRestaurant, activeTab]);

    const handleEditDish = useCallback((dish) => {
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
    }, []);

    const handleDeleteDish = useCallback(async (id, name) => {
        if (window.confirm(`Are you sure you want to delete dish "${name}"?`)) {
            try {
                await dishApi.delete(id);
                alert('Dish successfully deleted');
                if (selectedRestaurant) {
                    loadDishesByRestaurant();
                } else {
                    loadAllDishes();
                }
            } catch (error) {
                console.error('Error deleting dish:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Failed to delete dish: ${errorMessage}`);
            }
        }
    }, [selectedRestaurant, loadDishesByRestaurant, loadAllDishes]);

    // Orders CRUD
    const handleCancelOrder = useCallback(async (orderId) => {
        if (window.confirm(`Are you sure you want to cancel order #${orderId}?`)) {
            try {
                const order = orders.find(o => o.id === orderId);
                if (!order) {
                    alert('Order not found');
                    return;
                }

                if (order.status === 'CANCELLED') {
                    alert('Order is already cancelled');
                    return;
                }

                if (order.status === 'DELIVERED') {
                    alert('Cannot cancel a delivered order');
                    return;
                }

                await handleUpdateOrderStatus(orderId, 'CANCELLED');
            } catch (error) {
                console.error('Error cancelling order:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Failed to cancel order: ${errorMessage}`);
            }
        }
    }, [orders, handleUpdateOrderStatus]);

    // Handle dish images
    const handleImageUpload = useCallback(async (file) => {
        setImageUploading(true);
        setError('');

        try {
            console.log('Uploading image:', file.name, file.size, file.type);

            if (file.size > 10 * 1024 * 1024) {
                throw new Error('File size should not exceed 10MB');
            }

            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                throw new Error('Only images are supported (JPEG, PNG, GIF, WebP)');
            }

            if (!editingDish) {
                setUploadedImage(file);
                return Promise.resolve();
            }

            console.log('Uploading image for existing dish:', editingDish.id);
            const response = await dishApi.uploadImage(editingDish.id, file);
            console.log('Image upload response:', response.data);

            const imageUrl = response.data?.imageUrl || response.data?.fileDownloadUri;
            if (imageUrl) {
                setDishFormData(prev => ({ ...prev, imageUrl }));
            }

            setUploadedImage(null);
            return Promise.resolve();
        } catch (error) {
            console.error('Image upload error:', error);
            const errorMessage = error.message || formatErrorMessage(error);
            setError(`Image upload error: ${errorMessage}`);
            return Promise.reject(error);
        } finally {
            setImageUploading(false);
        }
    }, [editingDish]);

    const handleImageDelete = useCallback(async () => {
        if (!editingDish) {
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
            setError(`Image deletion error: ${errorMessage}`);
            return Promise.reject(error);
        }
    }, [editingDish]);

    // Save forms
    const handleRestaurantSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!restaurantFormData.name.trim()) {
                throw new Error('Restaurant name is required');
            }
            if (!restaurantFormData.cuisine.trim()) {
                throw new Error('Cuisine type is required');
            }
            if (!restaurantFormData.address.trim()) {
                throw new Error('Address is required');
            }

            const restaurantData = {
                name: restaurantFormData.name.trim(),
                cuisine: restaurantFormData.cuisine.trim(),
                address: restaurantFormData.address.trim()
            };

            console.log('Submitting restaurant data:', restaurantData);

            if (editingRestaurant) {
                await restaurantApi.update(editingRestaurant.id, restaurantData);
                alert('Restaurant successfully updated');
            } else {
                await restaurantApi.create(restaurantData);
                alert('Restaurant successfully created');
            }

            setIsRestaurantModalOpen(false);
            loadRestaurants();
            loadAllRestaurantsForDropdown(); // Update dropdown list
        } catch (error) {
            console.error('Error saving restaurant:', error);
            let errorMessage = formatErrorMessage(error);
            setError(errorMessage);
        }
    }, [restaurantFormData, editingRestaurant, loadRestaurants, loadAllRestaurantsForDropdown]);

    const handleDishSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log('Submitting dish form:', dishFormData);
            console.log('Uploaded image:', uploadedImage);

            if (!dishFormData.restaurantId) {
                throw new Error('Select a restaurant for the dish');
            }

            if (!dishFormData.name.trim()) {
                throw new Error('Dish name is required');
            }

            const price = parseFloat(dishFormData.price);
            if (isNaN(price) || price <= 0) {
                throw new Error('Enter a valid price (greater than 0)');
            }

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
                console.log('Updating dish...');
                const response = await dishApi.update(editingDish.id, dishData);
                savedDish = response.data;
                console.log('Dish updated:', savedDish);

                if (uploadedImage) {
                    try {
                        console.log('Uploading image for updated dish...');
                        await dishApi.uploadImage(editingDish.id, uploadedImage);
                    } catch (imgError) {
                        console.warn('Failed to upload image:', imgError);
                    }
                }

                alert('Dish successfully updated');
            } else {
                console.log('Creating new dish...');
                const response = await dishApi.create(dishData);
                savedDish = response.data;
                console.log('Dish created:', savedDish);

                if (uploadedImage && savedDish?.id) {
                    try {
                        console.log('Uploading image for new dish...');
                        await dishApi.uploadImage(savedDish.id, uploadedImage);
                    } catch (imgError) {
                        console.warn('Failed to upload image for new dish:', imgError);
                        alert('Dish created, but there was an error uploading the image');
                    }
                }

                alert('Dish successfully created');
            }

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

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            if (error.message && (
                error.message.includes('Select') ||
                error.message.includes('required') ||
                error.message.includes('valid')
            )) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        }
    }, [dishFormData, uploadedImage, editingDish, selectedRestaurant, loadDishesByRestaurant, loadAllDishes]);

    const handleOrderStatusSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (!selectedOrder || !orderFormData.status) {
                throw new Error('Select a new status');
            }

            if (orderFormData.status === selectedOrder.status) {
                setError('Status is already set to this value');
                return;
            }

            console.log(`Submitting status update for order #${selectedOrder.id}: ${orderFormData.status}`);

            await handleUpdateOrderStatus(selectedOrder.id, orderFormData.status);
            setIsOrderModalOpen(false);
            setSelectedOrder(null);
            setOrderFormData({ status: '' });

        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.message || formatErrorMessage(error));
        }
    }, [selectedOrder, orderFormData.status, handleUpdateOrderStatus]);

    // Form change handlers
    const handleRestaurantFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setRestaurantFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleDishFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setDishFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleOrderFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setOrderFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // Select restaurant for dishes via dropdown
    const handleSelectRestaurantForDishes = useCallback((restaurant) => {
        setSelectedRestaurant(restaurant);
        setDishesCurrentPage(0);
        setDishesSearchTerm('');
    }, []);

    const handleClearRestaurantSelection = useCallback(() => {
        setSelectedRestaurant(null);
        setDishesCurrentPage(0);
        setDishesSearchTerm('');
    }, []);

    // Order statuses
    const orderStatuses = [
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED'
    ];

    const getStatusBadge = useCallback((status) => {
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
                    padding: isMobileView ? '3px 6px' : '4px 8px',
                    borderRadius: '4px',
                    fontSize: isMobileView ? '0.7rem' : '0.85rem',
                    fontWeight: '500',
                    display: 'inline-block',
                    whiteSpace: 'nowrap'
                }}
            >
                {status}
            </span>
        );
    }, [isMobileView]);

    // Statistics
    const getStats = useCallback(() => {
        const totalRestaurants = restaurantsTotalElements;
        const totalDishes = dishesTotalElements;
        const totalOrders = ordersTotalElements;

        return {
            totalRestaurants,
            totalDishes,
            totalOrders,
        };
    }, [restaurantsTotalElements, dishesTotalElements, ordersTotalElements]);

    const stats = getStats();

    const getRestaurantNameById = useCallback((restaurantId) => {
        if (!restaurantId) return 'Not specified';

        const restaurant = allRestaurants.find(r => r.id === restaurantId);
        return restaurant ? restaurant.name : `ID: ${restaurantId}`;
    }, [allRestaurants]);

    const formatTotalPrice = useCallback((price) => {
        if (price === undefined || price === null) return '0.00';
        const priceInRubles = price / 100;
        return priceInRubles.toFixed(2);
    }, []);

    // Mobile table row rendering
    const renderMobileRestaurantRow = useCallback((restaurant) => (
        <div key={restaurant.id} className="mobile-table-row">
            <div className="mobile-row-header">
                <div>
                    <strong className="mobile-row-title">{restaurant.name}</strong>
                    <div className="mobile-row-subtitle">ID: {restaurant.id}</div>
                </div>
                <button
                    className="btn-select"
                    onClick={() => {
                        handleSelectRestaurantForDishes(restaurant);
                        setActiveTab('dishes');
                    }}
                    title="Manage this restaurant's dishes"
                >
                    👁️ Dishes
                </button>
            </div>

            <div className="mobile-row-content">
                <div className="mobile-row-item">
                    <strong>Cuisine:</strong> <span className="badge">{restaurant.cuisine}</span>
                </div>
                <div className="mobile-row-item">
                    <strong>Address:</strong> {restaurant.address}
                </div>
            </div>

            <div className="mobile-action-buttons">
                <button
                    onClick={() => handleEditRestaurant(restaurant)}
                    className="btn-action btn-edit"
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                    className="btn-action btn-delete"
                >
                    🗑️ Delete
                </button>
            </div>
        </div>
    ), [handleSelectRestaurantForDishes, handleEditRestaurant, handleDeleteRestaurant]);

    const renderMobileDishRow = useCallback((dish) => (
        <div key={dish.id} className="mobile-table-row">
            <div className="mobile-row-header">
                <div>
                    <strong className="mobile-row-title">{dish.name}</strong>
                    <div className="mobile-row-subtitle">ID: {dish.id}</div>
                </div>
                {dish.imageUrl && (
                    <div className="image-indicator">
                        📷
                    </div>
                )}
            </div>

            <div className="mobile-row-content">
                <div className="mobile-row-item">
                    <strong>Description:</strong> {dish.description || '---'}
                </div>
                <div className="mobile-row-item">
                    <strong>Price:</strong> ${parseFloat(dish.price).toFixed(2)}
                </div>
                <div className="mobile-row-item">
                    <strong>Restaurant:</strong> {dish.restaurantName || 'Unknown'}
                </div>
            </div>

            <div className="mobile-action-buttons">
                <button
                    onClick={() => handleEditDish(dish)}
                    className="btn-action btn-edit"
                >
                    ✏️ Edit
                </button>
                <button
                    onClick={() => handleDeleteDish(dish.id, dish.name)}
                    className="btn-action btn-delete"
                >
                    🗑️ Delete
                </button>
            </div>
        </div>
    ), [handleEditDish, handleDeleteDish]);

    const renderMobileOrderRow = useCallback((order) => (
        <div key={order.id} className="mobile-table-row">
            <div className="mobile-row-header">
                <div>
                    <strong className="mobile-row-title">Order #{order.id}</strong>
                    <div className="mobile-row-subtitle">
                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                    </div>
                </div>
                {getStatusBadge(order.status)}
            </div>

            <div className="mobile-row-content">
                <div className="mobile-row-item">
                    <strong>Customer:</strong> {order.customerFullName || 'Not specified'}
                </div>
                <div className="mobile-row-item">
                    <strong>Phone:</strong> {order.customerTelephone || 'Not specified'}
                </div>
                <div className="mobile-row-item">
                    <strong>Restaurant:</strong> {order.restaurantName || getRestaurantNameById(order.restaurantId)}
                </div>
                <div className="mobile-row-item">
                    <strong>Total:</strong> ${formatTotalPrice(order.totalPrice)}
                </div>
            </div>

            <div className="mobile-action-buttons">
                <button
                    onClick={() => handleViewOrderDetails(order)}
                    className="btn-action btn-view"
                >
                    👁️ Details
                </button>
                <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="btn-action btn-delete"
                    disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                >
                    🗑️ Cancel
                </button>
            </div>
        </div>
    ), [getStatusBadge, getRestaurantNameById, formatTotalPrice, handleViewOrderDetails, handleCancelOrder]);

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">🍽️ Admin Panel</h1>
                <div className="dashboard-stats">
                    <div className="stat-item">
                        <span className="stat-label">Restaurants:</span>
                        <span className="stat-value">{stats.totalRestaurants}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Dishes:</span>
                        <span className="stat-value">{stats.totalDishes}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Orders:</span>
                        <span className="stat-value">{stats.totalOrders}</span>
                    </div>
                    {selectedRestaurant && (
                        <div className="stat-item">
                            <span className="stat-label">Selected restaurant:</span>
                            <span className="stat-value">{selectedRestaurant.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('restaurants')}
                >
                    🏪 Restaurants
                </button>
                <button
                    className={`tab-btn ${activeTab === 'dishes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dishes')}
                >
                    🍽️ Dishes
                </button>
                <button
                    className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    📋 Orders
                </button>
            </div>

            {activeTab === 'restaurants' && (
                <div className="tab-content">
                    <div className="section-header">
                        <div className="section-actions">
                            <SearchBar
                                onSearch={handleRestaurantSearch}
                                placeholder="Search restaurants by name or address..."
                            />
                            <button
                                onClick={handleCreateRestaurant}
                                className="btn btn-create"
                            >
                                + Add Restaurant
                            </button>
                        </div>
                    </div>

                    {restaurantsLoading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Loading restaurants...</p>
                        </div>
                    ) : (
                        <>
                            {isMobileView ? (
                                <div className="mobile-table-view">
                                    {restaurants.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-icon">🏪</div>
                                            <h3>No restaurants found</h3>
                                            <p>Add the first restaurant</p>
                                        </div>
                                    ) : (
                                        restaurants.map(renderMobileRestaurantRow)
                                    )}
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Cuisine</th>
                                            <th>Address</th>
                                            <th style={{ width: '200px' }}>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {restaurants.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="empty-cell">
                                                    <div className="empty-state">
                                                        <div className="empty-icon">🏪</div>
                                                        <h3>No restaurants found</h3>
                                                        <p>Add the first restaurant</p>
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
                                                            title="Manage this restaurant's dishes"
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
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                                                                className="btn-action btn-delete"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* RESTAURANTS PAGINATION */}
                            {restaurants.length > 0 && restaurantsTotalPages > 1 && (
                                <div className="pagination-section">
                                    {isMobileView ? (
                                        <MobilePagination
                                            currentPage={restaurantsCurrentPage}
                                            totalPages={restaurantsTotalPages}
                                            onPageChange={setRestaurantsCurrentPage}
                                            totalElements={restaurantsTotalElements}
                                        />
                                    ) : (
                                        <Pagination
                                            currentPage={restaurantsCurrentPage}
                                            totalPages={restaurantsTotalPages}
                                            totalElements={restaurantsTotalElements}
                                            onPageChange={setRestaurantsCurrentPage}
                                            itemsPerPage={isMobileView ? 5 : 10}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'dishes' && (
                <div className="tab-content">
                    <div className="section-header">
                        <div className="section-title-area">
                            <h2 className="section-title">Dish Management</h2>
                            {selectedRestaurant && (
                                <div className="selected-restaurant">
                                    <span>Selected restaurant: </span>
                                    <strong>{selectedRestaurant.name}</strong>
                                    <button
                                        onClick={handleClearRestaurantSelection}
                                        className="btn btn-clear"
                                        title="Show all dishes"
                                    >
                                        ❌ Clear selection
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="section-actions">
                            <SearchBar
                                onSearch={handleDishSearch}
                                placeholder={selectedRestaurant
                                    ? `Search dishes in "${selectedRestaurant.name}"...`
                                    : "Search all dishes..."
                                }
                            />
                            <button
                                onClick={handleCreateDish}
                                className="btn btn-create"
                                disabled={!selectedRestaurant}
                            >
                                + Add Dish
                            </button>
                        </div>
                    </div>

                    {/* RESTAURANT FILTER - DROPDOWN */}
                    <div className="restaurant-filter-dropdown">
                        <div className="filter-dropdown-header">
                            <h3>Restaurant filter:</h3>
                            <p className="filter-dropdown-subtitle">Select a restaurant to manage its dishes</p>
                        </div>
                        <div className="filter-dropdown-wrapper">
                            <select
                                value={selectedRestaurant?.id || ''}
                                onChange={(e) => {
                                    const restaurantId = e.target.value;
                                    if (restaurantId === '') {
                                        handleClearRestaurantSelection();
                                    } else {
                                        const restaurant = allRestaurants.find(r => r.id === parseInt(restaurantId, 10));
                                        if (restaurant) {
                                            handleSelectRestaurantForDishes(restaurant);
                                        }
                                    }
                                }}
                                className="restaurant-dropdown-select"
                            >
                                <option value="">All restaurants (show all dishes)</option>
                                {allRestaurants.length === 0 ? (
                                    <option value="" disabled>No restaurants available</option>
                                ) : (
                                    allRestaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name} ({restaurant.cuisine})
                                        </option>
                                    ))
                                )}
                            </select>
                            {selectedRestaurant && (
                                <div className="selected-restaurant-info">
                                    <span className="selected-restaurant-label">Selected:</span>
                                    <span className="selected-restaurant-name">{selectedRestaurant.name}</span>
                                    <button
                                        onClick={handleClearRestaurantSelection}
                                        className="btn btn-clear-small"
                                        title="Clear selection"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {dishesLoading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Loading dishes...</p>
                        </div>
                    ) : (
                        <>
                            {isMobileView ? (
                                <div className="mobile-table-view">
                                    {dishes.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-icon">🍽️</div>
                                            <h3>No dishes found</h3>
                                            <p>{selectedRestaurant
                                                ? `Restaurant "${selectedRestaurant.name}" has no dishes yet`
                                                : 'Select a restaurant to see its dishes'
                                            }</p>
                                        </div>
                                    ) : (
                                        dishes.map(renderMobileDishRow)
                                    )}
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Restaurant</th>
                                            <th>Image</th>
                                            <th style={{ width: '200px' }}>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {dishes.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="empty-cell">
                                                    <div className="empty-state">
                                                        <div className="empty-icon">🍽️</div>
                                                        <h3>No dishes found</h3>
                                                        <p>{selectedRestaurant
                                                            ? `Restaurant "${selectedRestaurant.name}" has no dishes yet`
                                                            : 'Select a restaurant from the dropdown above to see its dishes'
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
                                                        {dish.restaurantName || 'Unknown'}
                                                    </td>
                                                    <td>
                                                        {dish.imageUrl ? (
                                                            <div className="image-indicator">
                                                                📷 Available
                                                            </div>
                                                        ) : (
                                                            <span className="no-image">None</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleEditDish(dish)}
                                                                className="btn-action btn-edit"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDish(dish.id, dish.name)}
                                                                className="btn-action btn-delete"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {dishes.length > 0 && dishesTotalPages > 1 && (
                                <div className="pagination-section">
                                    {isMobileView ? (
                                        <MobilePagination
                                            currentPage={dishesCurrentPage}
                                            totalPages={dishesTotalPages}
                                            onPageChange={setDishesCurrentPage}
                                            totalElements={dishesTotalElements}
                                        />
                                    ) : (
                                        <Pagination
                                            currentPage={dishesCurrentPage}
                                            totalPages={dishesTotalPages}
                                            totalElements={dishesTotalElements}
                                            onPageChange={setDishesCurrentPage}
                                            itemsPerPage={isMobileView ? 5 : 10}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="tab-content">
                    <div className="section-header">
                        <div className="section-actions">
                            <SearchBar
                                onSearch={handleOrderSearch}
                                placeholder="Search orders by ID, status, phone, or name..."
                            />
                            <div className="order-actions">
                                <button
                                    onClick={loadOrders}
                                    className="btn btn-refresh"
                                    disabled={ordersLoading || isTestingConnection}
                                >
                                    {ordersLoading ? '🔄 Loading...' : '🔄 Refresh'}
                                </button>
                                <button
                                    onClick={testOrderConnection}
                                    className="btn btn-test"
                                    disabled={isTestingConnection}
                                >
                                    {isTestingConnection ? '🔍 Testing...' : '🔍 Test connection'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {apiStatus && (
                        <div className={`api-status ${apiStatus.includes('✅') ?
                            'success' : apiStatus.includes('❌') ? 'error' : 'info'}`}>
                            {apiStatus}
                        </div>
                    )}

                    {ordersError && (
                        <div className="alert alert-warning">
                            <strong>Warning:</strong> {ordersError}
                        </div>
                    )}

                    {ordersLoading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Loading orders...</p>
                            <p className="loading-subtitle">Trying to connect to order server...</p>
                        </div>
                    ) : (
                        <>
                            {isMobileView ? (
                                <div className="mobile-table-view">
                                    {orders.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-icon">📋</div>
                                            <h3>No orders found</h3>
                                            <p>No orders yet or there was an error loading them</p>
                                            <div className="error-actions">
                                                <button
                                                    onClick={loadOrders}
                                                    className="btn btn-retry"
                                                >
                                                    🔄 Try again
                                                </button>
                                                <button
                                                    onClick={testOrderConnection}
                                                    className="btn btn-test"
                                                >
                                                    🔍 Test connection
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        orders.map(renderMobileOrderRow)
                                    )}
                                </div>
                            ) : (
                                <div className="table-container">
                                    <table className="admin-table">
                                        <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Phone</th>
                                            <th>Restaurant</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                            <th>Order Date</th>
                                            <th style={{ width: '220px' }}>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="empty-cell">
                                                    <div className="empty-state">
                                                        <div className="empty-icon">📋</div>
                                                        <h3>No orders found</h3>
                                                        <p>No orders yet or there was an error loading them</p>
                                                        <div className="error-actions">
                                                            <button
                                                                onClick={loadOrders}
                                                                className="btn btn-retry"
                                                            >
                                                                🔄 Try again
                                                            </button>
                                                            <button
                                                                onClick={testOrderConnection}
                                                                className="btn btn-test"
                                                            >
                                                                🔍 Test connection
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
                                                        <div className="customer-name">{order.customerFullName || 'Not specified'}</div>
                                                    </td>
                                                    <td className="phone-column">
                                                        <div className="customer-phone">{order.customerTelephone || 'Not specified'}</div>
                                                    </td>
                                                    <td>
                                                        <div className="restaurant-name">
                                                            {order.restaurantName || getRestaurantNameById(order.restaurantId)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(order.status)}
                                                    </td>
                                                    <td className="price">
                                                        ${formatTotalPrice(order.totalPrice)}
                                                    </td>
                                                    <td className="order-date">
                                                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleViewOrderDetails(order)}
                                                                className="btn-action btn-view"
                                                            >
                                                                👁️ Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelOrder(order.id)}
                                                                className="btn-action btn-delete"
                                                                disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                                            >
                                                                🗑️ Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {orders.length > 0 && ordersTotalPages > 1 && (
                                <div className="pagination-section">
                                    {isMobileView ? (
                                        <MobilePagination
                                            currentPage={ordersCurrentPage}
                                            totalPages={ordersTotalPages}
                                            onPageChange={setOrdersCurrentPage}
                                            totalElements={ordersTotalElements}
                                        />
                                    ) : (
                                        <Pagination
                                            currentPage={ordersCurrentPage}
                                            totalPages={ordersTotalPages}
                                            totalElements={ordersTotalElements}
                                            onPageChange={setOrdersCurrentPage}
                                            itemsPerPage={isMobileView ? 5 : 10}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <Modal
                isOpen={isRestaurantModalOpen}
                onClose={() => setIsRestaurantModalOpen(false)}
                title={editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
            >
                <form onSubmit={handleRestaurantSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Restaurant Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={restaurantFormData.name}
                            onChange={handleRestaurantFormChange}
                            required
                            minLength="2"
                            maxLength="100"
                            placeholder="Enter restaurant name"
                        />
                    </div>

                    <div className="form-group">
                        <label>Cuisine Type *</label>
                        <input
                            type="text"
                            name="cuisine"
                            value={restaurantFormData.cuisine}
                            onChange={handleRestaurantFormChange}
                            required
                            minLength="2"
                            maxLength="50"
                            placeholder="e.g., Italian, Japanese"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address *</label>
                        <textarea
                            name="address"
                            value={restaurantFormData.address}
                            onChange={handleRestaurantFormChange}
                            required
                            minLength="5"
                            maxLength="255"
                            rows="3"
                            placeholder="Full restaurant address"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-submit">
                            {editingRestaurant ? 'Save Changes' : 'Create Restaurant'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRestaurantModalOpen(false)}
                            className="btn btn-cancel"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isDishModalOpen}
                onClose={() => {
                    setIsDishModalOpen(false);
                    setError('');
                    setUploadedImage(null);
                }}
                title={editingDish ? 'Edit Dish' : 'Add Dish'}
            >
                <form onSubmit={handleDishSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Dish Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={dishFormData.name}
                                    onChange={handleDishFormChange}
                                    required
                                    minLength="2"
                                    maxLength="100"
                                    placeholder="Enter dish name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={dishFormData.description}
                                    onChange={handleDishFormChange}
                                    maxLength="500"
                                    rows="3"
                                    placeholder="Dish description (optional)"
                                />
                            </div>

                            <div className="form-group">
                                <label>Price *</label>
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
                                <label>Restaurant *</label>
                                <select
                                    name="restaurantId"
                                    value={dishFormData.restaurantId}
                                    onChange={handleDishFormChange}
                                    required
                                    disabled={!!selectedRestaurant}
                                >
                                    <option value="">Select restaurant</option>
                                    {allRestaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name}
                                        </option>
                                    ))}
                                </select>
                                {selectedRestaurant && (
                                    <p className="form-hint">Restaurant selected from list: {selectedRestaurant.name}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Image URL (optional)</label>
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
                                label="Or upload an image"
                                maxSizeMB={10}
                            />
                            <div className="image-info">
                                <p className="image-info-text">Maximum size: 10MB</p>
                                <p className="image-info-text">Formats: JPG, PNG, GIF, WebP</p>
                                <p className="image-info-text">Recommended size: 800×600px</p>
                            </div>
                        </div>
                    </div>

                    {error && activeTab === 'dishes' && (
                        <div className="alert alert-error">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={imageUploading}
                        >
                            {imageUploading ? 'Uploading...' : (editingDish ? 'Save Changes' : 'Create Dish')}
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
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => {
                    setIsOrderModalOpen(false);
                    setSelectedOrder(null);
                    setOrderFormData({ status: '' });
                }}
                title={`Order #${selectedOrder?.id}`}
                size="lg"
            >
                {selectedOrder && (
                    <div className="order-details">
                        <div className="order-summary">
                            <div className="summary-row">
                                <span className="summary-label">Order ID:</span>
                                <span className="summary-value">#{selectedOrder.id}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Status:</span>
                                <span className="summary-value">{getStatusBadge(selectedOrder.status)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Customer:</span>
                                <span className="summary-value">{selectedOrder.customerFullName || 'Not specified'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Phone:</span>
                                <span className="summary-value">
                                    <strong>{selectedOrder.customerTelephone || 'Not specified'}</strong>
                                </span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Email:</span>
                                <span className="summary-value">{selectedOrder.customerEmail || 'Not specified'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Delivery Address:</span>
                                <span className="summary-value">{selectedOrder.deliveryAddress || 'Not specified'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Restaurant:</span>
                                <span className="summary-value">{selectedOrder.restaurantName || getRestaurantNameById(selectedOrder.restaurantId)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Total Amount:</span>
                                <span className="summary-value">${formatTotalPrice(selectedOrder.totalPrice)}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Order Date:</span>
                                <span className="summary-value">
                                    {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {selectedOrder.items && selectedOrder.items.length > 0 && (
                            <div className="order-items">
                                <h4>Order Contents:</h4>
                                <table className="items-table">
                                    <thead>
                                    <tr>
                                        <th>Dish</th>
                                        <th>Quantity</th>
                                        <th>Price per item</th>
                                        <th>Amount</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {selectedOrder.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="item-name">{item.dishName || `Dish #${item.dishId}`}</div>
                                                {item.dishDescription && (
                                                    <div className="item-description">
                                                        {item.dishDescription}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="item-quantity">{item.quantity}</td>
                                            <td className="item-price">${formatTotalPrice(item.price)}</td>
                                            <td className="item-total">
                                                ${((item.price || 0) * item.quantity / 100).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan="3" className="total-label">Total:</td>
                                        <td className="total-value">
                                            ${formatTotalPrice(selectedOrder.totalPrice)}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}

                        <form onSubmit={handleOrderStatusSubmit} className="status-form">
                            <div className="form-group">
                                <label>Change Status:</label>
                                <select
                                    name="status"
                                    value={orderFormData.status}
                                    onChange={handleOrderFormChange}
                                    className="status-select"
                                >
                                    <option value="">Select a new status</option>
                                    {orderStatuses.map(status => (
                                        <option
                                            key={status}
                                            value={status}
                                            disabled={status === selectedOrder.status}
                                        >
                                            {status} {status === selectedOrder.status ? '(current)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <div className="alert alert-error">
                                    <strong>Error:</strong> {error}
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-submit"
                                    disabled={!orderFormData.status || orderFormData.status === selectedOrder.status}
                                >
                                    Update Status
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
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .admin-dashboard {
                    background-color: #ffffff;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    padding: 30px;
                    margin: 20px 0;
                    min-height: calc(100vh - 100px);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }

                * {
                    font-family: inherit;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #000000;
                }

                .dashboard-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #000000;
                }

                .dashboard-stats {
                    display: flex;
                    gap: 20px;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 10px 15px;
                    background-color: #f5f5f5;
                    border: 1px solid #000000;
                    border-radius: 8px;
                    min-width: 100px;
                }

                .stat-label {
                    font-size: 0.8rem;
                    color: #666666;
                    margin-bottom: 5px;
                }

                .stat-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #000000;
                }

                .dashboard-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #000000;
                    padding-bottom: 10px;
                    overflow-x: auto;
                    white-space: nowrap;
                }

                .tab-btn {
                    padding: 12px 24px;
                    border: 2px solid #000000;
                    border-radius: 8px 8px 0 0;
                    background-color: #ffffff;
                    color: #000000;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-bottom: none;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    font-family: inherit;
                }

                .tab-btn:hover {
                    background-color: #f5f5f5;
                }

                .tab-btn.active {
                    background-color: #000000;
                    color: #ffffff;
                    position: relative;
                }

                .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background-color: #000000;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .section-title-area {
                    flex: 1;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 10px;
                    color: #000000;
                }

                .section-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .order-actions {
                    display: flex;
                    gap: 10px;
                }

                .btn {
                    font-family: inherit;
                }

                .btn-create, .btn-submit {
                    background-color: #000000;
                    color: #ffffff;
                    border-color: #000000;
                }

                .btn-create:hover, .btn-submit:hover {
                    background-color: #333333;
                    border-color: #333333;
                }

                .btn-cancel, .btn-clear {
                    background-color: #ffffff;
                    color: #000000;
                    border-color: #666666;
                }

                .btn-cancel:hover, .btn-clear:hover {
                    background-color: #f5f5f5;
                }

                .btn-clear-small {
                    padding: 2px 6px;
                    font-size: 0.8rem;
                    min-height: auto;
                    font-family: inherit;
                }

                .btn-refresh {
                    background-color: #000000;
                    color: #ffffff;
                }

                .btn-refresh:hover {
                    background-color: #333333;
                }

                .btn-test {
                    background-color: #17a2b8;
                    color: #ffffff;
                    border-color: #17a2b8;
                }

                .btn-test:hover {
                    background-color: #138496;
                    border-color: #138496;
                }

                .btn-retry {
                    background-color: #000000;
                    color: #ffffff;
                }

                .btn-retry:hover {
                    background-color: #333333;
                }

                .alert {
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }

                .alert-error {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }

                .alert-warning {
                    background-color: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }

                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #000000;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .loading-subtitle {
                    margin-top: 10px;
                    font-size: 0.9rem;
                    color: #666;
                }

                .table-container {
                    overflow-x: auto;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    -webkit-overflow-scrolling: touch;
                }

                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: #ffffff;
                    min-width: 600px;
                    font-family: inherit;
                }

                .admin-table th {
                    background-color: #000000;
                    color: #ffffff;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid #000000;
                    font-size: 0.9rem;
                    font-family: inherit;
                }

                .admin-table td {
                    padding: 15px;
                    border-bottom: 1px solid #e0e0e0;
                    font-size: 0.9rem;
                    font-family: inherit;
                }

                .admin-table tr:last-child td {
                    border-bottom: none;
                }

                .admin-table tr:hover {
                    background-color: #f5f5f5;
                }

                .id-cell {
                    font-family: inherit;
                    color: #666666;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .empty-cell {
                    text-align: center;
                    padding: 40px !important;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 20px;
                }

                .error-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                    flex-wrap: wrap;
                }

                .action-buttons {
                    display: flex;
                    gap: 5px;
                }

                .btn-action {
                    padding: 6px 12px;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    background-color: #ffffff;
                    color: #000000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    font-family: inherit;
                }

                .btn-action:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .btn-view {
                    border-color: #17a2b8;
                    color: #17a2b8;
                }

                .btn-view:hover {
                    background-color: #17a2b8;
                    color: #ffffff;
                }

                .btn-edit {
                    border-color: #ffc107;
                    color: #ffc107;
                }

                .btn-edit:hover {
                    background-color: #ffc107;
                    color: #000000;
                }

                .btn-delete {
                    border-color: #dc3545;
                    color: #dc3545;
                }

                .btn-delete:hover {
                    background-color: #dc3545;
                    color: #ffffff;
                }

                .btn-delete:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .btn-delete:disabled:hover {
                    background-color: #ffffff;
                    color: #dc3545;
                }

                .btn-select {
                    margin-left: 10px;
                    padding: 2px 8px;
                    border: 1px solid #000000;
                    border-radius: 4px;
                    background-color: #ffffff;
                    color: #000000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.8rem;
                    font-family: inherit;
                }

                .btn-select:hover {
                    background-color: #000000;
                    color: #ffffff;
                }

                .badge {
                    display: inline-block;
                    padding: 4px 8px;
                    background-color: #f5f5f5;
                    border: 1px solid #000000;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    font-family: inherit;
                }

                .truncate {
                    max-width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .price {
                    font-weight: 600;
                    color: #000000;
                }

                .image-indicator {
                    display: inline-block;
                    padding: 4px 8px;
                    background-color: #e8f4f8;
                    border: 1px solid #0099cc;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    color: #0099cc;
                }

                .no-image {
                    color: #666;
                    font-style: italic;
                }

                .customer-name {
                    font-weight: 600;
                }

                .customer-phone {
                    font-weight: 500;
                    background-color: #f8f9fa;
                    padding: 4px 8px;
                    border-radius: 4px;
                    display: inline-block;
                    font-family: inherit;
                }

                .restaurant-name {
                    font-weight: 500;
                }

                .order-date {
                    white-space: nowrap;
                }

                /* RESTAURANT FILTER - DROPDOWN */
                .restaurant-filter-dropdown {
                    background-color: #f8f9fa;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .filter-dropdown-header {
                    margin-bottom: 15px;
                }

                .filter-dropdown-header h3 {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: #000000;
                    margin-bottom: 5px;
                }

                .filter-dropdown-subtitle {
                    font-size: 0.9rem;
                    color: #666;
                }

                .filter-dropdown-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .restaurant-dropdown-select {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: #ffffff;
                    color: #000000;
                    cursor: pointer;
                    font-family: inherit;
                }

                .restaurant-dropdown-select:focus {
                    outline: none;
                    border-color: #000000;
                    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
                }

                .selected-restaurant-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 15px;
                    background-color: #e8f5e8;
                    border: 1px solid #28a745;
                    border-radius: 8px;
                }

                .selected-restaurant-label {
                    font-weight: 600;
                    color: #28a745;
                }

                .selected-restaurant-name {
                    flex: 1;
                    font-weight: 500;
                    color: #000000;
                }

                .selected-restaurant {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    border: 1px solid #000000;
                }

                .pagination-section {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 2px solid #e0e0e0;
                }

                /* PAGINATION */
                :global(.pagination) {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                :global(.pagination-button) {
                    min-width: 60px;
                    height: 60px;
                    padding: 10px 15px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    background-color: #ffffff;
                    color: #000000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-family: inherit;
                }

                :global(.pagination-button:hover) {
                    background-color: #f5f5f5;
                }

                :global(.pagination-button.active) {
                    background-color: #000000;
                    color: #ffffff;
                }

                :global(.pagination-button:disabled) {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                :global(.pagination-info) {
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: #000000;
                    margin: 0 15px;
                    font-family: inherit;
                }

                /* Mobile styles */
                .mobile-table-view {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .mobile-table-row {
                    border: 2px solid #000000;
                    border-radius: 8px;
                    padding: 15px;
                    background-color: #ffffff;
                    font-family: inherit;
                }

                .mobile-row-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .mobile-row-title {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .mobile-row-subtitle {
                    font-size: 0.8rem;
                    color: #666;
                    margin-top: 2px;
                }

                .mobile-row-content {
                    margin-bottom: 15px;
                }

                .mobile-row-item {
                    font-size: 0.85rem;
                    margin-bottom: 8px;
                    line-height: 1.4;
                }

                .mobile-row-item:last-child {
                    margin-bottom: 0;
                }

                .mobile-action-buttons {
                    display: flex;
                    gap: 10px;
                }

                .mobile-action-buttons .btn-action {
                    flex: 1;
                    padding: 8px;
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

                /* Forms */
                .admin-form {
                    margin-top: 20px;
                }

                .form-row {
                    display: flex;
                    gap: 30px;
                    margin-bottom: 20px;
                }

                .form-column {
                    flex: 1;
                    min-width: 0;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }

                .form-group label {
                    font-weight: 600;
                    color: #000000;
                    font-size: 0.95rem;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    padding: 12px 15px;
                    border: 2px solid #000000;
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: #ffffff;
                    color: #000000;
                    width: 100%;
                    font-family: inherit;
                }

                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #000000;
                    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
                }

                .form-hint {
                    margin-top: 5px;
                    font-size: 0.85rem;
                    color: #666;
                }

                .image-info {
                    margin-top: 15px;
                    padding: 10px;
                    background-color: #f5f5f5;
                    border-radius: 6px;
                }

                .image-info-text {
                    font-size: 0.85rem;
                    color: #666;
                    margin: 5px 0;
                }

                .form-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                }

                /* Order details */
                .order-details {
                    max-height: 70vh;
                    overflow-y: auto;
                    padding-right: 10px;
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
                    margin-bottom: 15px;
                    padding-bottom: 15px;
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
                    font-size: 1.1rem;
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

                .item-name {
                    font-weight: 500;
                }

                .item-description {
                    font-size: 0.85rem;
                    color: #666;
                    margin-top: 4px;
                }

                .item-quantity {
                    text-align: center;
                }

                .item-price {
                    text-align: right;
                }

                .item-total {
                    text-align: right;
                    font-weight: 600;
                }

                .total-label {
                    text-align: right;
                    font-weight: 600;
                    padding: 12px 15px;
                }

                .total-value {
                    text-align: right;
                    font-weight: 700;
                    padding: 12px 15px;
                    color: #198754;
                    font-size: 1.1rem;
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
                    font-family: inherit;
                }

                /* Mobile adaptations */
                @media (max-width: 768px) {
                    .admin-dashboard {
                        padding: 15px;
                        margin: 10px 0;
                        border-width: 1px;
                    }

                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                        margin-bottom: 20px;
                        padding-bottom: 15px;
                    }

                    .dashboard-stats {
                        flex-direction: column;
                        width: 100%;
                        gap: 10px;
                    }

                    .stat-item {
                        flex-direction: row;
                        justify-content: space-between;
                        min-width: auto;
                        padding: 8px 12px;
                    }

                    .stat-label {
                        margin-bottom: 0;
                        font-size: 0.75rem;
                    }

                    .stat-value {
                        font-size: 0.9rem;
                    }

                    .dashboard-tabs {
                        margin-bottom: 20px;
                        flex-direction: row;
                        overflow-x: scroll;
                        -webkit-overflow-scrolling: touch;
                        padding-bottom: 5px;
                    }

                    .tab-btn {
                        padding: 10px 16px;
                        font-size: 0.95rem;
                        border-radius: 6px;
                        margin-right: 5px;
                        min-height: 44px;
                        border-width: 1px;
                    }

                    .tab-btn.active::after {
                        display: none;
                    }

                    .section-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 10px;
                    }

                    .section-actions {
                        flex-direction: column;
                        width: 100%;
                    }

                    .order-actions {
                        width: 100%;
                        flex-direction: column;
                    }

                    .section-title {
                        font-size: 1.2rem;
                    }

                    .btn, .btn-action, .btn-select {
                        min-height: 44px;
                        font-size: 0.95rem;
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: 3px;
                    }

                    .btn-action {
                        padding: 8px 12px;
                        font-size: 0.9rem;
                        border-width: 1px;
                        border-radius: 6px;
                    }

                    .mobile-action-buttons {
                        flex-direction: column;
                    }

                    .table-container {
                        border-width: 1px;
                        margin-bottom: 15px;
                    }

                    .admin-table {
                        min-width: 800px;
                    }

                    .admin-table th {
                        padding: 12px;
                        font-size: 0.85rem;
                    }

                    .admin-table td {
                        padding: 12px;
                        font-size: 0.85rem;
                    }

                    .empty-cell {
                        padding: 30px 20px !important;
                    }

                    .empty-state {
                        padding: 30px 15px;
                    }

                    .empty-icon {
                        font-size: 2.5rem;
                    }

                    .spinner {
                        width: 30px;
                        height: 30px;
                        border-width: 2px;
                        margin-bottom: 15px;
                    }

                    /* Dropdown on mobile */
                    .restaurant-filter-dropdown {
                        padding: 15px;
                        border-width: 1px;
                    }

                    .filter-dropdown-header h3 {
                        font-size: 1.1rem;
                    }

                    .restaurant-dropdown-select {
                        padding: 12px 15px;
                        font-size: 1rem;
                        border-width: 1px;
                    }

                    .selected-restaurant-info {
                        padding: 10px 12px;
                        font-size: 0.9rem;
                    }

                    /* Pagination on mobile */
                    .pagination-section {
                        margin-top: 15px;
                        padding-top: 15px;
                    }

                    :global(.pagination-button) {
                        min-width: 50px;
                        height: 50px;
                        padding: 8px 12px;
                        font-size: 1rem;
                        border-width: 1px;
                    }

                    :global(.pagination-info) {
                        font-size: 1rem;
                        margin: 0 10px;
                    }

                    .form-row {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .form-group input,
                    .form-group textarea,
                    .form-group select {
                        padding: 12px 15px;
                        font-size: 1rem;
                        border-width: 1px;
                    }

                    .form-group label {
                        font-size: 0.9rem;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .form-actions .btn {
                        width: 100%;
                    }

                    .selected-restaurant {
                        flex-wrap: wrap;
                        justify-content: space-between;
                    }

                    .order-details {
                        max-height: 65vh;
                    }

                    .summary-row {
                        flex-direction: column;
                        gap: 5px;
                    }

                    .summary-label,
                    .summary-value {
                        width: 100%;
                        text-align: left;
                    }

                    .summary-value {
                        margin-top: 2px;
                    }

                    .order-summary {
                        padding: 15px;
                        border-width: 1px;
                    }

                    .items-table {
                        font-size: 0.8rem;
                    }

                    .items-table th,
                    .items-table td {
                        padding: 8px 10px;
                    }
                }

                @media (max-width: 480px) {
                    .dashboard-title {
                        font-size: 1.4rem;
                    }

                    .tab-btn {
                        padding: 8px 12px;
                        font-size: 0.85rem;
                        min-width: auto;
                    }

                    .section-title {
                        font-size: 1.1rem;
                    }

                    .mobile-table-row {
                        padding: 12px;
                    }

                    .mobile-row-title {
                        font-size: 0.95rem;
                    }

                    .btn-action {
                        font-size: 0.85rem;
                        padding: 8px;
                    }

                    .order-actions {
                        gap: 8px;
                    }

                    .restaurant-dropdown-select {
                        font-size: 16px; /* Prevent zoom on iOS */
                    }

                    .form-group input,
                    .form-group select,
                    .form-group textarea {
                        font-size: 16px; /* Prevent zoom on iOS */
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
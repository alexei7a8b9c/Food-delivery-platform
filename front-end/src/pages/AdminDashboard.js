import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [activeTab, setActiveTab] = useState('restaurants');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Формы для ресторанов
    const [restaurantForm, setRestaurantForm] = useState({
        name: '',
        cuisine: '',
        address: '',
        description: '',
        phoneNumber: '',
        email: '',
        openingHours: '',
        imageUrl: ''
    });

    // Формы для блюд
    const [dishForm, setDishForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        preparationTime: '',
        isAvailable: true,
        restaurantId: ''
    });

    // Состояние для загрузки изображений
    const [imageFile, setImageFile] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Пагинация
    const [restaurantPage, setRestaurantPage] = useState(0);
    const [restaurantSize] = useState(10);
    const [dishPage, setDishPage] = useState(0);
    const [dishSize] = useState(10);

    // Проверяем роли
    const hasAdminOrManagerRole = () => {
        if (!currentUser || !currentUser.roles) return false;

        let roles = [];
        if (Array.isArray(currentUser.roles)) {
            roles = currentUser.roles;
        } else if (typeof currentUser.roles === 'string') {
            roles = currentUser.roles.split(',').map(r => r.trim());
        }

        const normalizedRoles = roles.map(role => {
            const roleStr = String(role).toUpperCase();
            if (roleStr.startsWith('ROLE_')) {
                return roleStr.substring(5);
            }
            return roleStr;
        });

        return normalizedRoles.includes('ADMIN') || normalizedRoles.includes('MANAGER');
    };

    // Загрузка ресторанов
    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/restaurants', {
                params: {
                    page: restaurantPage,
                    size: restaurantSize,
                    sortBy: 'name',
                    direction: 'asc'
                }
            });
            setRestaurants(response.data.content || response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка блюд
    const fetchDishes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/dishes', {
                params: {
                    page: dishPage,
                    size: dishSize,
                    sortBy: 'name',
                    direction: 'asc'
                }
            });
            setDishes(response.data.content || response.data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
            setError('Failed to load dishes');
        } finally {
            setLoading(false);
        }
    };

    // Создание ресторана
    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post('/api/admin/restaurants', restaurantForm);
            setSuccess(`Restaurant created with ID: ${response.data.id}`);
            setRestaurantForm({
                name: '',
                cuisine: '',
                address: '',
                description: '',
                phoneNumber: '',
                email: '',
                openingHours: '',
                imageUrl: ''
            });
            fetchRestaurants();
        } catch (error) {
            console.error('Error creating restaurant:', error);
            setError('Failed to create restaurant');
        } finally {
            setLoading(false);
        }
    };

    // Обновление ресторана
    const handleUpdateRestaurant = async (id) => {
        try {
            setLoading(true);
            await api.put(`/api/admin/restaurants/${id}`, restaurantForm);
            setSuccess('Restaurant updated successfully');
            fetchRestaurants();
        } catch (error) {
            console.error('Error updating restaurant:', error);
            setError('Failed to update restaurant');
        } finally {
            setLoading(false);
        }
    };

    // Удаление ресторана
    const handleDeleteRestaurant = async (id) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            try {
                setLoading(true);
                await api.delete(`/api/admin/restaurants/${id}`);
                setSuccess('Restaurant deleted successfully');
                fetchRestaurants();
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                setError('Failed to delete restaurant');
            } finally {
                setLoading(false);
            }
        }
    };

    // Создание блюда
    const handleCreateDish = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.post(`/api/admin/restaurants/${dishForm.restaurantId}/dishes`, {
                ...dishForm,
                price: parseInt(dishForm.price),
                preparationTime: parseInt(dishForm.preparationTime)
            });
            setSuccess(`Dish created with ID: ${response.data.id}`);
            setDishForm({
                name: '',
                description: '',
                price: '',
                category: '',
                preparationTime: '',
                isAvailable: true,
                restaurantId: ''
            });
            fetchDishes();
        } catch (error) {
            console.error('Error creating dish:', error);
            setError('Failed to create dish');
        } finally {
            setLoading(false);
        }
    };

    // Обновление блюда
    const handleUpdateDish = async (id) => {
        try {
            setLoading(true);
            await api.put(`/api/admin/dishes/${id}`, {
                ...dishForm,
                price: parseInt(dishForm.price),
                preparationTime: parseInt(dishForm.preparationTime)
            });
            setSuccess('Dish updated successfully');
            fetchDishes();
        } catch (error) {
            console.error('Error updating dish:', error);
            setError('Failed to update dish');
        } finally {
            setLoading(false);
        }
    };

    // Удаление блюда
    const handleDeleteDish = async (id) => {
        if (window.confirm('Are you sure you want to delete this dish?')) {
            try {
                setLoading(true);
                await api.delete(`/api/admin/dishes/${id}`);
                setSuccess('Dish deleted successfully');
                fetchDishes();
            } catch (error) {
                console.error('Error deleting dish:', error);
                setError('Failed to delete dish');
            } finally {
                setLoading(false);
            }
        }
    };

    // Загрузка изображения для ресторана
    const handleImageUpload = async (restaurantId) => {
        if (!imageFile) {
            setError('Please select an image file');
            return;
        }

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await api.post(`/api/admin/restaurants/${restaurantId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Image uploaded successfully');
            setImageFile(null);
            fetchRestaurants();
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    // Загрузка изображения для блюда
    const handleDishImageUpload = async (dishId) => {
        if (!imageFile) {
            setError('Please select an image file');
            return;
        }

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await api.post(`/api/admin/dishes/${dishId}/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Dish image uploaded successfully');
            setImageFile(null);
            fetchDishes();
        } catch (error) {
            console.error('Error uploading dish image:', error);
            setError('Failed to upload dish image');
        } finally {
            setUploadingImage(false);
        }
    };

    useEffect(() => {
        if (hasAdminOrManagerRole()) {
            if (activeTab === 'restaurants') {
                fetchRestaurants();
            } else if (activeTab === 'dishes') {
                fetchDishes();
            }
        }
    }, [activeTab, restaurantPage, dishPage]);

    if (!hasAdminOrManagerRole()) {
        return (
            <div>
                <h2>Access Denied</h2>
                <p>You need ADMIN or MANAGER role to access this page.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Admin Dashboard</h2>

            {error && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', backgroundColor: '#ffebee' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', backgroundColor: '#e8f5e9' }}>
                    <strong>Success:</strong> {success}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('restaurants')}>Restaurants</button>
                <button onClick={() => setActiveTab('dishes')}>Dishes</button>
            </div>

            {activeTab === 'restaurants' && (
                <div>
                    <h3>Restaurant Management</h3>

                    {/* Форма создания ресторана */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Create New Restaurant</h4>
                        <form onSubmit={handleCreateRestaurant}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Name:</label><br />
                                <input
                                    type="text"
                                    value={restaurantForm.name}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Cuisine:</label><br />
                                <input
                                    type="text"
                                    value={restaurantForm.cuisine}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Address:</label><br />
                                <textarea
                                    value={restaurantForm.address}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Description:</label><br />
                                <textarea
                                    value={restaurantForm.description}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Phone:</label><br />
                                <input
                                    type="text"
                                    value={restaurantForm.phoneNumber}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, phoneNumber: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Email:</label><br />
                                <input
                                    type="email"
                                    value={restaurantForm.email}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, email: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Opening Hours:</label><br />
                                <input
                                    type="text"
                                    value={restaurantForm.openingHours}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, openingHours: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Restaurant'}
                            </button>
                        </form>
                    </div>

                    {/* Загрузка изображения */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Upload Restaurant Image</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Select Restaurant ID:</label><br />
                            <select
                                onChange={(e) => setRestaurantForm({...restaurantForm, id: e.target.value})}
                                style={{ padding: '5px' }}
                            >
                                <option value="">Select Restaurant</option>
                                {restaurants.map(restaurant => (
                                    <option key={restaurant.id} value={restaurant.id}>
                                        {restaurant.name} (ID: {restaurant.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Select Image:</label><br />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                        </div>
                        <button
                            onClick={() => handleImageUpload(restaurantForm.id)}
                            disabled={!imageFile || uploadingImage || !restaurantForm.id}
                        >
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>

                    {/* Список ресторанов */}
                    <div>
                        <h4>Restaurants ({restaurants.length})</h4>
                        {loading ? (
                            <p>Loading...</p>
                        ) : restaurants.length === 0 ? (
                            <p>No restaurants found</p>
                        ) : (
                            <div>
                                {restaurants.map(restaurant => (
                                    <div key={restaurant.id} style={{ border: '1px solid black', padding: '15px', margin: '10px 0' }}>
                                        <h5>{restaurant.name}</h5>
                                        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                                        <p><strong>Address:</strong> {restaurant.address}</p>
                                        <p><strong>Phone:</strong> {restaurant.phoneNumber || 'N/A'}</p>
                                        <p><strong>Email:</strong> {restaurant.email || 'N/A'}</p>
                                        <p><strong>Opening Hours:</strong> {restaurant.openingHours || 'N/A'}</p>
                                        {restaurant.imageUrl && (
                                            <div>
                                                <img
                                                    src={`http://localhost:8080${restaurant.imageUrl}`}
                                                    alt={restaurant.name}
                                                    style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid black' }}
                                                />
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px' }}>
                                            <button onClick={() => handleDeleteRestaurant(restaurant.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'dishes' && (
                <div>
                    <h3>Dish Management</h3>

                    {/* Форма создания блюда */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Create New Dish</h4>
                        <form onSubmit={handleCreateDish}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Restaurant ID:</label><br />
                                <select
                                    value={dishForm.restaurantId}
                                    onChange={(e) => setDishForm({...dishForm, restaurantId: e.target.value})}
                                    required
                                    style={{ padding: '5px' }}
                                >
                                    <option value="">Select Restaurant</option>
                                    {restaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name} (ID: {restaurant.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Dish Name:</label><br />
                                <input
                                    type="text"
                                    value={dishForm.name}
                                    onChange={(e) => setDishForm({...dishForm, name: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Description:</label><br />
                                <textarea
                                    value={dishForm.description}
                                    onChange={(e) => setDishForm({...dishForm, description: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Price (in cents):</label><br />
                                <input
                                    type="number"
                                    value={dishForm.price}
                                    onChange={(e) => setDishForm({...dishForm, price: e.target.value})}
                                    required
                                    min="1"
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Category:</label><br />
                                <input
                                    type="text"
                                    value={dishForm.category}
                                    onChange={(e) => setDishForm({...dishForm, category: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Preparation Time (minutes):</label><br />
                                <input
                                    type="number"
                                    value={dishForm.preparationTime}
                                    onChange={(e) => setDishForm({...dishForm, preparationTime: e.target.value})}
                                    min="1"
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={dishForm.isAvailable}
                                        onChange={(e) => setDishForm({...dishForm, isAvailable: e.target.checked})}
                                    />
                                    Available
                                </label>
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Dish'}
                            </button>
                        </form>
                    </div>

                    {/* Загрузка изображения для блюда */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Upload Dish Image</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Select Dish ID:</label><br />
                            <select
                                onChange={(e) => setDishForm({...dishForm, id: e.target.value})}
                                style={{ padding: '5px' }}
                            >
                                <option value="">Select Dish</option>
                                {dishes.map(dish => (
                                    <option key={dish.id} value={dish.id}>
                                        {dish.name} (ID: {dish.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Select Image:</label><br />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                            />
                        </div>
                        <button
                            onClick={() => handleDishImageUpload(dishForm.id)}
                            disabled={!imageFile || uploadingImage || !dishForm.id}
                        >
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>

                    {/* Список блюд */}
                    <div>
                        <h4>Dishes ({dishes.length})</h4>
                        {loading ? (
                            <p>Loading...</p>
                        ) : dishes.length === 0 ? (
                            <p>No dishes found</p>
                        ) : (
                            <div>
                                {dishes.map(dish => (
                                    <div key={dish.id} style={{ border: '1px solid black', padding: '15px', margin: '10px 0' }}>
                                        <h5>{dish.name}</h5>
                                        <p><strong>Description:</strong> {dish.description || 'N/A'}</p>
                                        <p><strong>Price:</strong> ${(dish.price / 100).toFixed(2)}</p>
                                        <p><strong>Category:</strong> {dish.category || 'N/A'}</p>
                                        <p><strong>Preparation Time:</strong> {dish.preparationTime || 'N/A'} minutes</p>
                                        <p><strong>Available:</strong> {dish.isAvailable ? 'Yes' : 'No'}</p>
                                        <p><strong>Restaurant:</strong> {dish.restaurantName} (ID: {dish.restaurantId})</p>
                                        {dish.imageUrl && (
                                            <div>
                                                <img
                                                    src={`http://localhost:8080${dish.imageUrl}`}
                                                    alt={dish.name}
                                                    style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid black' }}
                                                />
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px' }}>
                                            <button onClick={() => handleDeleteDish(dish.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
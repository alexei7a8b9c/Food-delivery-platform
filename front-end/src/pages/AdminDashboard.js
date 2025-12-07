import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import restaurantService from '../services/restaurantService';
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
        openingHours: ''
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
    const [restaurantImage, setRestaurantImage] = useState(null);
    const [dishImage, setDishImage] = useState(null);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    const [selectedDishId, setSelectedDishId] = useState('');

    // Состояние для редактирования
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [editingDish, setEditingDish] = useState(null);

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
            setError('');
            const data = await restaurantService.getAdminRestaurants();
            console.log('Fetched restaurants:', data);
            if (data.content) {
                setRestaurants(data.content);
            } else {
                setRestaurants(data);
            }
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Failed to load restaurants');
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка блюд
    const fetchDishes = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await restaurantService.getAdminDishes();
            console.log('Fetched dishes:', data);
            if (data.content) {
                setDishes(data.content);
            } else {
                setDishes(data);
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
            setError('Failed to load dishes');
            setDishes([]);
        } finally {
            setLoading(false);
        }
    };

    // Создание ресторана
    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            await restaurantService.createRestaurant(restaurantForm);
            setSuccess('Restaurant created successfully');
            setRestaurantForm({
                name: '',
                cuisine: '',
                address: '',
                description: '',
                phoneNumber: '',
                email: '',
                openingHours: ''
            });
            fetchRestaurants();
        } catch (error) {
            console.error('Error creating restaurant:', error);
            setError('Failed to create restaurant: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Обновление ресторана
    const handleUpdateRestaurant = async (id) => {
        try {
            setLoading(true);
            setError('');
            await restaurantService.updateRestaurant(id, restaurantForm);
            setSuccess('Restaurant updated successfully');
            setRestaurantForm({
                name: '',
                cuisine: '',
                address: '',
                description: '',
                phoneNumber: '',
                email: '',
                openingHours: ''
            });
            setEditingRestaurant(null);
            fetchRestaurants();
        } catch (error) {
            console.error('Error updating restaurant:', error);
            setError('Failed to update restaurant: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Удаление ресторана
    const handleDeleteRestaurant = async (id) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            try {
                setLoading(true);
                setError('');
                await restaurantService.deleteRestaurant(id);
                setSuccess('Restaurant deleted successfully');
                fetchRestaurants();
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                setError('Failed to delete restaurant: ' + (error.response?.data?.message || error.message));
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
            setError('');
            await restaurantService.createDish(dishForm.restaurantId, {
                ...dishForm,
                price: parseInt(dishForm.price),
                preparationTime: parseInt(dishForm.preparationTime || 0)
            });
            setSuccess('Dish created successfully');
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
            setError('Failed to create dish: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Обновление блюда
    const handleUpdateDish = async (id) => {
        try {
            setLoading(true);
            setError('');
            await restaurantService.updateDish(id, {
                ...dishForm,
                price: parseInt(dishForm.price),
                preparationTime: parseInt(dishForm.preparationTime || 0)
            });
            setSuccess('Dish updated successfully');
            setDishForm({
                name: '',
                description: '',
                price: '',
                category: '',
                preparationTime: '',
                isAvailable: true,
                restaurantId: ''
            });
            setEditingDish(null);
            fetchDishes();
        } catch (error) {
            console.error('Error updating dish:', error);
            setError('Failed to update dish: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Удаление блюда
    const handleDeleteDish = async (id) => {
        if (window.confirm('Are you sure you want to delete this dish?')) {
            try {
                setLoading(true);
                setError('');
                await restaurantService.deleteDish(id);
                setSuccess('Dish deleted successfully');
                fetchDishes();
            } catch (error) {
                console.error('Error deleting dish:', error);
                setError('Failed to delete dish: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    // Загрузка изображения для ресторана
    const handleRestaurantImageUpload = async () => {
        if (!restaurantImage || !selectedRestaurantId) {
            setError('Please select a restaurant and an image file');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await restaurantService.uploadRestaurantImage(selectedRestaurantId, restaurantImage);
            setSuccess('Restaurant image uploaded successfully');
            setRestaurantImage(null);
            setSelectedRestaurantId('');
            fetchRestaurants();
        } catch (error) {
            console.error('Error uploading restaurant image:', error);
            setError('Failed to upload restaurant image: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Загрузка изображения для блюда
    const handleDishImageUpload = async () => {
        if (!dishImage || !selectedDishId) {
            setError('Please select a dish and an image file');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await restaurantService.uploadDishImage(selectedDishId, dishImage);
            setSuccess('Dish image uploaded successfully');
            setDishImage(null);
            setSelectedDishId('');
            fetchDishes();
        } catch (error) {
            console.error('Error uploading dish image:', error);
            setError('Failed to upload dish image: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Заполнение формы для редактирования ресторана
    const handleEditRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant);
        setRestaurantForm({
            name: restaurant.name || '',
            cuisine: restaurant.cuisine || '',
            address: restaurant.address || '',
            description: restaurant.description || '',
            phoneNumber: restaurant.phoneNumber || '',
            email: restaurant.email || '',
            openingHours: restaurant.openingHours || ''
        });
    };

    // Заполнение формы для редактирования блюда
    const handleEditDish = (dish) => {
        setEditingDish(dish);
        setDishForm({
            name: dish.name || '',
            description: dish.description || '',
            price: dish.price?.toString() || '',
            category: dish.category || '',
            preparationTime: dish.preparationTime?.toString() || '',
            isAvailable: dish.isAvailable || true,
            restaurantId: dish.restaurantId?.toString() || ''
        });
    };

    useEffect(() => {
        if (hasAdminOrManagerRole()) {
            if (activeTab === 'restaurants') {
                fetchRestaurants();
            } else if (activeTab === 'dishes') {
                fetchDishes();
            }
        }
    }, [activeTab]);

    if (!hasAdminOrManagerRole()) {
        return (
            <div>
                <h2>Access Denied</h2>
                <p>You need ADMIN or MANAGER role to access this page.</p>
                <p>Current user: {currentUser?.email || 'Not logged in'}</p>
                <p>User roles: {JSON.stringify(currentUser?.roles)}</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <p>Welcome, {currentUser?.email}</p>

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
                <button
                    onClick={() => setActiveTab('restaurants')}
                    style={{ marginRight: '10px', fontWeight: activeTab === 'restaurants' ? 'bold' : 'normal' }}
                >
                    Restaurants
                </button>
                <button
                    onClick={() => setActiveTab('dishes')}
                    style={{ fontWeight: activeTab === 'dishes' ? 'bold' : 'normal' }}
                >
                    Dishes
                </button>
            </div>

            {activeTab === 'restaurants' && (
                <div>
                    <h3>Restaurant Management</h3>

                    {/* Форма создания/редактирования ресторана */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>{editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}</h4>
                        <form onSubmit={editingRestaurant ? (e) => { e.preventDefault(); handleUpdateRestaurant(editingRestaurant.id); } : handleCreateRestaurant}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Name: *</label><br />
                                <input
                                    type="text"
                                    value={restaurantForm.name}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Cuisine: *</label><br />
                                <input
                                    type="text"
                                    value={restaurantForm.cuisine}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Address: *</label><br />
                                <textarea
                                    value={restaurantForm.address}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                                    required
                                    style={{ width: '300px', padding: '5px' }}
                                    rows="3"
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Description:</label><br />
                                <textarea
                                    value={restaurantForm.description}
                                    onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                                    style={{ width: '300px', padding: '5px' }}
                                    rows="3"
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
                                {loading ? 'Saving...' : (editingRestaurant ? 'Update Restaurant' : 'Create Restaurant')}
                            </button>
                            {editingRestaurant && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingRestaurant(null);
                                        setRestaurantForm({
                                            name: '',
                                            cuisine: '',
                                            address: '',
                                            description: '',
                                            phoneNumber: '',
                                            email: '',
                                            openingHours: ''
                                        });
                                    }}
                                    style={{ marginLeft: '10px' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Загрузка изображения */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Upload Restaurant Image</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Select Restaurant:</label><br />
                            <select
                                value={selectedRestaurantId}
                                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                                style={{ padding: '5px', width: '300px' }}
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
                            <label>Select Image (jpg, jpeg, png, gif, webp, max 5MB):</label><br />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setRestaurantImage(e.target.files[0])}
                                style={{ padding: '5px' }}
                            />
                        </div>
                        <button
                            onClick={handleRestaurantImageUpload}
                            disabled={!restaurantImage || !selectedRestaurantId || loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Image'}
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
                                        <h5>{restaurant.name} {editingRestaurant?.id === restaurant.id && '(Editing)'}</h5>
                                        <p><strong>ID:</strong> {restaurant.id}</p>
                                        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                                        <p><strong>Address:</strong> {restaurant.address}</p>
                                        <p><strong>Description:</strong> {restaurant.description || 'N/A'}</p>
                                        <p><strong>Phone:</strong> {restaurant.phoneNumber || 'N/A'}</p>
                                        <p><strong>Email:</strong> {restaurant.email || 'N/A'}</p>
                                        <p><strong>Opening Hours:</strong> {restaurant.openingHours || 'N/A'}</p>
                                        {restaurant.imageUrl && (
                                            <div>
                                                <p><strong>Image:</strong></p>
                                                <img
                                                    src={`http://localhost:8080${restaurant.imageUrl}`}
                                                    alt={restaurant.name}
                                                    style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid black' }}
                                                />
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px' }}>
                                            <button onClick={() => handleEditRestaurant(restaurant)}>Edit</button>
                                            <button onClick={() => handleDeleteRestaurant(restaurant.id)} style={{ marginLeft: '10px' }}>Delete</button>
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

                    {/* Форма создания/редактирования блюда */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>{editingDish ? 'Edit Dish' : 'Create New Dish'}</h4>
                        <form onSubmit={editingDish ? (e) => { e.preventDefault(); handleUpdateDish(editingDish.id); } : handleCreateDish}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Restaurant: *</label><br />
                                <select
                                    value={dishForm.restaurantId}
                                    onChange={(e) => setDishForm({...dishForm, restaurantId: e.target.value})}
                                    required
                                    style={{ padding: '5px', width: '300px' }}
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
                                <label>Dish Name: *</label><br />
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
                                    rows="3"
                                />
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Price (in cents): *</label><br />
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
                                    min="0"
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
                                {loading ? 'Saving...' : (editingDish ? 'Update Dish' : 'Create Dish')}
                            </button>
                            {editingDish && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingDish(null);
                                        setDishForm({
                                            name: '',
                                            description: '',
                                            price: '',
                                            category: '',
                                            preparationTime: '',
                                            isAvailable: true,
                                            restaurantId: ''
                                        });
                                    }}
                                    style={{ marginLeft: '10px' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Загрузка изображения для блюда */}
                    <div style={{ border: '1px solid black', padding: '20px', margin: '20px 0' }}>
                        <h4>Upload Dish Image</h4>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Select Dish:</label><br />
                            <select
                                value={selectedDishId}
                                onChange={(e) => setSelectedDishId(e.target.value)}
                                style={{ padding: '5px', width: '300px' }}
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
                            <label>Select Image (jpg, jpeg, png, gif, webp, max 5MB):</label><br />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setDishImage(e.target.files[0])}
                                style={{ padding: '5px' }}
                            />
                        </div>
                        <button
                            onClick={handleDishImageUpload}
                            disabled={!dishImage || !selectedDishId || loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Image'}
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
                                        <h5>{dish.name} {editingDish?.id === dish.id && '(Editing)'}</h5>
                                        <p><strong>ID:</strong> {dish.id}</p>
                                        <p><strong>Description:</strong> {dish.description || 'N/A'}</p>
                                        <p><strong>Price:</strong> ${(dish.price / 100).toFixed(2)} ({dish.price} cents)</p>
                                        <p><strong>Category:</strong> {dish.category || 'N/A'}</p>
                                        <p><strong>Preparation Time:</strong> {dish.preparationTime || 'N/A'} minutes</p>
                                        <p><strong>Available:</strong> {dish.isAvailable ? 'Yes' : 'No'}</p>
                                        <p><strong>Restaurant:</strong> {dish.restaurantName} (ID: {dish.restaurantId})</p>
                                        {dish.imageUrl && (
                                            <div>
                                                <p><strong>Image:</strong></p>
                                                <img
                                                    src={`http://localhost:8080${dish.imageUrl}`}
                                                    alt={dish.name}
                                                    style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid black' }}
                                                />
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px' }}>
                                            <button onClick={() => handleEditDish(dish)}>Edit</button>
                                            <button onClick={() => handleDeleteDish(dish.id)} style={{ marginLeft: '10px' }}>Delete</button>
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
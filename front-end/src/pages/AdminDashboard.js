import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
    const { currentUser } = useContext(AuthContext);
    const [restaurants, setRestaurants] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [activeTab, setActiveTab] = useState('restaurants');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Формы для CRUD операций
    const [newRestaurant, setNewRestaurant] = useState({
        name: '',
        cuisine: '',
        address: ''
    });

    const [newDish, setNewDish] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        restaurantId: ''
    });

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

    // Загрузка данных
    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/api/restaurants');
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Failed to load restaurants');
        }
    };

    const fetchDishes = async () => {
        try {
            const response = await api.get('/api/menu/dishes');
            setDishes(response.data);
        } catch (error) {
            console.error('Error fetching dishes:', error);
            setError('Failed to load dishes');
        }
    };

    useEffect(() => {
        if (hasAdminOrManagerRole()) {
            fetchRestaurants();
            fetchDishes();
        }
    }, [currentUser]);

    // CRUD для ресторанов
    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/admin/restaurants', newRestaurant);
            setSuccess(`Restaurant created successfully! ID: ${response.data.id}`);
            setNewRestaurant({ name: '', cuisine: '', address: '' });
            fetchRestaurants();
        } catch (error) {
            setError(`Error creating restaurant: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRestaurant = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.put(`/api/admin/restaurants/${editingRestaurant.id}`, editingRestaurant);
            setSuccess('Restaurant updated successfully!');
            setEditingRestaurant(null);
            fetchRestaurants();
        } catch (error) {
            setError(`Error updating restaurant: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRestaurant = async (id) => {
        if (!window.confirm('Are you sure you want to delete this restaurant?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.delete(`/api/admin/restaurants/${id}`);
            setSuccess('Restaurant deleted successfully!');
            fetchRestaurants();
        } catch (error) {
            setError(`Error deleting restaurant: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // CRUD для блюд
    const handleCreateDish = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const dishData = {
            ...newDish,
            price: parseInt(newDish.price) || 0,
            restaurantId: parseInt(newDish.restaurantId) || null
        };

        try {
            const response = await api.post(`/api/admin/restaurants/${dishData.restaurantId}/dishes`, dishData);
            setSuccess(`Dish created successfully! ID: ${response.data.id}`);
            setNewDish({ name: '', description: '', price: '', imageUrl: '', restaurantId: '' });
            fetchDishes();
        } catch (error) {
            setError(`Error creating dish: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDish = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const dishData = {
            ...editingDish,
            price: parseInt(editingDish.price) || 0
        };

        try {
            await api.put(`/api/admin/restaurants/${dishData.restaurantId}/dishes/${dishData.id}`, dishData);
            setSuccess('Dish updated successfully!');
            setEditingDish(null);
            fetchDishes();
        } catch (error) {
            setError(`Error updating dish: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDish = async (dishId, restaurantId) => {
        if (!window.confirm('Are you sure you want to delete this dish?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.delete(`/api/admin/restaurants/${restaurantId}/dishes/${dishId}`);
            setSuccess('Dish deleted successfully!');
            fetchDishes();
        } catch (error) {
            setError(`Error deleting dish: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

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
            <p>Welcome, {currentUser?.email} (Roles: {JSON.stringify(currentUser?.roles)})</p>

            <div style={{ marginBottom: '20px', borderBottom: '1px solid black', paddingBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('restaurants')}
                    style={{
                        marginRight: '10px',
                        border: '1px solid black',
                        background: activeTab === 'restaurants' ? 'black' : 'white',
                        color: activeTab === 'restaurants' ? 'white' : 'black'
                    }}
                >
                    Restaurants ({restaurants.length})
                </button>
                <button
                    onClick={() => setActiveTab('dishes')}
                    style={{
                        border: '1px solid black',
                        background: activeTab === 'dishes' ? 'black' : 'white',
                        color: activeTab === 'dishes' ? 'white' : 'black'
                    }}
                >
                    Dishes ({dishes.length})
                </button>
            </div>

            {error && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', background: '#f0f0f0' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div style={{ border: '1px solid black', padding: '10px', margin: '10px 0', background: '#f0f0f0' }}>
                    <strong>Success:</strong> {success}
                </div>
            )}

            {activeTab === 'restaurants' && (
                <div>
                    <h3>Restaurant Management</h3>

                    {/* Форма создания/редактирования ресторана */}
                    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
                        <h4>{editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}</h4>
                        <form onSubmit={editingRestaurant ? handleUpdateRestaurant : handleCreateRestaurant}>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                                <input
                                    type="text"
                                    value={editingRestaurant ? editingRestaurant.name : newRestaurant.name}
                                    onChange={(e) => editingRestaurant
                                        ? setEditingRestaurant({...editingRestaurant, name: e.target.value})
                                        : setNewRestaurant({...newRestaurant, name: e.target.value})
                                    }
                                    required
                                    disabled={loading}
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Cuisine:</label>
                                <input
                                    type="text"
                                    value={editingRestaurant ? editingRestaurant.cuisine : newRestaurant.cuisine}
                                    onChange={(e) => editingRestaurant
                                        ? setEditingRestaurant({...editingRestaurant, cuisine: e.target.value})
                                        : setNewRestaurant({...newRestaurant, cuisine: e.target.value})
                                    }
                                    required
                                    disabled={loading}
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
                                <textarea
                                    value={editingRestaurant ? editingRestaurant.address : newRestaurant.address}
                                    onChange={(e) => editingRestaurant
                                        ? setEditingRestaurant({...editingRestaurant, address: e.target.value})
                                        : setNewRestaurant({...newRestaurant, address: e.target.value})
                                    }
                                    required
                                    disabled={loading}
                                    rows="3"
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ border: '1px solid black', padding: '8px 16px', marginRight: '10px' }}
                                >
                                    {loading ? 'Saving...' : (editingRestaurant ? 'Update Restaurant' : 'Create Restaurant')}
                                </button>

                                {editingRestaurant && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingRestaurant(null)}
                                        style={{ border: '1px solid black', padding: '8px 16px' }}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Список ресторанов */}
                    <div>
                        <h4>Existing Restaurants</h4>
                        {restaurants.length === 0 ? (
                            <p>No restaurants found</p>
                        ) : (
                            <div>
                                {restaurants.map(restaurant => (
                                    <div key={restaurant.id} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                                        <h5>{restaurant.name} (ID: {restaurant.id})</h5>
                                        <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                                        <p><strong>Address:</strong> {restaurant.address}</p>
                                        <p><strong>Dishes:</strong> {dishes.filter(d => d.restaurantId === restaurant.id).length}</p>

                                        <div style={{ marginTop: '10px' }}>
                                            <button
                                                onClick={() => setEditingRestaurant(restaurant)}
                                                style={{ border: '1px solid black', padding: '5px 10px', marginRight: '10px' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRestaurant(restaurant.id)}
                                                disabled={loading}
                                                style={{ border: '1px solid black', padding: '5px 10px', marginRight: '10px' }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewDish({...newDish, restaurantId: restaurant.id});
                                                    setActiveTab('dishes');
                                                }}
                                                style={{ border: '1px solid black', padding: '5px 10px' }}
                                            >
                                                Add Dish
                                            </button>
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
                    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
                        <h4>{editingDish ? 'Edit Dish' : 'Create New Dish'}</h4>
                        <form onSubmit={editingDish ? handleUpdateDish : handleCreateDish}>
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Restaurant:</label>
                                <select
                                    value={editingDish ? editingDish.restaurantId : newDish.restaurantId}
                                    onChange={(e) => editingDish
                                        ? setEditingDish({...editingDish, restaurantId: e.target.value})
                                        : setNewDish({...newDish, restaurantId: e.target.value})
                                    }
                                    required
                                    disabled={loading}
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                >
                                    <option value="">Select Restaurant</option>
                                    {restaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name} ({restaurant.cuisine})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                                <input
                                    type="text"
                                    value={editingDish ? editingDish.name : newDish.name}
                                    onChange={(e) => editingDish
                                        ? setEditingDish({...editingDish, name: e.target.value})
                                        : setNewDish({...newDish, name: e.target.value})
                                    }
                                    required
                                    disabled={loading}
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
                                <textarea
                                    value={editingDish ? editingDish.description : newDish.description}
                                    onChange={(e) => editingDish
                                        ? setEditingDish({...editingDish, description: e.target.value})
                                        : setNewDish({...newDish, description: e.target.value})
                                    }
                                    disabled={loading}
                                    rows="2"
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Price (cents):</label>
                                <input
                                    type="number"
                                    value={editingDish ? editingDish.price : newDish.price}
                                    onChange={(e) => editingDish
                                        ? setEditingDish({...editingDish, price: e.target.value})
                                        : setNewDish({...newDish, price: e.target.value})
                                    }
                                    required
                                    disabled={loading}
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Image URL:</label>
                                <input
                                    type="text"
                                    value={editingDish ? editingDish.imageUrl : newDish.imageUrl}
                                    onChange={(e) => editingDish
                                        ? setEditingDish({...editingDish, imageUrl: e.target.value})
                                        : setNewDish({...newDish, imageUrl: e.target.value})
                                    }
                                    disabled={loading}
                                    placeholder="/images/dishes/filename.jpg"
                                    style={{ width: '100%', padding: '5px', border: '1px solid black' }}
                                />
                                <small>Use path like: /images/dishes/filename.jpg</small>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{ border: '1px solid black', padding: '8px 16px', marginRight: '10px' }}
                                >
                                    {loading ? 'Saving...' : (editingDish ? 'Update Dish' : 'Create Dish')}
                                </button>

                                {editingDish && (
                                    <button
                                        type="button"
                                        onClick={() => setEditingDish(null)}
                                        style={{ border: '1px solid black', padding: '8px 16px' }}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Список блюд */}
                    <div>
                        <h4>Existing Dishes</h4>
                        {dishes.length === 0 ? (
                            <p>No dishes found</p>
                        ) : (
                            <div>
                                {dishes.map(dish => {
                                    const restaurant = restaurants.find(r => r.id === dish.restaurantId);
                                    return (
                                        <div key={dish.id} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                                            <h5>{dish.name} (ID: {dish.id})</h5>
                                            <p><strong>Restaurant:</strong> {restaurant ? `${restaurant.name} (ID: ${dish.restaurantId})` : `ID: ${dish.restaurantId}`}</p>
                                            <p><strong>Description:</strong> {dish.description || 'N/A'}</p>
                                            <p><strong>Price:</strong> ${(dish.price / 100).toFixed(2)}</p>
                                            <p><strong>Image:</strong> {dish.imageUrl ? (
                                                <span>{dish.imageUrl}</span>
                                            ) : 'N/A'}</p>

                                            {dish.imageUrl && dish.imageUrl.startsWith('/images/') && (
                                                <div style={{ marginTop: '10px' }}>
                                                    <img
                                                        src={dish.imageUrl}
                                                        alt={dish.name}
                                                        style={{ maxWidth: '200px', maxHeight: '150px', border: '1px solid black' }}
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                </div>
                                            )}

                                            <div style={{ marginTop: '10px' }}>
                                                <button
                                                    onClick={() => setEditingDish(dish)}
                                                    style={{ border: '1px solid black', padding: '5px 10px', marginRight: '10px' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDish(dish.id, dish.restaurantId)}
                                                    disabled={loading}
                                                    style={{ border: '1px solid black', padding: '5px 10px' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '20px', borderTop: '1px solid black', paddingTop: '10px' }}>
                <button
                    onClick={() => {
                        fetchRestaurants();
                        fetchDishes();
                    }}
                    style={{ border: '1px solid black', padding: '8px 16px' }}
                >
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
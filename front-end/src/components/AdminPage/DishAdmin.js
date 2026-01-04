import React, { useState, useEffect } from 'react';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import ImageUploader from '../common/ImageUploader';
import { dishApi, restaurantApi, formatErrorMessage } from '../../services/api';

const DishAdmin = () => {
    const [dishes, setDishes] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        restaurantId: ''
    });
    const [uploadedImage, setUploadedImage] = useState(null);
    const [error, setError] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        loadRestaurants();
    }, []);

    useEffect(() => {
        loadDishes();
    }, [currentPage, searchTerm, selectedRestaurant]);

    const loadDishes = async () => {
        setLoading(true);
        setError('');
        try {
            let response;

            if (selectedRestaurant) {
                response = await dishApi.getByRestaurant(selectedRestaurant, {
                    search: searchTerm || undefined,
                    page: currentPage,
                    size: 10,
                    sortBy: 'name',
                    sortDirection: 'asc'
                });
            } else {
                response = await dishApi.getAll({
                    search: searchTerm || undefined,
                    page: currentPage,
                    size: 10,
                    sortBy: 'name',
                    sortDirection: 'asc'
                });
            }

            setDishes(response.data.content || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalElements(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error loading dishes:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Failed to load dishes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const loadRestaurants = async () => {
        try {
            const response = await restaurantApi.getAll({ page: 0, size: 100 });
            setRestaurants(response.data.content);
            if (response.data.content.length > 0 && !formData.restaurantId) {
                setFormData(prev => ({ ...prev, restaurantId: response.data.content[0].id }));
            }
        } catch (error) {
            console.error('Error loading restaurants:', error);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    const handleCreate = () => {
        setEditingDish(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            imageUrl: '',
            restaurantId: restaurants[0]?.id || ''
        });
        setUploadedImage(null);
        setIsModalOpen(true);
    };

    const handleEdit = (dish) => {
        setEditingDish(dish);
        setFormData({
            name: dish.name,
            description: dish.description || '',
            price: dish.price,
            imageUrl: dish.imageUrl || '',
            restaurantId: dish.restaurantId
        });
        setUploadedImage(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the dish "${name}"?`)) {
            try {
                const dish = dishes.find(d => d.id === id);
                if (dish && dish.imageUrl) {
                    try {
                        await dishApi.deleteImage(id);
                    } catch (imgError) {
                        console.warn('Failed to delete image:', imgError);
                    }
                }

                await dishApi.delete(id);
                alert('Dish successfully deleted');
                loadDishes();
            } catch (error) {
                console.error('Error deleting dish:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Failed to delete dish: ${errorMessage}`);
            }
        }
    };

    const handleImageUpload = async (file) => {
        setImageUploading(true);
        setError('');

        try {
            let imageUrl;

            if (editingDish) {
                const response = await dishApi.uploadImage(editingDish.id, file);
                imageUrl = response.data.imageUrl;
            } else {
                const response = await dishApi.getAll({
                    page: 0,
                    size: 1,
                    sortBy: 'id',
                    sortDirection: 'desc'
                });
                const tempId = response.data.content[0]?.id || Date.now();
                const tempResponse = await dishApi.uploadImage(tempId, file);
                imageUrl = tempResponse.data.imageUrl;
            }

            setFormData(prev => ({ ...prev, imageUrl }));
            setUploadedImage(file);

            return Promise.resolve();
        } catch (error) {
            const errorMessage = formatErrorMessage(error);
            setError(`Image upload error: ${errorMessage}`);
            return Promise.reject(error);
        } finally {
            setImageUploading(false);
        }
    };

    const handleImageDelete = async () => {
        if (!editingDish) {
            setFormData(prev => ({ ...prev, imageUrl: '' }));
            setUploadedImage(null);
            return Promise.resolve();
        }

        try {
            await dishApi.deleteImage(editingDish.id);
            setFormData(prev => ({ ...prev, imageUrl: '' }));
            setUploadedImage(null);
            return Promise.resolve();
        } catch (error) {
            const errorMessage = formatErrorMessage(error);
            setError(`Failed to delete image: ${errorMessage}`);
            return Promise.reject(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const dishData = {
                ...formData,
                price: parseFloat(formData.price)
            };

            if (editingDish) {
                if (uploadedImage) {
                    await dishApi.updateWithImage(editingDish.id, dishData, uploadedImage);
                } else {
                    await dishApi.update(editingDish.id, dishData);
                }
                alert('Dish successfully updated');
            } else {
                await dishApi.create(dishData);
                alert('Dish successfully created');
            }

            setIsModalOpen(false);
            loadDishes();
        } catch (error) {
            console.error('Error saving dish:', error);
            const errorMessage = formatErrorMessage(error);
            setError(errorMessage);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRestaurantFilterChange = (e) => {
        setSelectedRestaurant(e.target.value);
        setCurrentPage(0);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedRestaurant('');
        setCurrentPage(0);
    };

    return (
        <div className="admin-section">
            <div className="admin-toolbar">
                <div className="search-filters">
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search dishes by name or description..."
                    />

                    <select
                        value={selectedRestaurant}
                        onChange={handleRestaurantFilterChange}
                        className="filter-select"
                    >
                        <option value="">All restaurants</option>
                        {restaurants.map(restaurant => (
                            <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                            </option>
                        ))}
                    </select>

                    {(searchTerm || selectedRestaurant) && (
                        <button onClick={handleClearFilters} className="btn btn-secondary">
                            Clear filters
                        </button>
                    )}
                </div>

                <button onClick={handleCreate} className="btn btn-primary">
                    + Add dish
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="admin-stats">
                <div>
                    {selectedRestaurant && (
                        <div className="filter-info">
                            <span>Filter:</span>
                            <span className="filter-value">
                {restaurants.find(r => r.id == selectedRestaurant)?.name || 'Restaurant'}
              </span>
                        </div>
                    )}
                </div>
                <div>
          <span className="total-count">
            Total dishes: {totalElements}
          </span>
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading dishes...</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th className="name-column">Name</th>
                                <th className="description-column">Description</th>
                                <th className="price-column">Price</th>
                                <th className="restaurant-column">Restaurant</th>
                                <th className="actions-column">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {dishes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-cell">
                                        <div className="empty-state">
                                            <div className="empty-icon">🍽️</div>
                                            <h3>No dishes found</h3>
                                            <p>Try changing your search parameters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                dishes.map(dish => (
                                    <tr key={dish.id}>
                                        <td>
                                            <strong>{dish.name}</strong>
                                            {dish.imageUrl && (
                                                <div className="image-indicator" title="Has image">
                                                    📷
                                                </div>
                                            )}
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
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleEdit(dish)}
                                                    className="btn btn-sm"
                                                    title="Edit"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(dish.id, dish.name)}
                                                    className="btn btn-sm btn-danger"
                                                    title="Delete"
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

                    {dishes.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingDish ? 'Edit dish' : 'Add dish'}
            >
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="form-column">
                            <div className="form-group">
                                <label>Dish name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
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
                                    value={formData.description}
                                    onChange={handleFormChange}
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
                                    value={formData.price}
                                    onChange={handleFormChange}
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
                                    value={formData.restaurantId}
                                    onChange={handleFormChange}
                                    required
                                >
                                    <option value="">Select restaurant</option>
                                    {restaurants.map(restaurant => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-column">
                            <ImageUploader
                                onUpload={handleImageUpload}
                                onDelete={handleImageDelete}
                                initialImageUrl={formData.imageUrl}
                                label="Dish image"
                                maxSizeMB={10}
                            />
                            <div className="image-info">
                                <p className="image-info-text">Image will be displayed in the restaurant menu</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={imageUploading}
                        >
                            {imageUploading ? 'Uploading...' : (editingDish ? 'Save changes' : 'Create dish')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn"
                            disabled={imageUploading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DishAdmin;
import React, { useState, useEffect } from 'react';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import { restaurantApi, formatErrorMessage } from '../../services/api';

const RestaurantAdmin = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        address: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadRestaurants();
    }, [currentPage, searchTerm]);

    const loadRestaurants = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await restaurantApi.getAll({
                search: searchTerm || undefined,
                page: currentPage,
                size: 10,
                sortBy: 'name',
                sortDirection: 'asc'
            });

            setRestaurants(response.data.content);
            setTotalPages(response.data.totalPages);
            setTotalElements(response.data.totalElements);
        } catch (error) {
            console.error('Error loading restaurants:', error);
            const errorMessage = formatErrorMessage(error);
            setError(`Не удалось загрузить рестораны: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    const handleCreate = () => {
        setEditingRestaurant(null);
        setFormData({ name: '', cuisine: '', address: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (restaurant) => {
        setEditingRestaurant(restaurant);
        setFormData({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            address: restaurant.address
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Вы уверены, что хотите удалить ресторан "${name}"?`)) {
            try {
                await restaurantApi.delete(id);
                alert('Ресторан успешно удален');
                loadRestaurants();
            } catch (error) {
                console.error('Error deleting restaurant:', error);
                const errorMessage = formatErrorMessage(error);
                alert(`Не удалось удалить ресторан: ${errorMessage}`);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingRestaurant) {
                await restaurantApi.update(editingRestaurant.id, formData);
                alert('Ресторан успешно обновлен');
            } else {
                await restaurantApi.create(formData);
                alert('Ресторан успешно создан');
            }

            setIsModalOpen(false);
            loadRestaurants();
        } catch (error) {
            console.error('Error saving restaurant:', error);
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

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(0);
    };

    return (
        <div className="admin-section">
            <div className="admin-toolbar">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Поиск ресторанов по названию или адресу..."
                    />
                    {searchTerm && (
                        <button onClick={handleClearSearch} className="btn btn-clear">
                            ❌ Очистить поиск
                        </button>
                    )}
                </div>

                <button onClick={handleCreate} className="btn btn-create">
                    + Добавить ресторан
                </button>
            </div>

            {error && (
                <div className="error-message" style={{
                    padding: '15px',
                    backgroundColor: '#fff5f5',
                    color: '#ff4444',
                    border: '1px solid #ffcccc',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <strong>Ошибка:</strong> {error}
                </div>
            )}

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Загрузка ресторанов...</p>
                </div>
            ) : (
                <>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Название</th>
                                <th>Кухня</th>
                                <th>Адрес</th>
                                <th style={{ width: '200px' }}>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {restaurants.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="empty-state">
                                            <div className="empty-icon">🏪</div>
                                            <h3>Рестораны не найдены</h3>
                                            <p>Попробуйте изменить параметры поиска</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                restaurants.map(restaurant => (
                                    <tr key={restaurant.id}>
                                        <td>
                                            <strong>{restaurant.name}</strong>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                ID: {restaurant.id}
                                            </div>
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
                                                    onClick={() => handleEdit(restaurant)}
                                                    className="btn-action btn-edit"
                                                    title="Редактировать"
                                                >
                                                    ✏️ Редактировать
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(restaurant.id, restaurant.name)}
                                                    className="btn-action btn-delete"
                                                    title="Удалить"
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
                title={editingRestaurant ? 'Редактировать ресторан' : 'Добавить ресторан'}
            >
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Название ресторана *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
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
                            value={formData.cuisine}
                            onChange={handleFormChange}
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
                            value={formData.address}
                            onChange={handleFormChange}
                            required
                            minLength="5"
                            maxLength="255"
                            rows="3"
                            placeholder="Полный адрес ресторана"
                        />
                    </div>

                    {error && (
                        <div className="error-message" style={{
                            padding: '10px',
                            backgroundColor: '#fff5f5',
                            color: '#ff4444',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-submit">
                            {editingRestaurant ? 'Сохранить изменения' : 'Создать ресторан'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="btn btn-cancel"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RestaurantAdmin;
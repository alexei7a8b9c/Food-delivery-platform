import React, { useState, useEffect } from 'react'
import { restaurantService } from '../../services/restaurantService'
import { Plus, Edit, Trash2, Utensils, Search } from 'lucide-react'

const AdminRestaurants = () => {
    const [restaurants, setRestaurants] = useState([])
    const [dishes, setDishes] = useState({})
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingRestaurant, setEditingRestaurant] = useState(null)
    const [showDishForm, setShowDishForm] = useState(false)
    const [selectedRestaurant, setSelectedRestaurant] = useState(null)
    const [editingDish, setEditingDish] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [restaurantForm, setRestaurantForm] = useState({
        name: '',
        cuisine: '',
        address: ''
    })

    const [dishForm, setDishForm] = useState({
        name: '',
        description: '',
        price: '',
        imageUrl: ''
    })

    useEffect(() => {
        loadRestaurants()
    }, [])

    const loadRestaurants = async () => {
        try {
            const response = await restaurantService.getAllRestaurants()
            setRestaurants(response.data)

            // Load dishes for each restaurant
            const dishesPromises = response.data.map(restaurant =>
                restaurantService.getRestaurantDishes(restaurant.id)
            )

            const dishesResponses = await Promise.all(dishesPromises)
            const dishesMap = {}

            response.data.forEach((restaurant, index) => {
                dishesMap[restaurant.id] = dishesResponses[index].data
            })

            setDishes(dishesMap)
        } catch (error) {
            console.error('Error loading restaurants:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRestaurantSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingRestaurant) {
                await restaurantService.updateRestaurant(editingRestaurant.id, restaurantForm)
            } else {
                await restaurantService.createRestaurant(restaurantForm)
            }

            resetForms()
            loadRestaurants()
        } catch (error) {
            console.error('Error saving restaurant:', error)
            alert('Ошибка при сохранении ресторана')
        }
    }

    const handleDishSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingDish) {
                await restaurantService.updateDish(selectedRestaurant.id, editingDish.id, dishForm)
            } else {
                await restaurantService.addDish(selectedRestaurant.id, dishForm)
            }

            resetForms()
            loadRestaurants()
        } catch (error) {
            console.error('Error saving dish:', error)
            alert('Ошибка при сохранении блюда')
        }
    }

    const deleteRestaurant = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот ресторан?')) {
            try {
                await restaurantService.deleteRestaurant(id)
                loadRestaurants()
            } catch (error) {
                console.error('Error deleting restaurant:', error)
                alert('Ошибка при удалении ресторана')
            }
        }
    }

    const deleteDish = async (restaurantId, dishId) => {
        if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
            try {
                await restaurantService.deleteDish(restaurantId, dishId)
                loadRestaurants()
            } catch (error) {
                console.error('Error deleting dish:', error)
                alert('Ошибка при удалении блюда')
            }
        }
    }

    const resetForms = () => {
        setRestaurantForm({ name: '', cuisine: '', address: '' })
        setDishForm({ name: '', description: '', price: '', imageUrl: '' })
        setShowForm(false)
        setShowDishForm(false)
        setEditingRestaurant(null)
        setEditingDish(null)
        setSelectedRestaurant(null)
    }

    const openEditRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant)
        setRestaurantForm({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            address: restaurant.address
        })
        setShowForm(true)
    }

    const openAddDish = (restaurant) => {
        setSelectedRestaurant(restaurant)
        setShowDishForm(true)
    }

    const openEditDish = (restaurant, dish) => {
        setSelectedRestaurant(restaurant)
        setEditingDish(dish)
        setDishForm({
            name: dish.name,
            description: dish.description || '',
            price: dish.price.toString(),
            imageUrl: dish.imageUrl || ''
        })
        setShowDishForm(true)
    }

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление ресторанами</h1>
                    <p className="text-gray-600">Добавление и редактирование ресторанов и меню</p>
                </div>

                <div className="flex space-x-4 mt-4 md:mt-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск ресторанов..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                    >
                        <Plus size={20} className="mr-2" />
                        Добавить ресторан
                    </button>
                </div>
            </div>

            {/* Restaurant Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingRestaurant ? 'Редактировать ресторан' : 'Добавить ресторан'}
                        </h3>

                        <form onSubmit={handleRestaurantSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={restaurantForm.name}
                                        onChange={(e) => setRestaurantForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Кухня
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={restaurantForm.cuisine}
                                        onChange={(e) => setRestaurantForm(prev => ({ ...prev, cuisine: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Адрес
                                    </label>
                                    <textarea
                                        required
                                        value={restaurantForm.address}
                                        onChange={(e) => setRestaurantForm(prev => ({ ...prev, address: e.target.value }))}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    {editingRestaurant ? 'Сохранить' : 'Добавить'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForms}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Restaurants List */}
            <div className="space-y-6">
                {filteredRestaurants.map(restaurant => (
                    <div key={restaurant.id} className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                        {restaurant.name}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-gray-600">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      {restaurant.cuisine}
                    </span>
                                        <span className="text-sm">{restaurant.address}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2 mt-4 md:mt-0">
                                    <button
                                        onClick={() => openAddDish(restaurant)}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center"
                                    >
                                        <Plus size={16} className="mr-1" />
                                        Блюдо
                                    </button>
                                    <button
                                        onClick={() => openEditRestaurant(restaurant)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center"
                                    >
                                        <Edit size={16} className="mr-1" />
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => deleteRestaurant(restaurant.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors flex items-center"
                                    >
                                        <Trash2 size={16} className="mr-1" />
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dishes List */}
                        <div className="p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Меню</h4>

                            {dishes[restaurant.id]?.length > 0 ? (
                                <div className="grid gap-4">
                                    {dishes[restaurant.id].map(dish => (
                                        <div key={dish.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                                    <Utensils size={20} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{dish.name}</h5>
                                                    <p className="text-sm text-gray-600">{dish.description}</p>
                                                    <p className="text-lg font-bold text-orange-500">{dish.price} ₽</p>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditDish(restaurant, dish)}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteDish(restaurant.id, dish.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Меню пустое</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Dish Form Modal */}
            {showDishForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingDish ? 'Редактировать блюдо' : 'Добавить блюдо'}
                        </h3>

                        <form onSubmit={handleDishSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название блюда
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={dishForm.name}
                                        onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Описание
                                    </label>
                                    <textarea
                                        value={dishForm.description}
                                        onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Цена (₽)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={dishForm.price}
                                        onChange={(e) => setDishForm(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL изображения
                                    </label>
                                    <input
                                        type="url"
                                        value={dishForm.imageUrl}
                                        onChange={(e) => setDishForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    {editingDish ? 'Сохранить' : 'Добавить'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForms}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminRestaurants
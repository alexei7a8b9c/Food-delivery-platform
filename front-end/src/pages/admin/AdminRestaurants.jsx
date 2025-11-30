import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRestaurants } from '../../store/slices/restaurantSlice'
import { Plus, Search, Edit, Trash2, Utensils } from 'lucide-react'

const AdminRestaurants = () => {
    const dispatch = useDispatch()
    const { restaurants, isLoading } = useSelector((state) => state.restaurants)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingRestaurant, setEditingRestaurant] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        address: ''
    })

    useEffect(() => {
        dispatch(fetchRestaurants())
    }, [dispatch])

    const filteredRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddRestaurant = () => {
        // Implement restaurant creation
        console.log('Add restaurant:', formData)
        setShowAddForm(false)
        setFormData({ name: '', cuisine: '', address: '' })
    }

    const handleEditRestaurant = (restaurant) => {
        setEditingRestaurant(restaurant)
        setFormData({
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            address: restaurant.address
        })
    }

    const handleUpdateRestaurant = () => {
        // Implement restaurant update
        console.log('Update restaurant:', editingRestaurant.id, formData)
        setEditingRestaurant(null)
        setFormData({ name: '', cuisine: '', address: '' })
    }

    const handleDeleteRestaurant = (restaurantId) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            // Implement restaurant deletion
            console.log('Delete restaurant:', restaurantId)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingRestaurant) {
            handleUpdateRestaurant()
        } else {
            handleAddRestaurant()
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Restaurants</h1>
                        <p className="text-gray-600">Add, edit, or remove restaurants</p>
                    </div>

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary flex items-center space-x-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Restaurant</span>
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Add/Edit Form */}
                {(showAddForm || editingRestaurant) && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Restaurant Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cuisine Type
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.cuisine}
                                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    className="input-field"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button type="submit" className="btn-primary">
                                    {editingRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setEditingRestaurant(null)
                                        setFormData({ name: '', cuisine: '', address: '' })
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Restaurants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map(restaurant => (
                        <div key={restaurant.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="h-32 bg-gray-200 flex items-center justify-center">
                                <Utensils className="h-12 w-12 text-gray-400" />
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {restaurant.name}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Cuisine:</span> {restaurant.cuisine}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Address:</span> {restaurant.address}
                                    </p>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditRestaurant(restaurant)}
                                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        onClick={() => handleDeleteRestaurant(restaurant.id)}
                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRestaurants.length === 0 && (
                    <div className="text-center py-12">
                        <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first restaurant'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminRestaurants
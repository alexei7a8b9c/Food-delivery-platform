import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { restaurantService } from '../services/restaurantService'
import { Search, Star, Clock, MapPin } from 'lucide-react'

const Restaurants = () => {
    const [restaurants, setRestaurants] = useState([])
    const [filteredRestaurants, setFilteredRestaurants] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCuisine, setSelectedCuisine] = useState('')

    const cuisines = ['Italian', 'Chinese', 'American', 'Japanese', 'Mexican', 'French']

    useEffect(() => {
        loadRestaurants()
    }, [])

    useEffect(() => {
        filterRestaurants()
    }, [searchTerm, selectedCuisine, restaurants])

    const loadRestaurants = async () => {
        try {
            const response = await restaurantService.getAllRestaurants()
            setRestaurants(response.data)
        } catch (error) {
            console.error('Error loading restaurants:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterRestaurants = () => {
        let filtered = restaurants

        if (searchTerm) {
            filtered = filtered.filter(restaurant =>
                restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (selectedCuisine) {
            filtered = filtered.filter(restaurant =>
                restaurant.cuisine === selectedCuisine
            )
        }

        setFilteredRestaurants(filtered)
    }

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Рестораны</h1>
                <p className="text-gray-600">Выберите ресторан и начните заказ</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Поиск ресторанов или кухни..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Cuisine Filter */}
                    <select
                        value={selectedCuisine}
                        onChange={(e) => setSelectedCuisine(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="">Все кухни</option>
                        {cuisines.map(cuisine => (
                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Restaurants Grid */}
            {filteredRestaurants.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Utensils size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Рестораны не найдены</h3>
                    <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map(restaurant => (
                        <div key={restaurant.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                <Utensils size={48} className="text-gray-400" />
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {restaurant.name}
                                </h3>

                                <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin size={16} className="mr-1" />
                                    <span className="text-sm">{restaurant.address}</span>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded">
                    {restaurant.cuisine}
                  </span>
                                    <div className="flex items-center text-yellow-500">
                                        <Star size={16} className="fill-current" />
                                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                                    </div>
                                </div>

                                <Link
                                    to={`/restaurants/${restaurant.id}`}
                                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-center block"
                                >
                                    Смотреть меню
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Restaurants
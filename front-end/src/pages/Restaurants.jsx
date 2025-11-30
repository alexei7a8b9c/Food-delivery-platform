import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRestaurants } from '../store/slices/restaurantSlice'
import { Search, Utensils, Star, Clock, AlertCircle } from 'lucide-react'

const Restaurants = () => {
    const dispatch = useDispatch()
    const { restaurants, isLoading, error } = useSelector((state) => state.restaurants)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCuisine, setSelectedCuisine] = useState('')

    useEffect(() => {
        console.log('Restaurants component mounted, fetching restaurants...')
        dispatch(fetchRestaurants())
    }, [dispatch])

    const cuisines = [...new Set(restaurants.map(restaurant => restaurant.cuisine))]

    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesSearch =
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCuisine = !selectedCuisine || restaurant.cuisine === selectedCuisine
        return matchesSearch && matchesCuisine
    })

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading restaurants...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading restaurants</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => dispatch(fetchRestaurants())}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Restaurants</h1>
                    <p className="text-gray-600">Discover amazing food from local restaurants</p>
                </div>

                {/* Filters */}
                <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search restaurants or cuisines..."
                                className="input-field pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="input-field md:w-48"
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                        >
                            <option value="">All Cuisines</option>
                            {cuisines.map(cuisine => (
                                <option key={cuisine} value={cuisine}>{cuisine}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="mb-4 text-sm text-gray-500">
                    Showing {filteredRestaurants.length} of {restaurants.length} restaurants
                </div>

                {/* Restaurants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRestaurants.map(restaurant => (
                        <Link
                            key={restaurant.id}
                            to={`/restaurants/${restaurant.id}`}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden hover:transform hover:scale-105 duration-200"
                        >
                            <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <Utensils className="h-16 w-16 text-primary-600" />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900">{restaurant.name}</h3>
                                </div>
                                <div className="flex items-center text-gray-600 mb-2">
                                    <Utensils className="h-4 w-4 mr-1" />
                                    <span className="text-sm capitalize">{restaurant.cuisine}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {restaurant.address}
                                </p>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>30-45 min</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span>4.5</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredRestaurants.length === 0 && restaurants.length > 0 && (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                )}

                {restaurants.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants available</h3>
                        <p className="text-gray-600">Check back later for new restaurant listings</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Restaurants
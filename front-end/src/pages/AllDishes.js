import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRestaurants } from '../store/slices/restaurantSlice.js'
import { Search, Filter, Star, Clock, ShoppingCart } from 'lucide-react'

const AllDishes = () => {
    const dispatch = useDispatch()
    const { restaurants, isLoading } = useSelector((state) => state.restaurants)
    const { user } = useSelector((state) => state.auth)

    const [searchTerm, setSearchTerm] = useState('')
    const [priceFilter, setPriceFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [dishes, setDishes] = useState([])

    useEffect(() => {
        dispatch(fetchRestaurants())
    }, [dispatch])

    useEffect(() => {
        // Собираем все блюда из всех ресторанов
        const allDishes = []
        restaurants.forEach(restaurant => {
            if (restaurant.menuItems) {
                restaurant.menuItems.forEach(dish => {
                    allDishes.push({
                        ...dish,
                        restaurantName: restaurant.name,
                        restaurantId: restaurant.id,
                        restaurantCuisine: restaurant.cuisine
                    })
                })
            }
        })
        setDishes(allDishes)
    }, [restaurants])

    const filteredDishes = dishes.filter(dish => {
        const matchesSearch =
            dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dish.restaurantName.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesPrice =
            priceFilter === 'all' ||
            (priceFilter === 'low' && dish.price < 10) ||
            (priceFilter === 'medium' && dish.price >= 10 && dish.price < 20) ||
            (priceFilter === 'high' && dish.price >= 20)

        const matchesCategory =
            categoryFilter === 'all' ||
            dish.category === categoryFilter

        return matchesSearch && matchesPrice && matchesCategory
    })

    const categories = [...new Set(dishes.map(dish => dish.category))].filter(Boolean)

    const handleAddToCart = (dish) => {
        if (!user) {
            alert('Please login to add items to cart')
            return
        }
        // Здесь будет логика добавления в корзину
        alert(`Added ${dish.name} to cart!`)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore All Dishes</h1>
                    <p className="text-gray-600">Discover thousands of dishes from our partner restaurants</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search dishes, restaurants, or cuisines..."
                                className="input-field pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                className="input-field pl-10"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                            >
                                <option value="all">All Prices</option>
                                <option value="low">Under $10</option>
                                <option value="medium">$10 - $20</option>
                                <option value="high">Over $20</option>
                            </select>
                        </div>

                        <select
                            className="input-field"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold">{filteredDishes.length}</span> of <span className="font-semibold">{dishes.length}</span> dishes
                    </p>
                </div>

                {/* Dishes Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading dishes...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDishes.map((dish) => (
                            <div key={`${dish.restaurantId}-${dish.id}`} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🍽️</div>
                                        <p className="text-gray-500 text-sm">Dish Image</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{dish.name}</h3>
                                        <span className="text-lg font-bold text-primary-600">${dish.price.toFixed(2)}</span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {dish.description || 'Delicious dish from our restaurant'}
                                    </p>

                                    <div className="mb-4">
                                        <Link
                                            to={`/restaurants/${dish.restaurantId}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {dish.restaurantName}
                                        </Link>
                                        <div className="flex items-center text-gray-500 text-sm mt-1">
                                            <span className="px-2 py-1 bg-gray-100 rounded mr-2">{dish.restaurantCuisine}</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded">{dish.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                            <span>4.5</span>
                                            <Clock className="h-4 w-4 ml-3 mr-1" />
                                            <span>30-40 min</span>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(dish)}
                                            className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            <span>Add to Cart</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && filteredDishes.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍕</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setPriceFilter('all')
                                setCategoryFilter('all')
                            }}
                            className="btn-secondary"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllDishes
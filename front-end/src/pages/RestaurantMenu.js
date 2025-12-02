import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRestaurantMenu } from '../store/slices/restaurantSlice.js'
import { addToCart } from '../store/slices/cartSlice.js'

const RestaurantMenu = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { currentRestaurant, menu, loading, error } = useSelector((state) => state.restaurant)
    const { items: cartItems, restaurantId: cartRestaurantId } = useSelector((state) => state.cart)
    const { user } = useSelector((state) => state.auth)

    const [categoryFilter, setCategoryFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [quantities, setQuantities] = useState({})

    useEffect(() => {
        if (id) {
            dispatch(fetchRestaurantMenu(id))
        }
    }, [id, dispatch])

    const handleAddToCart = (dish) => {
        if (!user) {
            navigate('/login')
            return
        }

        if (cartRestaurantId && cartRestaurantId !== id) {
            const confirmClear = window.confirm(
                'Your cart contains items from another restaurant. Adding items from this restaurant will clear your current cart. Continue?'
            )
            if (!confirmClear) return
        }

        const quantity = quantities[dish.id] || 1
        dispatch(addToCart({ dish: { ...dish, restaurantId: id }, quantity }))
        setQuantities(prev => ({ ...prev, [dish.id]: 0 }))
    }

    const getCategories = () => {
        const categories = new Set(menu.map(dish => dish.category))
        return ['all', ...Array.from(categories)]
    }

    const filteredMenu = menu.filter(dish => {
        if (categoryFilter !== 'all' && dish.category !== categoryFilter) return false
        if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
    })

    const getCartQuantity = (dishId) => {
        const cartItem = cartItems.find(item => item.id === dishId)
        return cartItem ? cartItem.quantity : 0
    }

    const handleQuantityChange = (dishId, change) => {
        setQuantities(prev => ({
            ...prev,
            [dishId]: Math.max(0, (prev[dishId] || 0) + change)
        }))
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading restaurant</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => navigate('/restaurants')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Back to Restaurants
                    </button>
                </div>
            </div>
        )
    }

    if (!currentRestaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏪</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
                    <button onClick={() => navigate('/restaurants')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Back to Restaurants
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restaurant Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <span className="mr-2">←</span>
                        Back to Restaurants
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentRestaurant.name}</h1>
                            <p className="text-gray-600 mb-1 capitalize">{currentRestaurant.cuisineType} Cuisine</p>
                            <p className="text-gray-500 text-sm">{currentRestaurant.description}</p>
                        </div>

                        {user && (
                            <button
                                onClick={() => navigate('/cart')}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
                            >
                                <span className="mr-2">🛒</span>
                                <span>View Cart</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Restaurant Info */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl">⭐</div>
                            <div className="font-semibold">{currentRestaurant.rating || '4.5'}</div>
                            <div className="text-gray-500 text-sm">Rating</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl">🕒</div>
                            <div className="font-semibold">{currentRestaurant.deliveryTime || '30-40'} min</div>
                            <div className="text-gray-500 text-sm">Delivery Time</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl">💰</div>
                            <div className="font-semibold">${currentRestaurant.minOrder || '10'}</div>
                            <div className="text-gray-500 text-sm">Min Order</div>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl">🍽️</div>
                            <div className="font-semibold">{menu.length}</div>
                            <div className="text-gray-500 text-sm">Dishes</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="w-full md:w-64">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {getCategories().map((category) => (
                                    <option key={category} value={category}>
                                        {category === 'all' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Cart Summary */}
                {cartItems.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold">{cartItems.length} items in cart</span>
                                <span className="text-gray-600 ml-2">
                  • Total: ${cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </span>
                            </div>
                            <button
                                onClick={() => navigate('/cart')}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                View Cart
                            </button>
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenu.map((dish) => {
                        const cartQuantity = getCartQuantity(dish.id)
                        const quantity = quantities[dish.id] || 0

                        return (
                            <div key={dish.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <span className="text-6xl">🍽️</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{dish.name}</h3>
                                        <span className="font-bold text-green-600">${dish.price.toFixed(2)}</span>
                                    </div>

                                    <p className="text-gray-600 mb-4">{dish.description}</p>

                                    <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {dish.category}
                    </span>

                                        {cartQuantity > 0 ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold">{cartQuantity} in cart</span>
                                                <button
                                                    onClick={() => handleAddToCart(dish)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                >
                                                    Add More
                                                </button>
                                            </div>
                                        ) : quantity > 0 ? (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(dish.id, -1)}
                                                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                >
                                                    -
                                                </button>
                                                <span className="font-semibold">{quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(dish.id, 1)}
                                                    className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleAddToCart(dish)}
                                                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleQuantityChange(dish.id, 1)}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredMenu.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍕</div>
                        <p className="text-gray-500 text-lg">No dishes found</p>
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setCategoryFilter('all')
                            }}
                            className="mt-4 text-green-500 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RestaurantMenu
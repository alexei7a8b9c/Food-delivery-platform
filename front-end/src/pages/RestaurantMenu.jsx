import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRestaurantById, fetchRestaurantMenu } from '../store/slices/restaurantSlice'
import { addToCart } from '../store/slices/cartSlice'
import { ArrowLeft, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react'

const RestaurantMenu = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentRestaurant, menu, isLoading, error } = useSelector((state) => state.restaurants)
    const { user } = useSelector((state) => state.auth)
    const [quantities, setQuantities] = useState({})

    useEffect(() => {
        console.log(`Fetching restaurant ${id} and menu...`)
        dispatch(fetchRestaurantById(id))
        dispatch(fetchRestaurantMenu(id))
    }, [dispatch, id])

    const handleQuantityChange = (dishId, change) => {
        setQuantities(prev => ({
            ...prev,
            [dishId]: Math.max(0, (prev[dishId] || 0) + change)
        }))
    }

    const handleAddToCart = (dish) => {
        const quantity = quantities[dish.id] || 1
        if (quantity > 0) {
            dispatch(addToCart({
                dishId: dish.id,
                quantity: quantity,
                restaurantId: parseInt(id),
                dishName: dish.name,
                dishDescription: dish.description,
                price: dish.price
            }))
            setQuantities(prev => ({ ...prev, [dish.id]: 0 }))
            alert(`Added ${quantity} ${dish.name} to cart!`)
        }
    }

    const handleOrderNow = () => {
        if (!user) {
            navigate('/login')
            return
        }
        navigate('/cart')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading restaurant</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => navigate('/restaurants')} className="btn-primary">
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
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant not found</h2>
                    <button onClick={() => navigate('/restaurants')} className="btn-primary">
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
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Restaurants
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {currentRestaurant.name}
                            </h1>
                            <p className="text-gray-600 mb-1 capitalize">{currentRestaurant.cuisine} Cuisine</p>
                            <p className="text-gray-500 text-sm">{currentRestaurant.address}</p>
                        </div>
                        <button
                            onClick={handleOrderNow}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            <span>View Cart</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-2xl font-semibold text-gray-900">Menu</h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {menu.length} items available
                        </p>
                    </div>
                    <div className="divide-y">
                        {menu.map(dish => (
                            <div key={dish.id} className="p-6 flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        {dish.name}
                                    </h3>
                                    <p className="text-gray-600 mb-2 text-sm">
                                        {dish.description}
                                    </p>
                                    <p className="text-lg font-semibold text-primary-600">
                                        ${(dish.price / 100).toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleQuantityChange(dish.id, -1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                            disabled={!quantities[dish.id]}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center font-medium">
                      {quantities[dish.id] || 0}
                    </span>
                                        <button
                                            onClick={() => handleQuantityChange(dish.id, 1)}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(dish)}
                                        disabled={!quantities[dish.id]}
                                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {menu.length === 0 && (
                        <div className="text-center py-12">
                            <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items available</h3>
                            <p className="text-gray-600">This restaurant hasn't added any dishes yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RestaurantMenu
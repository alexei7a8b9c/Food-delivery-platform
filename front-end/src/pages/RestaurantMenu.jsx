import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { restaurantService } from '../services/restaurantService'
import { addToCart } from '../store/slices/cartSlice'
import { Plus, Minus, ShoppingCart, ArrowLeft, Star } from 'lucide-react'

const RestaurantMenu = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { items, restaurantId } = useSelector(state => state.cart)

    const [restaurant, setRestaurant] = useState(null)
    const [dishes, setDishes] = useState([])
    const [loading, setLoading] = useState(true)
    const [quantities, setQuantities] = useState({})

    useEffect(() => {
        loadRestaurantData()
    }, [id])

    const loadRestaurantData = async () => {
        try {
            const [restaurantResponse, dishesResponse] = await Promise.all([
                restaurantService.getRestaurantById(id),
                restaurantService.getRestaurantDishes(id)
            ])

            setRestaurant(restaurantResponse.data)
            setDishes(dishesResponse.data)

            // Initialize quantities
            const initialQuantities = {}
            dishesResponse.data.forEach(dish => {
                const cartItem = items.find(item => item.dishId === dish.id)
                initialQuantities[dish.id] = cartItem ? cartItem.quantity : 0
            })
            setQuantities(initialQuantities)
        } catch (error) {
            console.error('Error loading restaurant data:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateQuantity = (dishId, change) => {
        setQuantities(prev => ({
            ...prev,
            [dishId]: Math.max(0, (prev[dishId] || 0) + change)
        }))
    }

    const addDishToCart = (dish) => {
        if (quantities[dish.id] > 0) {
            dispatch(addToCart({
                dish: {
                    dishId: dish.id,
                    dishName: dish.name,
                    dishDescription: dish.description,
                    price: dish.price,
                    restaurantId: parseInt(id)
                },
                restaurantId: parseInt(id)
            }))
        }
    }

    const goToCart = () => {
        navigate('/cart')
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

    if (!restaurant) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Ресторан не найден</h2>
                    <button
                        onClick={() => navigate('/restaurants')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Вернуться к ресторанам
                    </button>
                </div>
            </div>
        )
    }

    const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Restaurant Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/restaurants')}
                    className="flex items-center text-gray-600 hover:text-orange-500 mb-4 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Назад к ресторанам
                </button>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                            <div className="flex items-center space-x-4 text-gray-600">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {restaurant.cuisine}
                </span>
                                <div className="flex items-center">
                                    <Star size={16} className="fill-current text-yellow-500 mr-1" />
                                    <span>4.5 • 30-40 мин</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2">{restaurant.address}</p>
                        </div>

                        {cartItemsCount > 0 && (
                            <button
                                onClick={goToCart}
                                className="mt-4 md:mt-0 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                            >
                                <ShoppingCart size={20} className="mr-2" />
                                Корзина ({cartItemsCount})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu */}
            <div className="grid gap-6">
                {dishes.map(dish => (
                    <div key={dish.id} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{dish.name}</h3>
                                <p className="text-gray-600 mb-3">{dish.description}</p>
                                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-500">
                    {dish.price} ₽
                  </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => updateQuantity(dish.id, -1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-8 text-center font-semibold">
                    {quantities[dish.id] || 0}
                  </span>
                                    <button
                                        onClick={() => updateQuantity(dish.id, 1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={() => addDishToCart(dish)}
                                    disabled={!quantities[dish.id]}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        quantities[dish.id]
                                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    В корзину
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {dishes.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Utensils size={64} className="mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Меню пустое</h3>
                    <p className="text-gray-600">В этом ресторане пока нет блюд</p>
                </div>
            )}
        </div>
    )
}

export default RestaurantMenu
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRestaurants } from '../store/slices/restaurantSlice'
import { restaurantService } from '../services/restaurantService'
import { Search, Utensils, Star, DollarSign, Filter, Clock } from 'lucide-react'

const AllDishes = () => {
    const dispatch = useDispatch()
    const { restaurants } = useSelector((state) => state.restaurants)
    const [dishes, setDishes] = useState([])
    const [filteredDishes, setFilteredDishes] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCuisine, setSelectedCuisine] = useState('')
    const [priceRange, setPriceRange] = useState('')

    useEffect(() => {
        loadAllDishes()
        // Загружаем рестораны для фильтров
        if (restaurants.length === 0) {
            dispatch(fetchRestaurants())
        }
    }, [dispatch])

    const loadAllDishes = async () => {
        try {
            setIsLoading(true)
            setError(null)
            console.log('Loading all dishes from PostgreSQL database...')

            // Используем метод получения всех блюд из сервиса
            const allDishes = await restaurantService.getAllDishes()

            console.log(`Loaded ${allDishes.length} dishes from database`)
            setDishes(allDishes)
            setFilteredDishes(allDishes)
        } catch (error) {
            console.error('Error loading all dishes from database:', error)
            setError(error.message || 'Failed to load dishes from database')
        } finally {
            setIsLoading(false)
        }
    }

    // Фильтрация блюд
    useEffect(() => {
        let filtered = dishes

        // Поиск по названию и описанию
        if (searchTerm) {
            filtered = filtered.filter(dish =>
                dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dish.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Фильтр по кухне (из связанного ресторана)
        if (selectedCuisine) {
            filtered = filtered.filter(dish =>
                dish.restaurant?.cuisine === selectedCuisine
            )
        }

        // Фильтр по цене (цена хранится в центах)
        if (priceRange) {
            switch (priceRange) {
                case 'under-10':
                    filtered = filtered.filter(dish => dish.price < 1000)
                    break
                case '10-20':
                    filtered = filtered.filter(dish => dish.price >= 1000 && dish.price < 2000)
                    break
                case '20-30':
                    filtered = filtered.filter(dish => dish.price >= 2000 && dish.price < 3000)
                    break
                case 'over-30':
                    filtered = filtered.filter(dish => dish.price >= 3000)
                    break
                default:
                    break
            }
        }

        setFilteredDishes(filtered)
    }, [dishes, searchTerm, selectedCuisine, priceRange])

    // Получаем уникальные кухни из блюд
    const cuisines = [...new Set(dishes
        .map(dish => dish.restaurant?.cuisine)
        .filter(cuisine => cuisine)
    )].sort()

    const formatPrice = (priceInCents) => {
        return `$${(priceInCents / 100).toFixed(2)}`
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dishes from database...</p>
                    <p className="text-sm text-gray-500 mt-2">Connected to PostgreSQL with FlyWay</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Utensils className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Connection Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={loadAllDishes}
                            className="w-full btn-primary"
                        >
                            Try Again
                        </button>
                        <div className="text-xs text-gray-500">
                            <p>Ensure database is running with:</p>
                            <p>• PostgreSQL with FlyWay migrations</p>
                            <p>• Restaurant service on port 8082</p>
                            <p>• API Gateway on port 8080</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">All Dishes</h1>
                    <p className="text-gray-600">
                        Discover {dishes.length} dishes from our restaurant partners
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Data loaded from PostgreSQL database
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search dishes or restaurants..."
                                className="input-field pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Cuisine Filter */}
                        <div>
                            <select
                                className="input-field w-full"
                                value={selectedCuisine}
                                onChange={(e) => setSelectedCuisine(e.target.value)}
                            >
                                <option value="">All Cuisines</option>
                                {cuisines.map(cuisine => (
                                    <option key={cuisine} value={cuisine}>
                                        {cuisine}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Filter */}
                        <div>
                            <select
                                className="input-field w-full"
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                            >
                                <option value="">Any Price</option>
                                <option value="under-10">Under $10</option>
                                <option value="10-20">$10 - $20</option>
                                <option value="20-30">$20 - $30</option>
                                <option value="over-30">Over $30</option>
                            </select>
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-center md:justify-end">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {filteredDishes.length} of {dishes.length} dishes
              </span>
                        </div>
                    </div>
                </div>

                {/* Dishes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDishes.map(dish => (
                        <div
                            key={dish.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            {/* Dish Image */}
                            <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative">
                                {dish.imageUrl ? (
                                    <img
                                        src={dish.imageUrl}
                                        alt={dish.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Utensils className="h-12 w-12 text-primary-400" />
                                )}
                                <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-full px-2 py-1">
                  <span className="text-sm font-semibold text-primary-600">
                    {formatPrice(dish.price)}
                  </span>
                                </div>
                            </div>

                            <div className="p-4">
                                {/* Dish Name and Price */}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                        {dish.name}
                                    </h3>
                                </div>

                                {/* Dish Description */}
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                                    {dish.description || 'Delicious dish from our restaurant'}
                                </p>

                                {/* Restaurant Info */}
                                <div className="mb-3">
                                    <Link
                                        to={`/restaurants/${dish.restaurant?.id || dish.restaurantId}`}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium line-clamp-1"
                                    >
                                        {dish.restaurant?.name || 'Restaurant'}
                                    </Link>
                                    <div className="flex items-center text-gray-500 text-xs mt-1">
                                        <Utensils className="h-3 w-3 mr-1" />
                                        <span className="capitalize">
                      {dish.restaurant?.cuisine || 'Various'}
                    </span>
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                    <div className="flex items-center text-gray-500 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>25-40 min</span>
                                    </div>
                                    <div className="flex items-center text-yellow-600 text-xs">
                                        <Star className="h-3 w-3 mr-1" />
                                        <span>4.5</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredDishes.length === 0 && dishes.length > 0 && (
                    <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria</p>
                    </div>
                )}

                {dishes.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes in database</h3>
                        <p className="text-gray-600">
                            Check if FlyWay migrations ran successfully on restaurant_db
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            <p>Expected tables: restaurant, dish</p>
                            <p>Check migrations: V1_Create_restaurants_table.sql, V2_Create_dishes_table.sql</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AllDishes
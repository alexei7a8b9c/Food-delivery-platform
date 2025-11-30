import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Utensils, Clock, Star, Truck } from 'lucide-react'

const Home = () => {
    const { user } = useSelector((state) => state.auth)

    const features = [
        {
            icon: <Utensils className="h-8 w-8" />,
            title: 'Wide Variety',
            description: 'Choose from hundreds of restaurants and cuisines'
        },
        {
            icon: <Clock className="h-8 w-8" />,
            title: 'Fast Delivery',
            description: 'Get your food delivered in 30 minutes or less'
        },
        {
            icon: <Star className="h-8 w-8" />,
            title: 'Best Quality',
            description: 'Only the finest ingredients and preparation'
        },
        {
            icon: <Truck className="h-8 w-8" />,
            title: 'Track Your Order',
            description: 'Real-time tracking from kitchen to doorstep'
        }
    ]

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Delicious food,
                            <span className="block text-yellow-300">delivered to you</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-primary-100">
                            Order from your favorite restaurants and enjoy fresh meals at home
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/restaurants"
                                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                            >
                                Order Now
                            </Link>
                            {!user && (
                                <Link
                                    to="/register"
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
                                >
                                    Sign Up Free
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Us?
                        </h2>
                        <p className="text-xl text-gray-600">
                            We make food delivery simple, fast, and reliable
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6">
                                <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Ready to order?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of satisfied customers enjoying great food
                    </p>
                    <Link
                        to="/restaurants"
                        className="btn-primary text-lg px-8 py-4"
                    >
                        Browse Restaurants
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default Home
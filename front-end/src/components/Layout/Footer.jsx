import React from 'react'
import { Utensils } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Utensils className="h-6 w-6 text-primary-500" />
                        <span className="text-lg font-bold">FoodDelivery</span>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-gray-400">
                            &copy; 2024 FoodDelivery Platform. All rights reserved.
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                            Delivering happiness to your doorstep
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">FoodDelivery</h3>
                        <p className="text-gray-400">
                            Сервис доставки еды из лучших ресторанов города
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Для клиентов</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/restaurants" className="hover:text-white transition-colors">Рестораны</Link></li>
                            <li><Link to="/orders" className="hover:text-white transition-colors">Мои заказы</Link></li>
                            <li><Link to="/cart" className="hover:text-white transition-colors">Корзина</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Помощь</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Поддержка</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Компания</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Для ресторанов</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Вакансии</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 FoodDelivery. Все права защищены.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
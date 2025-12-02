const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white mt-12">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Food Delivery</h3>
                        <p className="text-gray-400">
                            Delivering happiness to your doorstep
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/restaurants" className="text-gray-400 hover:text-white">Restaurants</a></li>
                            <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                            <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <p className="text-gray-400">
                            Email: support@fooddelivery.com<br />
                            Phone: (123) 456-7890<br />
                            Address: 123 Food Street, City
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Food Delivery Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaUtensils, FaShoppingCart, FaUser } from 'react-icons/fa';

function Header() {
    return (
        <header className="header">
            <div className="container flex-between">
                <div className="logo">
                    <Link to="/" className="flex-center gap-10">
                        <FaHome size={24} />
                        <h1>Food Delivery</h1>
                    </Link>
                </div>

                <nav className="nav">
                    <ul className="flex gap-20">
                        <li>
                            <Link to="/" className="flex-center gap-5">
                                <FaHome />
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/restaurants" className="flex-center gap-5">
                                <FaUtensils />
                                Restaurants
                            </Link>
                        </li>
                        <li>
                            <Link to="/cart" className="flex-center gap-5">
                                <FaShoppingCart />
                                Cart
                            </Link>
                        </li>
                        <li>
                            <Link to="/login" className="flex-center gap-5">
                                <FaUser />
                                Login
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
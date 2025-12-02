import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Food Delivery</h3>
                        <p>Delicious food delivered to your door</p>
                    </div>

                    <div className="footer-section">
                        <h4>Contact Us</h4>
                        <p>Email: support@fooddelivery.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                    </div>

                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-icons">
                            <a href="#"><FaGithub /></a>
                            <a href="#"><FaLinkedin /></a>
                            <a href="#"><FaEnvelope /></a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Food Delivery Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
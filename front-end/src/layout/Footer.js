import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <p>© {new Date().getFullYear()} Restaurant Management System</p>
            </div>
        </footer>
    );
};

export default Footer;
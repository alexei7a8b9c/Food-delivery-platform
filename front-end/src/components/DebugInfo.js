import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const DebugInfo = () => {
    const { currentUser } = useContext(AuthContext);
    const { cartItems, cartCount } = useContext(CartContext);

    return (
        <div style={{
            border: '1px dashed gray',
            padding: '10px',
            margin: '10px',
            fontSize: '12px'
        }}>
            <h4>Debug Information</h4>
            <p><strong>User:</strong> {currentUser ? currentUser.email : 'Not logged in'}</p>
            <p><strong>User ID:</strong> {currentUser ? currentUser.userId : 'N/A'}</p>
            <p><strong>Cart Items:</strong> {cartCount}</p>
            <p><strong>API Base URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:8080'}</p>
            <p><strong>Page URL:</strong> {window.location.href}</p>
        </div>
    );
};

export default DebugInfo;
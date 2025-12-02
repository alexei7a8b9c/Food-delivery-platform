import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => {
    return React.createElement('div', {
            style: {
                padding: '40px',
                fontFamily: 'Arial, sans-serif'
            }
        },
        React.createElement('h1', { style: { color: '#f97316' } }, 'Food Delivery Platform'),
        React.createElement('p', null, 'Frontend is loading...'),
        React.createElement('a', {
            href: '/restaurants',
            style: {
                color: '#3b82f6',
                textDecoration: 'underline',
                marginTop: '20px',
                display: 'block'
            }
        }, 'Go to Restaurants')
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(React.StrictMode, null,
    React.createElement(App)
));
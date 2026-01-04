import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(value);
    };

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="search-input form-control"
            />
            <button type="submit" className="btn">
                🔍
            </button>
        </form>
    );
};

export default SearchBar;
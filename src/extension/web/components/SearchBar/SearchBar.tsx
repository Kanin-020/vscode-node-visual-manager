import './SearchBar.css';

import React, { useState } from 'react';

interface SearchBarProps {
    onSearch: (term: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <div className="search-container">
            <input
                id="search-bar"
                type="text"
                className="search-bar"
                placeholder="Find node version"
                value={searchTerm}
                onChange={handleSearch}
                maxLength={25}
            />
            <i className="codicon codicon-search"></i>
        </div>
    );
}

export default SearchBar;

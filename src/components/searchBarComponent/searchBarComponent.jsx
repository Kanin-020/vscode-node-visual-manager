import React, { useState } from 'react';

const SearchBar = ({ setFilteredVersions, allVersions }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        if (value === '') {
            setFilteredVersions(allVersions);
        } else {
            const filtered = allVersions.filter(version => version.toLowerCase().includes(value));
            setFilteredVersions(filtered);
        }
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
            />
            <i className="codicon codicon-search"></i>
        </div>
    );
};

export default SearchBar;

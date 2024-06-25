import './SearchBar.css';

import React, { useState } from 'react';

const SearchBar = ({ setFilteredVersions, allVersions, type }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        if (value === '') {
            setFilteredVersions(allVersions);
        } else {

            if (type === 'array') {
                const filtered = allVersions.filter(version => version.toLowerCase().includes(value));

                setFilteredVersions(filtered);
            }

            if (type === 'object') {
                const filtered = allVersions.filter(item => item.version.toLowerCase().includes(value) || item.type.toLowerCase().includes(value));

                setFilteredVersions(filtered);
            }
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
                maxLength={25}
            />
            <i className="codicon codicon-search"></i>
        </div>
    );
};

export default SearchBar;

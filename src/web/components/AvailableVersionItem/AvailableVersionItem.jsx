import './AvailableVersionItem.css';

import React from 'react';

const AvailableVersionItem = ({ item, installNodeVersion }) => {
    return (
        <div className="node-item">
            <div className="node-item-content">
                <span className="version">{item.version}</span>
                <span className={`tag ${getTagClass(item.type)}`}>{item.type}</span>
                <div className="options">
                    <a className="action" onClick={() => installNodeVersion(item.version)}>
                        <i className="codicon codicon-cloud-download"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};

const getTagClass = (type) => {
    switch (type) {
        case 'Current':
            return 'current';
        case 'LTS':
            return 'lts';
        case 'Old Stable':
            return 'old-stable';
        case 'Old Unstable':
            return 'old-unstable';
        case 'Common':
            return 'current';
        default:
            return '';
    }
};

export default React.memo(AvailableVersionItem);
import './AvailableVersionItem.css';

import React from 'react';

import { Version } from '@core/types/version';

interface AvailableVersionItemProps {
    item: Version;
    installNodeVersion: (version: string) => void;
    installNodeFromSource: (version: string) => void;
    canInstallFromSource: boolean;
}

const AvailableVersionItem: React.FC<AvailableVersionItemProps> = ({
    item,
    installNodeVersion,
    installNodeFromSource,
    canInstallFromSource,
}) => {
    return (
        <div className="node-item">
            <div className="node-item-content">
                <span className="version">{item.version}</span>
                <span className={`tag ${getTagClass(item.releaseType)}`}>{item.releaseType}</span>
                <div className="options">
                    <a
                        title="Install"
                        className="action"
                        onClick={() => installNodeVersion(item.version)}
                    >
                        <i className="codicon codicon-cloud-download"></i>
                    </a>
                    {canInstallFromSource && (
                        <a
                            title="Install from Source"
                            className="action"
                            onClick={() => installNodeFromSource(item.version)}
                        >
                            <i className="codicon codicon-desktop-download"></i>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const getTagClass = (type: string): string => {
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

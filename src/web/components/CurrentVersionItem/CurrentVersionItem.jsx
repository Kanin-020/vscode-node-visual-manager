import './CurrentVersionItem.css';

import React from 'react';

const CurrentVersionItem = ({ version, currentVersionState, useNodeVersion, uninstallNodeVersion, toggleNVMState, showCurrentLabel }) => {
    return (
        <div className="node-item">
            <div className="node-item-content">
                <span className="version">{version}</span>
                <span
                    className="tag current"
                    style={{ visibility: (version === currentVersionState && showCurrentLabel) ? 'visible' : 'hidden' }}
                    onClick={toggleNVMState}
                >Current</span>
                <div className="options">
                    <a title="Use version" className="action" onClick={() => useNodeVersion(version)}>
                        <i className="codicon codicon-run"></i>
                    </a>
                    <a title="Uninstall" className="action" onClick={() => uninstallNodeVersion(version)}>
                        <i className="codicon codicon-close"></i>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CurrentVersionItem);

import React, { useEffect, useState } from 'react';

import SearchBar from '../searchBarComponent/searchBarComponent';

const vscode = acquireVsCodeApi();

const SidebarComponent = () => {
    const [nodeVersions, setNodeVersions] = useState([]);
    const [filteredVersions, setFilteredVersions] = useState([]);
    const [os, setOs] = useState('');
    const [enableButtonVisible, setEnableButtonVisible] = useState(true);

    const [currentVersion, setCurrentVersion] = useState(null);

    const [enableButtonState, setEnableButtonState] = useState(null);
    const [nvmState, setNvmState] = useState(false);

    useEffect(() => {
        verifyNvmIsInstalled();
        getCurrentOS();
        getCurrentNodeVersion();
        getNodeVersionList();

        const handleMessage = event => {

            const message = event.data;

            switch (message.type) {
                case 'receive-os':

                    setOs(message.data);

                    if (message.data === "linux" || message.data === "darwin") {
                        setEnableButtonVisible(false);
                    } else {
                        setEnableButtonState(true);
                    }

                    break;
                case 'receive-list':

                    setNodeVersions(message.data);

                    break;
                case 'receive-current':

                    setCurrentVersion(message.data);

                    if (message.data.includes('No current version')) {
                        setNvmState(false);
                    } else {
                        setNvmState(true);
                    }

                    console.log(message.data);

                    console.log(nvmState);

                    setFilteredVersions(prev => prev.map(version =>
                        version.name === message.data ? { ...version, current: true } : version));

                    break;


                case 'receive-use':

                    getCurrentNodeVersion();

                    setCurrentVersion(message.data);

                    break;

                case 'receive-uninstall':

                    setNodeVersions(prev => prev.filter(version => version !== message.data));

                    break;

                case 'receive-on':

                    getCurrentNodeVersion();

                    console.log("Receive on:", nvmState);

                    break;

                case 'receive-off':

                    console.log("Receive off:", nvmState);
                    getCurrentNodeVersion();

                    break;

                default:
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        setFilteredVersions(nodeVersions);
    }, [nodeVersions]);


    const toggleNVMState = () => {

        if (nvmState === true) {
            disableNvm();
        } else if (nvmState === false || nvmState === null) {
            enableNvm();
        }

    };

    return (
        <div className="container">
            <SearchBar setFilteredVersions={setFilteredVersions} allVersions={nodeVersions} type={"array"} />
            <div className="content">
                <h2 className="title">NODE VERSIONS</h2>
                <div id="item-list">
                    {filteredVersions.map((version, index) => (
                        <div className="node-item" key={index}>
                            <div className="node-item-content">
                                <span className="version">{version}</span>
                                <span
                                    className="tag current show"
                                    style={{ visibility: version === currentVersion ? 'visible' : 'hidden' }}
                                    onClick={toggleNVMState}
                                >Current</span>
                                <div className="options">
                                    <a className="action" onClick={() => useNodeVersion(version)}>
                                        <i className="codicon codicon-run"></i>
                                    </a>
                                    <a className="action" onClick={() => uninstallNodeVersion(version)}>
                                        <i className="codicon codicon-close"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="footer" id="footer">
                <div className="footer-item" id="enable-button" style={{ visibility: enableButtonVisible === true ? 'visible' : 'hidden' }} onClick={toggleNVMState}>
                    <div className="footer-item-content">
                        <i className={`codicon footer-icon ${nvmState ? 'codicon-sync on' : 'codicon-sync-ignored off'}`}></i>
                    </div>
                    <span className="footer-text">{nvmState ? 'ON' : 'OFF'}</span>
                </div>
                <a className="heart" href="https://jesus-alvarez-portfolio.web.app/">
                    <div className="footer-item">
                        <div className="footer-item-content">
                            <i className="codicon codicon-heart"></i>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
};

async function verifyNvmIsInstalled() {
    vscode.postMessage({ type: 'send-nvm' });
}

async function getCurrentOS() {
    vscode.postMessage({ type: 'send-os' });
}

async function getNodeVersionList() {
    vscode.postMessage({ type: 'send-list' });
}

async function getCurrentNodeVersion() {
    vscode.postMessage({ type: 'send-current' });
}

async function useNodeVersion(version) {
    vscode.postMessage({ type: 'send-use', data: version });
}

async function uninstallNodeVersion(version) {
    vscode.postMessage({ type: 'send-uninstall', data: version });
}

async function enableNvm() {
    vscode.postMessage({ type: 'send-on' });
}

async function disableNvm() {
    vscode.postMessage({ type: 'send-off' });
}

export default SidebarComponent;

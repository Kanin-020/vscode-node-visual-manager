import './CurrentVersionsBar.css';

import React, { useEffect, useMemo, useState } from 'react';

import CurrentVersionItem from '../CurrentVersionItem/CurrentVersionItem';
import SearchBar from '../SearchBar/SearchBar';

const vscode = acquireVsCodeApi();

const CurrentVersionsBar = () => {
  const [nodeVersions, setNodeVersions] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);

  const [currentVersionState, setCurrentVersionState] = useState(null);

  const [enableButtonVisible, setEnableButtonVisible] = useState(false);
  const [enableButtonState, setEnableButtonState] = useState(false);

  useEffect(() => {
    verifyNvmIsInstalled();
    getCurrentOS();
    getCurrentNodeVersion();
    getNodeVersionList();

    const handleMessage = event => {

      const message = event.data;

      switch (message.type) {
        case 'receive-os':

          if (message.data === 'win32') {
            setEnableButtonVisible(true);
          } else {
            setEnableButtonVisible(false);
          }

          break;
        case 'receive-list':

          setNodeVersions(message.data);

          break;
        case 'receive-current':

          if (message.data.includes('No current version')) {
            setEnableButtonState(false);
            setCurrentVersionState(null);
          } else {
            setCurrentVersionState(message.data);
            setEnableButtonState(true);
          }

          setFilteredVersions(prev => prev.map(version =>
            version.name === message.data ? { ...version, current: true } : version));

          break;


        case 'receive-use':

          getCurrentNodeVersion();

          setCurrentVersionState(message.data);

          break;

        case 'receive-uninstall':

          setNodeVersions(prev => prev.filter(version => version !== message.data));

          break;

        case 'receive-on':

          getCurrentNodeVersion();

          break;

        case 'receive-off':

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

    if (enableButtonState === true) {
      disableNvm();
    } else if (enableButtonState === false) {
      enableNvm();
    }

  };

  const renderedVersions = useMemo(() => {
    return filteredVersions.map((version, index) => (
      <CurrentVersionItem
        key={index} 
        version={version}
        currentVersionState={currentVersionState}
        useNodeVersion={useNodeVersion}
        uninstallNodeVersion={uninstallNodeVersion}
        toggleNVMState={toggleNVMState}
      />
    ));
  }, [filteredVersions, currentVersionState, useNodeVersion, uninstallNodeVersion, toggleNVMState]);


  return (
    <div className="container">
      <SearchBar setFilteredVersions={setFilteredVersions} allVersions={nodeVersions} type={"array"} />
      <div className="content">
        <h2 className="title">NODE VERSIONS</h2>
        <div id="item-list">
          {renderedVersions}
        </div>
      </div>
      <div className="footer" id="footer">
        <div className="footer-item" id="enable-button" style={{ visibility: enableButtonVisible === true ? 'visible' : 'hidden' }} onClick={toggleNVMState}>
          <div className="footer-item-content">
            <i className={`codicon footer-icon ${enableButtonState ? 'codicon-sync on' : 'codicon-sync-ignored off'}`}></i>
          </div>
          <span className="footer-text">{enableButtonState ? 'ON' : 'OFF'}</span>
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

export default React.memo(CurrentVersionsBar);

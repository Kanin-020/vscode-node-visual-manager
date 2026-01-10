import './CurrentVersionsBar.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CurrentVersionItem from '../CurrentVersionItem/CurrentVersionItem';
import SearchBar from '../SearchBar/SearchBar';

const vscode = acquireVsCodeApi();

const CurrentVersionsBar = () => {
  const [nodeVersions, setNodeVersions] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);
  const [currentVersionState, setCurrentVersionState] = useState(null);
  const [enableButtonState, setEnableButtonState] = useState(false);
  const [enableButtonVisible, setEnableButtonVisible] = useState(false);
  const [showCurrentLabel, setShowCurrentLabel] = useState(false);

  let isWin;

  useEffect(() => {
    getCurrentNodeVersion();
    getNodeVersionList();
    getOperativeSystem();

    const handleMessage = event => {
      const { type, data } = event.data;
      switch (type) {
        case 'receive-os':
          isWin = (data === 'win32');
          setEnableButtonVisible(isWin);
          setShowCurrentLabel(isWin);
          break;
        case 'receive-list':
          setNodeVersions(data);
          break;
        case 'receive-current':
          const isNoCurrentVersion = data.includes('No current version');
          setEnableButtonState(!isNoCurrentVersion);
          setCurrentVersionState(isNoCurrentVersion ? null : data);
          setFilteredVersions(prev => prev.map(version =>
            version.name === data ? { ...version, current: true } : version
          ));
          break;
        case 'receive-use':
        case 'receive-on':
        case 'receive-off':
          getCurrentNodeVersion();
          break;
        case 'receive-uninstall':
          setNodeVersions(prev => prev.filter(version => version !== data));
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

  const toggleNVMState = useCallback(() => {
    if (enableButtonState) {
      disableNvm();
    } else {
      enableNvm();
    }
  }, [enableButtonState]);

  const renderedVersions = useMemo(() => (
    filteredVersions.map((version, index) => (
      <CurrentVersionItem
        key={index}
        version={version}
        currentVersionState={currentVersionState}
        useNodeVersion={useNodeVersion}
        uninstallNodeVersion={uninstallNodeVersion}
        toggleNVMState={toggleNVMState}
        showCurrentLabel={showCurrentLabel}
      />
    ))
  ), [filteredVersions, currentVersionState, useNodeVersion, uninstallNodeVersion, toggleNVMState]);

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
        <div
          className="footer-item"
          id="enable-button"
          style={{ visibility: enableButtonVisible ? 'visible' : 'hidden' }}
          onClick={toggleNVMState}
        >
          <div className="footer-item-content">
            <i className={`codicon footer-icon ${enableButtonState ? 'codicon-sync on' : 'codicon-sync-ignored off'}`}></i>
          </div>
          <span className="footer-text">{enableButtonState ? 'ON' : 'OFF'}</span>
        </div>
        <a className="account" href="https://jesus-alvarez-portfolio.web.app/">
          <div className="footer-item">
            <div className="footer-item-content">
              <i className="codicon codicon-account"></i>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};

async function getOperativeSystem() {
  vscode.postMessage({ type: 'send-os' });
}

async function getCurrentNodeVersion() {
  vscode.postMessage({ type: 'send-current' });
}

async function getNodeVersionList() {
  vscode.postMessage({ type: 'send-list' });
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

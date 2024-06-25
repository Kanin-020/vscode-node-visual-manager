import './AvailableBar.css';

import React, { useEffect, useState } from 'react';

import SearchBar from '../SearchBar/SearchBar';

const vscode = acquireVsCodeApi();

const AvailableBar = () => {
  const [nodeVersions, setNodeVersions] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);

  useEffect(() => {

    getNodeVersionAvailableList();

    const handleMessage = (event) => {

      const message = event.data;

      if (message.type === 'receive-list-available') {

        setNodeVersions(message.data);

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

  return (
    <div className="container">
      <SearchBar setFilteredVersions={setFilteredVersions} allVersions={nodeVersions} type={"object"} />
      <div className="content">
        <h2 className="title">AVAILABLE VERSIONS</h2>
        <div id="item-list">
          {filteredVersions.map((item, index) => (
            <div className="node-item" key={index}>
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
          ))}
        </div>
      </div>
    </div >
  );
};

async function getNodeVersionAvailableList() {
  vscode.postMessage({ type: 'send-list-available' });
}

async function installNodeVersion(version) {
  vscode.postMessage({ type: 'send-install', data: version });
}

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

export default AvailableBar;

import React, { useEffect, useState } from 'react';

const vscode = acquireVsCodeApi();

const AvailableComponent = () => {
  const [nodeVersions, setNodeVersions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleMessage = event => {
      const message = event.data;
      if (message.type === 'receive-list-available') {
        setNodeVersions(message.data);
      }
    };

    // window.addEventListener('message', handleMessage);

    vscode.postMessage({ type: 'send-list-available' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleInstall = (version) => {
    vscode.postMessage({ type: 'send-install', data: version });
  };

  const filteredVersions = nodeVersions.filter(version =>
    version.version.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
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

      <div className="content">
        <h2 className="title">NODE VERSIONS</h2>
        <div id="item-list">
          {filteredVersions.map((item, index) => (
            <div key={index} className="node-item" id={`v${item.version.replace(/\./g, '_')}`}>
              <div className="node-item-content">
                <span className="version">{item.version}</span>
                <span className={`tag ${getTagClass(item.type)}`}>{item.type}</span>
                <div className="options">
                  <a className="action" onClick={() => handleInstall(item.version)}>
                    <i className="codicon codicon-cloud-download"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getTagClass = (type) => {
  switch (type) {
    case 'Current':
      return 'remote';
    case 'LTS':
      return 'lts';
    case 'Old Stable':
      return 'old-stable';
    case 'Old Unstable':
      return 'old-unstable';
    case 'Common':
      return 'remote';
    default:
      return '';
  }
};

export default AvailableComponent;

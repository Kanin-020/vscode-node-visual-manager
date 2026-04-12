import './AvailableVersionsBar.css';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import AvailableVersionItem from '../AvailableVersionItem/AvailableVersionItem';
import SearchBar from '../SearchBar/SearchBar';

const vscode = acquireVsCodeApi();

const AvailableVersionsBar = () => {
  const [nodeVersions, setNodeVersions] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);
  const [canInstallFromSource, setCanInstallFromSource] = useState(false);

  useEffect(() => {
    getNodeVersionAvailableList();
    getUIState();

    const handleMessage = (event) => {
      const message = event.data;
      if (message.type === 'receive-list-available') {
        setNodeVersions(message.data);
      } else if (message.type === 'receive-ui-state') {
        setCanInstallFromSource(message.data.canInstallFromSource);
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

  const installNodeVersion = useCallback(async (version) => {
    vscode.postMessage({ type: 'send-install', data: version });
  }, []);

  const installNodeFromSource = useCallback(async (version) => {
    vscode.postMessage({ type: 'send-install-source', data: version });
  }, []);

  const renderedVersions = useMemo(() => {
    return filteredVersions.map((item, index) => (
      <AvailableVersionItem
        key={index}
        item={item}
        installNodeVersion={installNodeVersion}
        installNodeFromSource={installNodeFromSource}
        canInstallFromSource={canInstallFromSource}
      />
    ));
  }, [filteredVersions, installNodeVersion, canInstallFromSource]);

  return (
    <div className="container">
      <SearchBar setFilteredVersions={setFilteredVersions} allVersions={nodeVersions} type={"object"} />
      <div className="content">
        <h2 className="title">AVAILABLE VERSIONS</h2>
        <div id="item-list">
          {renderedVersions}
        </div>
      </div>
    </div>
  );
};

async function getNodeVersionAvailableList() {
  vscode.postMessage({ type: 'send-list-available' });
}

async function getUIState() {
  vscode.postMessage({ type: 'send-ui-state' });
}

export default React.memo(AvailableVersionsBar);

import './CurrentVersionsBar.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import CurrentVersionItem from '../CurrentVersionItem/CurrentVersionItem';
import SearchBar from '../SearchBar/SearchBar';

interface CurrentState {
    nodeVersions: string[];
    filteredVersions: string[];
    currentVersionState: string | null;
    enableButtonState: boolean;
    enableButtonVisible: boolean;
    showCurrentLabel: boolean;
}

const vscode = acquireVsCodeApi();

const CurrentVersionsBar: React.FC = () => {
    const savedState = vscode.getState() as CurrentState | undefined;

    const [nodeVersions, setNodeVersions] = useState<string[]>(savedState?.nodeVersions ?? []);
    const [filteredVersions, setFilteredVersions] = useState<string[]>(
        savedState?.filteredVersions ?? [],
    );
    const [currentVersionState, setCurrentVersionState] = useState<string | null>(
        savedState?.currentVersionState ?? null,
    );
    const [enableButtonState, setEnableButtonState] = useState(
        savedState?.enableButtonState ?? false,
    );
    const [enableButtonVisible, setEnableButtonVisible] = useState(
        savedState?.enableButtonVisible ?? false,
    );
    const [showCurrentLabel, setShowCurrentLabel] = useState(savedState?.showCurrentLabel ?? false);

    /** Persist state across webview recreations via vscode.setState. */
    useEffect(() => {
        vscode.setState({
            nodeVersions,
            filteredVersions,
            currentVersionState,
            enableButtonState,
            enableButtonVisible,
            showCurrentLabel,
        });
    }, [
        nodeVersions,
        filteredVersions,
        currentVersionState,
        enableButtonState,
        enableButtonVisible,
        showCurrentLabel,
    ]);

    useEffect(() => {
        getCurrentNodeVersion();
        getNodeVersionList();
        getUIState();

        const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            switch (type) {
                case 'receive-ui-state':
                    setEnableButtonVisible(data.canToggleNvm);
                    setShowCurrentLabel(data.showCurrentLabel);
                    break;
                case 'receive-list':
                    setNodeVersions(data);
                    break;
                case 'receive-current': {
                    const isNoCurrentVersion = (data as string).includes('No current version');
                    setCurrentVersionState(isNoCurrentVersion ? null : data);
                    break;
                }
                case 'receive-status':
                    setEnableButtonState(data as boolean);
                    break;
                case 'receive-use':
                    getCurrentNodeVersion();
                    break;
                case 'receive-on':
                    setEnableButtonState(true);
                    getCurrentNodeVersion();
                    break;
                case 'receive-off':
                    setEnableButtonState(false);
                    getCurrentNodeVersion();
                    break;
                case 'receive-uninstall':
                    setNodeVersions((prev) => prev.filter((version) => version !== data));
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

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setFilteredVersions(nodeVersions);
    }, [nodeVersions]);

    const toggleNVMState = useCallback(() => {
        if (enableButtonState) {
            disableNvm();
        } else {
            enableNvm();
        }
    }, [enableButtonState]);

    const renderedVersions = useMemo(
        () =>
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
            )),
        [
            filteredVersions,
            currentVersionState,
            useNodeVersion,
            uninstallNodeVersion,
            toggleNVMState,
        ],
    );

    return (
        <div className="container">
            <SearchBar
                onSearch={(term) => {
                    if (!term) {
                        setFilteredVersions(nodeVersions);
                    } else {
                        const matched = nodeVersions.filter((v) => matchesVersion(v, term));
                        setFilteredVersions(sortByRelevance(matched));
                    }
                }}
            />
            <div className="content">
                <h2 className="title">NODE VERSIONS</h2>
                <div id="item-list">{renderedVersions}</div>
            </div>
            <div className="footer" id="footer">
                <div
                    className="footer-item"
                    id="enable-button"
                    style={{ visibility: enableButtonVisible ? 'visible' : 'hidden' }}
                    onClick={toggleNVMState}
                >
                    <div className="footer-item-content">
                        <i
                            className={`codicon footer-icon ${enableButtonState ? 'codicon-sync on' : 'codicon-sync-ignored off'}`}
                        ></i>
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

async function getCurrentNodeVersion(): Promise<void> {
    vscode.postMessage({ type: 'send-current' });
}

async function getNodeVersionList(): Promise<void> {
    vscode.postMessage({ type: 'send-list' });
}

async function getUIState(): Promise<void> {
    vscode.postMessage({ type: 'send-ui-state' });
}

async function useNodeVersion(version: string): Promise<void> {
    vscode.postMessage({ type: 'send-use', data: version });
}

async function uninstallNodeVersion(version: string): Promise<void> {
    vscode.postMessage({ type: 'send-uninstall', data: version });
}

async function enableNvm(): Promise<void> {
    vscode.postMessage({ type: 'send-on' });
}

async function disableNvm(): Promise<void> {
    vscode.postMessage({ type: 'send-off' });
}

/**
 * Checks if a version string matches a search term as a prefix.
 * E.g. '2' matches '2.0.0', '20.0.0', and '200.0.0'.
 */
function matchesVersion(version: string, term: string): boolean {
    const v = version.startsWith('v') ? version.slice(1) : version;
    const t = term.startsWith('v') ? term.slice(1) : term;
    return v.startsWith(t);
}

/**
 * Sorts versions so shorter prefix matches come first.
 * E.g. searching '2' → ['2.0.0', '2.1.0', '20.0.0', '200.0.0']
 */
function sortByRelevance(versions: string[]): string[] {
    return [...versions].sort((a, b) => {
        const va = a.startsWith('v') ? a.slice(1) : a;
        const vb = b.startsWith('v') ? b.slice(1) : b;
        return va.length - vb.length || va.localeCompare(vb);
    });
}

export default React.memo(CurrentVersionsBar);

import './AvailableVersionsBar.css';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Version } from '@core/types/version';
import AvailableVersionItem from '../AvailableVersionItem/AvailableVersionItem';
import SearchBar from '../SearchBar/SearchBar';

interface AvailableState {
    nodeVersions: Version[];
    filteredVersions: Version[];
    canInstallFromSource: boolean;
}

const vscode = acquireVsCodeApi();

const AvailableVersionsBar: React.FC = () => {
    const savedState = vscode.getState() as AvailableState | undefined;

    const [nodeVersions, setNodeVersions] = useState<Version[]>(savedState?.nodeVersions ?? []);
    const [filteredVersions, setFilteredVersions] = useState<Version[]>(
        savedState?.filteredVersions ?? [],
    );
    const [canInstallFromSource, setCanInstallFromSource] = useState(
        savedState?.canInstallFromSource ?? false,
    );

    /** Persist state across webview recreations via vscode.setState. */
    useEffect(() => {
        vscode.setState({
            nodeVersions,
            filteredVersions,
            canInstallFromSource,
        });
    }, [nodeVersions, filteredVersions, canInstallFromSource]);

    useEffect(() => {
        getNodeVersionAvailableList();
        getUIState();

        const handleMessage = (event: MessageEvent) => {
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

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setFilteredVersions(nodeVersions);
    }, [nodeVersions]);

    const installNodeVersion = useCallback(async (version: string) => {
        vscode.postMessage({ type: 'send-install', data: version });
    }, []);

    const installNodeFromSource = useCallback(async (version: string) => {
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
            <SearchBar
                onSearch={(term) => {
                    if (!term) {
                        setFilteredVersions(nodeVersions);
                    } else {
                        const matched = nodeVersions.filter(
                            (item) =>
                                matchesVersion(item.version, term) ||
                                item.releaseType.toLowerCase().startsWith(term),
                        );
                        setFilteredVersions(sortByRelevance(matched));
                    }
                }}
            />
            <div className="content">
                <h2 className="title">AVAILABLE VERSIONS</h2>
                <div id="item-list">{renderedVersions}</div>
            </div>
        </div>
    );
};

async function getNodeVersionAvailableList(): Promise<void> {
    vscode.postMessage({ type: 'send-list-available' });
}

async function getUIState(): Promise<void> {
    vscode.postMessage({ type: 'send-ui-state' });
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
function sortByRelevance(versions: Version[]): Version[] {
    return [...versions].sort((a, b) => {
        const va = a.version.startsWith('v') ? a.version.slice(1) : a.version;
        const vb = b.version.startsWith('v') ? b.version.slice(1) : b.version;
        return va.length - vb.length || va.localeCompare(vb);
    });
}

export default React.memo(AvailableVersionsBar);

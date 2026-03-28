import { nvmPort } from '@core/nvm/nvm.port';
import { ActionResponse, AvailableVersionListResponse, CurrentVersionListResponse, CurrentVersionResponse } from '@core/types/response';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { Version } from '../types/version';
import path from 'node:path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

const terminals: Map<string, vscode.Terminal> = new Map();

const nvmLinux: nvmPort = {
    getCurrentNodeVersion,
    getInstalledVersionList,
    getAvailableVersionList,
    useVersion,
    useVersionFromProject,
    install,
    uninstall,
};

async function getCurrentNodeVersion(): Promise<CurrentVersionResponse> {

    try {

        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm current"');

        if (stdout.includes('No current version')) {
            return { currentNodeVersion: stdout };
        }

        let currentVersion = stdout.replace('v', '');

        currentVersion = currentVersion.trim();

        if (stderr) {
            throw new Error(stderr);
        }

        return { currentNodeVersion: currentVersion };

    } catch (error) {
        console.error(error);
        return { error };
    }

}


async function getInstalledVersionList(): Promise<CurrentVersionListResponse> {

    try {

        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm list"');

        if (stderr) {
            throw new Error(stderr);
        }

        const defaultIndex: number = stdout.indexOf("default");

        const filteredList: string = defaultIndex !== -1 ? stdout.slice(0, defaultIndex + 1) : stdout;

        const regex: RegExp = /(\d+\.\d+\.\d+|system)/g;

        const versionList: string[] = filteredList.match(regex) ?? [];

        const sortedVersionList: string[] = sortVersionList(versionList);

        return { nodeList: sortedVersionList };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function getAvailableVersionList(): Promise<AvailableVersionListResponse> {

    try {

        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm ls-remote"');

        if (stderr) {
            throw new Error(stderr);
        }

        const lines: string[] = stdout.split('\n');

        const currentVersions: Version[] = [];
        const ltsVersions: Version[] = [];

        const versionRegex: RegExp = /(\d+\.\d+\.\d+)/g;

        const availableVersionList: Version[] = [];

        const noVersionAvailable: string = "N/A";

        lines.forEach(line => {

            let element: Version;

            if (line !== '') {

                if (line.includes('LTS')) {
                    const match = line.match(versionRegex);
                    const version = match ?? noVersionAvailable;


                    element = { version: version?.[0], type: 'LTS' };

                } else {
                    const match = line.match(versionRegex);
                    const version = match ?? noVersionAvailable;

                    element = { version: version?.[0], type: 'Current' };

                }

                availableVersionList.push(element);
            }

        });

        availableVersionList.forEach((version: Version) => {

            switch (version.type) {
                case 'Current':
                    currentVersions.push(version);
                    break;
                case 'LTS':
                    ltsVersions.push(version);
                    break;
                default:
                    break;
            }


        });

        const sortedLtsVersions: Version[] = [...ltsVersions].sort((a, b) => sortRemoteVersionList(a.version, b.version));

        const sortedCurrentVersions: Version[] = [...currentVersions].sort((a, b) => sortRemoteVersionList(a.version, b.version));

        const sortedVersionList: Version[] = [...sortedLtsVersions, ...sortedCurrentVersions];

        return { nodeList: sortedVersionList };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function install(version: string): Promise<ActionResponse> {
    try {
        const { stdout, stderr } = await execAsync(
            `bash -c "source ~/.nvm/nvm.sh && nvm cache clear && nvm install ${version}"`
        );

        if (!stderr.includes('Checksums matched!')) {
            throw new Error(stderr);
        }

        return { message: stdout, id: version };
    } catch (error) {
        return { error };
    }
}

async function uninstall(version: string): Promise<ActionResponse> {

    try {

        const { stdout, stderr } = await execAsync(`bash -c "source ~/.nvm/nvm.sh && nvm cache clear && nvm uninstall ${version}"`);

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout, id: version };

    } catch (error) {
        console.error(error);
        return { error };
    }

}

//TODO
async function useVersion(version: string): Promise<ActionResponse> {
    try {
        let terminal = terminals.get(version);

        if (!terminal) {
            terminal = vscode.window.createTerminal({
                name: `Node ${version}`,
                shellPath: 'bash',
                shellArgs: ['-c', `source ~/.nvm/nvm.sh && nvm use ${version} && exec bash`]
            });
            terminals.set(version, terminal);
        }

        terminal.show(true);
        terminal.sendText(`source ~/.nvm/nvm.sh && nvm use ${version}`, true);

        return {
            message: `Now using node ${version}`,
            id: version
        };
    } catch (error) {
        return { error };
    }
}

async function useVersionFromProject(projectPath: string): Promise<ActionResponse> {
    const nvmrcPath = path.join(projectPath, '.nvmrc');

    try {
        const version = (await fs.readFile(nvmrcPath, 'utf-8')).trim();

        await install(version);

        return useVersion(version);

    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return { error: '.nvmrc not found, using the current version of Node' };
        }
        return { error: err };
    }
}

function sortRemoteVersionList(versionA: string, versionB: string) {
    const aParts = versionA.split('.').map(Number);
    const bParts = versionB.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;

        if (aPart > bPart) {
            return -1;
        }
        if (aPart < bPart) {
            return 1;
        }
    }
    return 0;
}

function sortVersionList(array: string[]) {

    return array.sort(function (versionA: string, versionB: string) {
        if (versionA === "system") {
            return 1;
        }
        if (versionB === "system") {
            return -1;
        }
        if (versionA > versionB) {
            return -1;
        }
        if (versionA < versionB) {
            return 1;
        }
        return 0;
    });

}

export default nvmLinux;

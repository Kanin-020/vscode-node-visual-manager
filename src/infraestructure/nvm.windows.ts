import { nvmAdapter } from '../core/nvm.adapter';
import { CurrentVersionListResponse, ActionResponse, StatusResponse, AvailableVersionListResponse, CurrentVersionResponse } from '../core/nvm.response';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Version } from './interfaces/version';

const execAsync = promisify(exec);

const nvmWindows: nvmAdapter = {
    getCurrentNodeVersion,
    getInstalledVersionList,
    getAvailableVersionList,
    install,
    uninstall,
    useVersion,
    enable,
    disable,
};

async function getCurrentNodeVersion(): Promise<CurrentVersionResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm current');

        if (stdout.includes('No current version')) {
            return { currentNodeVersion: stdout };
        }

        let currentVersion: string = stdout.replace('v', '');

        currentVersion = currentVersion.trim();

        if (stderr) {
            throw new Error(stderr);
        }

        return { currentNodeVersion: currentVersion };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function getInstalledVersionList(): Promise<CurrentVersionListResponse> {
    try {
        const { stdout, stderr } = await execAsync('nvm list');

        if (stderr) {
            throw new Error(stderr);
        }

        const versionList: string[] = stdout.match(/\b\d+\.\d+\.\d+\b/g) ?? [];

        return { nodeList: versionList };
    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }
}

async function getAvailableVersionList(): Promise<AvailableVersionListResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm list available');

        if (stderr) {
            throw new Error(stderr);
        }

        const lines = stdout.split('\n');

        const filteredLines: string[] = [];

        const availableVersionList: Version[] = [];

        lines.forEach(line => {
            if (line.includes('|') && !line.includes('-') && !line.includes('CURRENT') && !line.includes('LTS') && !line.includes('OLD STABLE') && !line.includes('OLD UNSTABLE')) {
                filteredLines.push(line);
            }
        });

        filteredLines.forEach((line: string) => {

            const cleanLine: string = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '');

            const versions = cleanLine.split("|").map((version: string) => {
                return version.trim();
            });

            const current: Version = { version: versions[0], type: 'Current' };
            const lts: Version = { version: versions[1], type: 'LTS' };
            const stable: Version = { version: versions[2], type: 'Old Stable' };
            const unstable: Version = { version: versions[3], type: 'Old Unstable' };

            availableVersionList.push(current);
            availableVersionList.push(lts);
            availableVersionList.push(stable);
            availableVersionList.push(unstable);

        });

        const currentVersions: Version[] = [];

        const ltsVersions: Version[] = [];

        const oldStableVersions: Version[] = [];

        const oldUnstableVersions: Version[] = [];

        availableVersionList.forEach((version: Version) => {

            switch (version.type) {
                case 'Current':
                    currentVersions.push(version);
                    break;
                case 'LTS':
                    ltsVersions.push(version);
                    break;
                case 'Old Stable':
                    oldStableVersions.push(version);
                    break;
                case 'Old Unstable':
                    oldUnstableVersions.push(version);
                    break;

                default:
                    break;
            }


        });

        const sortedVersionList: Version[] = [...ltsVersions, ...currentVersions, ...oldStableVersions, ...oldUnstableVersions];

        return { nodeList: sortedVersionList };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function install(version: string): Promise<ActionResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm install ' + version);

        if (stderr) {
            throw new Error(stderr);
        }

        let lines: string[] = stdout.split('\n');

        lines.shift();
        lines.shift();

        let index = lines.findIndex(linea => linea.startsWith('Installation complete.'));

        lines.splice(index);

        let message: string = lines.join('\n');

        return { message: message, id: version };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function uninstall(version: string): Promise<ActionResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm uninstall ' + version);

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout, id: version };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function useVersion(version: string): Promise<ActionResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm use ' + version);

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout, id: version };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}


async function enable(): Promise<StatusResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm on');

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

async function disable(): Promise<StatusResponse> {

    try {

        const { stdout, stderr } = await execAsync('nvm off');

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout };

    } catch (error) {
        console.error(error);
        return { error: new Error(String(error)) };
    }

}

export default nvmWindows;

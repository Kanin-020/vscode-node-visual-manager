import { exec } from 'child_process';
import { promisify } from 'util';
import { NvmResponse } from '@interfaces/nvmResponse';
import { nvmAdapter } from '@interfaces/nvm';

const execAsync = promisify(exec);

const nvmLinux: nvmAdapter = {
    currentNodeVersion: '10',
    getInstalledVersionList,
    getAvailableVersionList,
    getCurrentNodeVersion,
    install,
    uninstall,
    useVersion,
};

async function getInstalledVersionList() {

    try {

        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm list"');

        if (stderr) {
            throw new Error(stderr);
        }

        const defaultIndex = stdout.indexOf("default");

        const filteredList = defaultIndex !== -1 ? stdout.slice(0, defaultIndex + 1) : stdout;

        const regex = /(\d+\.\d+\.\d+|system)/g;

        const versionList = filteredList.match(regex);

        const sortedVersionList = sortVersionList(versionList);

        return { nodeList: sortedVersionList };

    } catch (error) {
        console.error(error);
        return { error };
    }

}

async function getAvailableVersionList() {

    try {

        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm ls-remote"');

        if (stderr) {
            throw new Error(stderr);
        }

        const lines = stdout.split('\n');

        const currentVersions: any = [];
        const ltsVersions: any = [];

        const versionRegex = /(\d+\.\d+\.\d+)/g;

        const availableVersionList: any = [];

        lines.forEach(line => {

            let element;

            if (line !== '') {

                if (line.includes('LTS')) {
                    const version = line.match(versionRegex);
                    element = { version: version?.[0], type: 'LTS' };

                } else {
                    const version = line.match(versionRegex);
                    element = { version: version?.[0], type: 'Current' };

                }

                availableVersionList.push(element);
            }

        });

        availableVersionList.forEach((version: any) => {

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

        const sortedLtsVersions = [...ltsVersions].sort((a, b) => sortRemoteVersionList(a.version, b.version));

        const sortedCurrentVersions = [...currentVersions].sort((a, b) => sortRemoteVersionList(a.version, b.version));

        const sortedVersionList = [...sortedLtsVersions, ...sortedCurrentVersions];

        return { nodeRemoteList: sortedVersionList };

    } catch (error) {
        console.error(error);
        return { error };
    }

}

async function getCurrentNodeVersion() {

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


async function install(version: string): Promise<NvmResponse> {
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

async function uninstall(version: string): Promise<NvmResponse> {

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

async function useVersion(version: string): Promise<NvmResponse> {

    try {

        const { stdout, stderr } = await execAsync(`bash -c "source ~/.nvm/nvm.sh && nvm alias default ${version}"`);

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout, id: version };

    } catch (error) {
        console.error(error);
        return { error };
    }

}

function sortRemoteVersionList(a: any, b: any) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

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

function sortVersionList(array: any) {

    return array.sort(function (a: any, b: any) {
        if (a === "system") {
            return 1;
        }
        if (b === "system") {
            return -1;
        }
        if (a > b) {
            return -1;
        }
        if (a < b) {
            return 1;
        }
        return 0;
    });

}

export default nvmLinux;

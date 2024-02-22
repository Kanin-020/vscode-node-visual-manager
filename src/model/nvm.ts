import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const nvm = {
    verifyNvmIsInstalled,
    getNodeVersionList,
    getNodeVersionAvailableList,
    getCurrentNodeVersion,
    installNodeVersion,
    uninstallNodeVersion,
    useNodeVersion,
    enableNVM,
    disableNVM,
};

async function verifyNvmIsInstalled() {

    try {

        const { stdout, stderr } = await execAsync('nvm --version');

        if (stderr) {
            return false;
        }

        if (stdout) {
            return true;
        }

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function getNodeVersionList() {

    try {

        const { stdout } = await execAsync('nvm list');

        const versionRegex = /\b\d+\.\d+\.\d+\b/g;

        const versionList = stdout.match(versionRegex);

        return versionList;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function getNodeVersionAvailableList() {

    try {
        const { stdout, stderr } = await execAsync('nvm list available');

        if (stderr) {
            return;
        }

        const lines = stdout.split('\n');

        const filteredLines: any = [];

        const availableVersionList: any = [];

        lines.forEach(line => {
            if (line.includes('|') && !line.includes('-') && !line.includes('CURRENT') && !line.includes('LTS') && !line.includes('OLD STABLE') && !line.includes('OLD UNSTABLE')) {
                filteredLines.push(line);
            }
        });

        filteredLines.forEach((line: any) => {

            const cleanLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '');

            const versions = cleanLine.split("|").map((version: any) => {
                return version.trim();
            });

            const current = { version: versions[0], type: 'Current' };
            const lts = { version: versions[1], type: 'LTS' };
            const stable = { version: versions[2], type: 'Old Stable' };
            const unstable = { version: versions[3], type: 'Old Unstable' };

            availableVersionList.push(current);
            availableVersionList.push(lts);
            availableVersionList.push(stable);
            availableVersionList.push(unstable);

        });

        const currentVersions: any = [];

        const ltsVersions: any = [];

        const oldStableVersions: any = [];

        const oldUnstableVersions: any = [];

        availableVersionList.forEach((version: any) => {

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

        const sortedVersionList = [...currentVersions, ...ltsVersions, ...oldStableVersions, ...oldUnstableVersions];

        return sortedVersionList;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

getNodeVersionAvailableList();

async function installNodeVersion(version: string) {

    try {
        const { stdout } = await execAsync('nvm install ' + version);

        return { message: stdout, id: version };

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function uninstallNodeVersion(version: string) {

    try {

        const { stdout } = await execAsync('nvm uninstall ' + version);

        return { message: stdout, id: version };

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function useNodeVersion(version: string) {

    try {

        const { stdout, stderr } = await execAsync('nvm use ' + version);

        if (stderr) {
            return;
        }

        return { message: stdout, id: version };

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function getCurrentNodeVersion() {

    try {

        const { stdout, stderr } = await execAsync('nvm current');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function enableNVM() {

    try {

        const { stdout, stderr } = await execAsync('nvm on');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function disableNVM() {

    try {

        const { stdout, stderr } = await execAsync('nvm off');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

export default nvm;

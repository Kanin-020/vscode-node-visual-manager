"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const nvmWindows = {
    getNodeVersionList,
    getNodeVersionAvailableList,
    getCurrentNodeVersion,
    installNodeVersion,
    uninstallNodeVersion,
    useNodeVersion,
    enableNVM,
    disableNVM,
};
async function getNodeVersionList() {
    try {
        const { stdout, stderr } = await execAsync('nvm list');
        if (stderr) {
            throw new Error(stderr);
        }
        const versionRegex = /\b\d+\.\d+\.\d+\b/g;
        const versionList = stdout.match(versionRegex);
        return { nodeList: versionList };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function getNodeVersionAvailableList() {
    try {
        const { stdout, stderr } = await execAsync('nvm list available');
        if (stderr) {
            throw new Error(stderr);
        }
        const lines = stdout.split('\n');
        const filteredLines = [];
        const availableVersionList = [];
        lines.forEach(line => {
            if (line.includes('|') && !line.includes('-') && !line.includes('CURRENT') && !line.includes('LTS') && !line.includes('OLD STABLE') && !line.includes('OLD UNSTABLE')) {
                filteredLines.push(line);
            }
        });
        filteredLines.forEach((line) => {
            const cleanLine = line.replace(/^\s*\|\s*|\s*\|\s*$/g, '');
            const versions = cleanLine.split("|").map((version) => {
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
        const currentVersions = [];
        const ltsVersions = [];
        const oldStableVersions = [];
        const oldUnstableVersions = [];
        availableVersionList.forEach((version) => {
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
        const sortedVersionList = [...ltsVersions, ...currentVersions, ...oldStableVersions, ...oldUnstableVersions];
        return { nodeRemoteList: sortedVersionList };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function getCurrentNodeVersion() {
    try {
        const { stdout, stderr } = await execAsync('nvm current');
        if (stdout.includes('No current version')) {
            return { currentNodeVersion: stdout };
        }
        let currentVersion = stdout.replace('v', '');
        currentVersion = currentVersion.trim();
        if (stderr) {
            throw new Error(stderr);
        }
        return { currentNodeVersion: currentVersion };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function installNodeVersion(version) {
    try {
        const { stdout, stderr } = await execAsync('nvm install ' + version);
        if (stderr) {
            throw new Error(stderr);
        }
        let lines = stdout.split('\n');
        lines.shift();
        lines.shift();
        let index = lines.findIndex(linea => linea.startsWith('Installation complete.'));
        lines.splice(index);
        let message = lines.join('\n');
        return { message: message, id: version };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function uninstallNodeVersion(version) {
    try {
        const { stdout, stderr } = await execAsync('nvm uninstall ' + version);
        if (stderr) {
            throw new Error(stderr);
        }
        return { message: stdout, id: version };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function useNodeVersion(version) {
    try {
        const { stdout, stderr } = await execAsync('nvm use ' + version);
        if (stderr) {
            throw new Error(stderr);
        }
        return { message: stdout, id: version };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function enableNVM() {
    try {
        const { stdout, stderr } = await execAsync('nvm on');
        if (stderr) {
            throw new Error(stderr);
        }
        return { message: stdout };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function disableNVM() {
    try {
        const { stdout, stderr } = await execAsync('nvm off');
        if (stderr) {
            throw new Error(stderr);
        }
        return { message: stdout };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
exports.default = nvmWindows;
//# sourceMappingURL=nvmWindows.js.map
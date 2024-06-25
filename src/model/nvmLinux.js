"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const nvmLinux = {
    getNodeVersionList,
    getNodeVersionAvailableList,
    getCurrentNodeVersion,
    installNodeVersion,
    uninstallNodeVersion,
    useNodeVersion,
};
async function getNodeVersionList() {
    try {
        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm list"');
        if (stderr) {
            throw new Error(stderr);
        }
        const defaultIndex = stdout.indexOf("default");
        const filteredList = defaultIndex !== -1 ? stdout.slice(0, defaultIndex + 1) : stdout;
        const regex = /(\d+\.\d+\.\d+|system)/g;
        const versionList = filteredList.match(regex);
        return { nodeList: versionList };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function getNodeVersionAvailableList() {
    try {
        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm ls-remote"');
        if (stderr) {
            throw new Error(stderr);
        }
        const lines = stdout.split('\n');
        const commonVersions = [];
        const ltsVersions = [];
        const versionRegex = /(\d+\.\d+\.\d+)/g;
        const availableVersionList = [];
        lines.forEach(line => {
            let element;
            if (line.includes('LTS')) {
                const version = line.match(versionRegex);
                element = { version: version?.[0], type: 'LTS' };
            }
            else {
                const version = line.match(versionRegex);
                element = { version: version?.[0], type: 'Common' };
            }
            availableVersionList.push(element);
        });
        availableVersionList.forEach((version) => {
            switch (version.type) {
                case 'Common':
                    commonVersions.push(version);
                    break;
                case 'LTS':
                    ltsVersions.push(version);
                    break;
                default:
                    break;
            }
        });
        const sortedVersionList = [...ltsVersions, ...commonVersions];
        return { nodeRemoteList: sortedVersionList };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function getCurrentNodeVersion() {
    try {
        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm current"');
        if (stderr) {
            throw new Error(stderr);
        }
        return { currentNodeVersion: stdout };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function installNodeVersion(version) {
    try {
        const { stdout, stderr } = await execAsync(`bash -c "source ~/.nvm/nvm.sh && nvm cache clear && nvm install ${version}"`);
        if (!stderr.includes('Checksums matched!')) {
            throw new Error(stderr);
        }
        return { message: stdout, id: version };
    }
    catch (error) {
        console.error(error);
        return { error };
    }
}
async function uninstallNodeVersion(version) {
    try {
        const { stdout, stderr } = await execAsync(`bash -c "source ~/.nvm/nvm.sh && nvm cache clear && nvm uninstall ${version}"`);
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
        const { stdout, stderr } = await execAsync(`bash -c "source ~/.nvm/nvm.sh && nvm alias default ${version}"`);
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
exports.default = nvmLinux;
//# sourceMappingURL=nvmLinux.js.map
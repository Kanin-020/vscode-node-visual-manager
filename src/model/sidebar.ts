import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const nvm = {
    verifyNvmIsInstalled,
    getNodeVersionList,
    getNodeVersionRemoteList,
    installNodeVersion,
    uninstallNodeVersion,
    useNodeVersion,
    getCurrentNodeVersion,
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

async function getNodeVersionRemoteList() {

    try {
        const { stdout } = await execAsync('nvm list-remote');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function installNodeVersion(version: string) {

    try {
        const { stdout } = await execAsync('nvm install ' + version);

        return stdout;

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
            //Send message
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

export default nvm;

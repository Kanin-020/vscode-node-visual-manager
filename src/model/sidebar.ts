import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function verifyIsInstalled() {

    try {
        const { stdout } = await execAsync('fnm --version');

        if (stdout.includes('fnm')) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error; // O maneja el error de otra manera según tus necesidades
    }

}

export async function getNodeVersionList() {

    try {
        const { stdout } = await execAsync('fnm list');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error; // O maneja el error de otra manera según tus necesidades
    }

}

export async function getNodeRemoteList() {

    try {
        const { stdout } = await execAsync('fnm list-remote');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error; // O maneja el error de otra manera según tus necesidades
    }

}

export async function installNodeVersion(version: string) {

    try {
        const { stdout } = await execAsync('fnm install ' + version);

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error; // O maneja el error de otra manera según tus necesidades
    }

}

export async function uninstallNodeVersion(version: string) {

    try {

        const { stdout } = await execAsync('fnm uninstall ' + version);

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error; // O maneja el error de otra manera según tus necesidades
    }

}






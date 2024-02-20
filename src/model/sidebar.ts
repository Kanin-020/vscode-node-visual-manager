import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const fnm = {
    verifyIsInstalled,
    getNodeVersionList,
    getNodeVersionRemoteList,
    installNodeVersion,
    uninstallNodeVersion,
    useNodeVersion,
    changeNodeVersionAlias,
    unAliasNodeVersion,
    getCurrentNodeVersion,
    setDefaultNodeVersion,
};

async function verifyIsInstalled() {

    try {
        const { stdout } = await execAsync('fnm --version');

        if (stdout.includes('fnm')) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function getNodeVersionList() {

    try {
        const { stdout } = await execAsync('fnm list');

        let lineas = stdout.split('\n');

        let arrayResultante: any[] = [];

        lineas.forEach((linea) => {

            let partes = linea.replace('* ', '').split(' ');


            let tieneDefault = partes.includes('default');
            let alias = tieneDefault ? partes.slice(1, -1).join(' ') : partes.slice(1).join(' ');

            alias = alias.replace(',', '');

            let objeto = {
                version: partes[0],
                alias: alias,
                default: tieneDefault
            };


            arrayResultante.push(objeto);
        });

        return arrayResultante;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function getNodeVersionRemoteList() {

    try {
        const { stdout } = await execAsync('fnm list-remote');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function installNodeVersion(version: string) {

    try {
        const { stdout } = await execAsync('fnm install ' + version);

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function uninstallNodeVersion(version: string) {

    try {

        const { stdout } = await execAsync('fnm uninstall ' + version);

        return { message: stdout, id: version };

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function useNodeVersion(version: string) {

    try {

        const { stdout } = await execAsync('fnm use ' + version);

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function changeNodeVersionAlias(version: string, alias: string) {

    try {

        const { stdout } = await execAsync(`fnm alias ${version} ${alias}`);

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function unAliasNodeVersion(version: string) {

    try {

        const { stdout } = await execAsync('fnm alias ' + version);

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function getCurrentNodeVersion() {

    try {

        const { stdout } = await execAsync('powershell.exe -Command "fnm current"');

        return stdout;

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

async function setDefaultNodeVersion(version: string) {

    try {

        const { stdout } = await execAsync('fnm default ' + version);

        return { message: stdout, id: version };

    } catch (error) {
        console.error(`Error al ejecutar el comando: ${error}`);
        throw error;
    }

}

export default fnm;

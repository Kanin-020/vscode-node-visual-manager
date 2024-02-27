import { exec } from 'child_process';
import os from 'node:os';
import { promisify } from 'util';

const execAsync = promisify(exec);

const nvm = {
    verifyUserSystem,
    verifyNvmIsInstalled,
};

async function verifyUserSystem() {

    try {

        const operativeSystem = os.platform();

        return { operativeSystem: operativeSystem };

    } catch {
        return { operativeSystem: 'win32' };
    }

}

async function verifyNvmIsInstalled() {

    try {

        const systemResponse = await verifyUserSystem();

        switch (systemResponse.operativeSystem) {
            case 'win32':

                const win32 =  await execAsync('nvm --version');

                if (win32.stderr) {
                    return false;
                }

                if (win32.stdout) {
                    return true;
                }

                break;

            case 'linux':

                const linux = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm --version"');

                if (linux.stderr) {
                    return false;
                }

                if (linux.stdout) {
                    return true;
                }

            break;

            case 'darwin':

                const darwin = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm --version"');

                if (darwin.stderr) {
                    return false;
                }

                if (darwin.stdout) {
                    return true;
                }

            break;

            default:
                return false;
        }

    } catch (error) {
        console.error(error);
    }

}

export default nvm;

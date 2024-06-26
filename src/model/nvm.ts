import path, { join } from 'path';

import { exec } from 'child_process';
import fs from 'fs';
import os from 'node:os';
import { promisify } from 'util';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

const access = promisify(fs.access);

const nvm = {
    verifyUserSystem,
    verifyNvmIsInstalled,
    installNvmForWindows,
    installNvmForLinux,
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

                const { stdout, stderr } = await execAsync('nvm --version');

                if (stderr) {
                    return false;
                }

                if (stdout) {
                    return true;
                }

                break;

            case 'darwin':
            case 'linux':

                if (process.env.HOME) {

                    const nvmDir = process.env.NVM_DIR || path.join(process.env.HOME, '.nvm');

                    try {
                        await access(nvmDir);
                        return true;
                    } catch (err) {
                        return false;
                    }

                }

                break;


            default:
                return false;
        }

    } catch (error) {
        console.error(error);
    }

}

async function installNvmForWindows() {
    import('node-fetch').then(({ default: fetch }) => {

        const url = 'https://github.com/coreybutler/nvm-windows/releases/download/1.1.11/nvm-setup.exe';

        const tempFilePath = join(tmpdir(), 'nvm-setup.exe');

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.buffer();
            })
            .then(buffer => {

                require('fs').writeFileSync(tempFilePath, buffer);

                exec(tempFilePath, (error, stdout, stderr) => {
                    if (error) {
                        console.error(error.message);
                        return;
                    }

                });
            })
            .catch(error => {
                console.error(error.message);
            });
    });
}

async function installNvmForLinux() {
    
    const installScript = 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh';

    const commandCurl = `curl -o- ${installScript} | bash`;
    const commandWget = `wget -qO- ${installScript} | bash`;
    
    const sourceNvmScript = 'source ~/.nvm/nvm.sh';

    try {
        await execAsync('which curl');

        await execAsync(commandCurl);

    } catch (error) {

        try {

            await execAsync(commandWget);

        } catch (err) {

            console.error(err);

            return;
        }
    }

    try {
        
        await execAsync(sourceNvmScript);

    } catch (err) {
        console.error('Failed to load nvm:', err);
    }
}

export default nvm;

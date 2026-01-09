import os from 'node:os';
import nvmWindows from '@model/nvmWindows';
import nvmLinux from '@model/nvmLinux';
import { nvmAdapter } from '@interfaces/nvm';

class NVM {
    private static instance: NVM;
    private implementation: nvmAdapter;

    constructor() { }

    public static async getInstance(): Promise<NVM> {
        if (!NVM.instance) {
            NVM.instance = new NVM();
            await NVM.instance.init();
        }
        return NVM.instance;
    }

    async init() {

        const operativeSystem = os.platform();

        switch (operativeSystem) {
            case 'win32':
                this.implementation = nvmWindows;
                break;
            case 'linux':
            case 'darwin':
                this.implementation = nvmLinux;
                break;
            default:
                throw new Error('Operative system not supported yet.');
        }
    }

    public get currentNodeVersion() {
        return this.implementation.currentNodeVersion;
    }

    public getInstalledVersionList() {
        return this.implementation.getInstalledVersionList();
    }

    public getAvailableVersionList() {
        return this.implementation.getAvailableVersionList();
    }

    public useVersion(version: string) {
        return this.implementation.useVersion(version);
    }

    public install(version: string) {
        return this.implementation.install(version);
    }

    public uninstall(version: string) {
        return this.implementation.uninstall(version);
    }

    public enable?() {
        return this.implementation.enable();
    }

    public disable?() {
        return this.implementation.disable();
    }
}

const nvm = (async () => {
    const instance = new NVM();
    await instance.init();
    return instance;
})();

export default nvm;

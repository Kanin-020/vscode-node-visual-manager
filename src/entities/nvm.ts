import os from 'node:os';
import nvmWindows from '@model/nvmWindows';
import nvmLinux from '@model/nvmLinux';
import { nvmAdapter } from '@interfaces/nvm';

class NVM {
    private static instance: NVM;
    private implementation: nvmAdapter;

    private constructor() {
        this.resolveAdapter();
    }

    static getInstance(): NVM {
        if (!this.instance) {
            this.instance = new NVM();
        }
        return this.instance;
    }

    public async getCurrentNodeVersion() {
        return this.implementation.getCurrentNodeVersion();
    }

    public async getInstalledVersionList() {
        return this.implementation.getInstalledVersionList();
    }

    public async getAvailableVersionList() {
        return this.implementation.getAvailableVersionList();
    }

    public async useVersion(version: string) {
        return this.implementation.useVersion(version);
    }

    public async install(version: string) {
        return this.implementation.install(version);
    }

    public async uninstall(version: string) {
        return this.implementation.uninstall(version);
    }

    public async enable?() {
        return this.implementation.enable();
    }

    public async disable?() {
        return this.implementation.disable();
    }

    private async resolveAdapter() {

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

}

export default NVM.getInstance();
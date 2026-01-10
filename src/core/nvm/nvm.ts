import nvmLinux from '@infraestructure/nvm/nvm.linux';
import nvmWindows from '@infraestructure/nvm/nvm.windows';
import os from 'node:os';
import { nvmAdapter } from './nvm.adapter';
import { ActionResponse, AvailableVersionListResponse, CurrentVersionListResponse, CurrentVersionResponse, StatusResponse } from '../types/response';

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

    public async getCurrentNodeVersion(): Promise<CurrentVersionResponse> {
        return this.implementation.getCurrentNodeVersion();
    }

    public async getInstalledVersionList(): Promise<CurrentVersionListResponse> {
        return this.implementation.getInstalledVersionList();
    }

    public async getAvailableVersionList(): Promise<AvailableVersionListResponse> {
        return this.implementation.getAvailableVersionList();
    }

    public async useVersion(version: string): Promise<ActionResponse> {
        return this.implementation.useVersion(version);
    }

    public async install(version: string): Promise<ActionResponse> {
        return this.implementation.install(version);
    }

    public async uninstall(version: string): Promise<ActionResponse> {
        return this.implementation.uninstall(version);
    }

    public async enable?(): Promise<StatusResponse> {
        return this.implementation.enable();
    }

    public async disable?(): Promise<StatusResponse> {
        return this.implementation.disable();
    }

    private async resolveAdapter() {

        const operativeSystem: NodeJS.Platform = os.platform();

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
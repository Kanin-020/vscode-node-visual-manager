import nvmLinux from '@infraestructure/nvm/nvm.linux';
import nvmWindows from '@infraestructure/nvm/nvm.windows';
import { nvmPort } from './nvm.port';
import os from 'node:os';

import { ActionResponse, AvailableVersionListResponse, CurrentVersionListResponse, CurrentVersionResponse, StatusResponse } from '../types/response';

class NVM implements nvmPort {
    private static instance: NVM;
    private implementation!: nvmPort;

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

    public async installFromSource?(version: string): Promise<ActionResponse> {
        return this.implementation.installFromSource?.(version);
    }

    public async uninstall(version: string): Promise<ActionResponse> {
        return this.implementation.uninstall(version);
    }

    public async enable?(): Promise<StatusResponse> {
        return this.implementation.enable?.();
    }

    public async disable?(): Promise<StatusResponse> {
        return this.implementation.disable?.();
    }

    public canEnable(): boolean {
        return typeof (this.implementation as any).enable === 'function';
    }

    public canDisable(): boolean {
        return typeof (this.implementation as any).disable === 'function';
    }

    public canInstallFromSource(): boolean {
        return typeof (this.implementation as any).installFromSource === 'function';
    }

    public async useVersionFromProject(projectPath: string): Promise<ActionResponse> {
        return this.implementation.useVersionFromProject(projectPath);
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
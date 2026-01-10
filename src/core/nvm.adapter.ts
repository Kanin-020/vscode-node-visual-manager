import { NvmResponse } from "./nvm.response.";


export interface nvmAdapter {

    getCurrentNodeVersion(): Promise<{ currentNodeVersion: string } | { error: unknown }>;
    getInstalledVersionList(): Promise<{ nodeList: string[] } | { error: unknown }>;
    getAvailableVersionList(): Promise<{ nodeRemoteList: any[] } | { error: unknown }>;

    useVersion(version: string): Promise<NvmResponse>;
    install(version: string): Promise<NvmResponse>;
    uninstall(version: string): Promise<NvmResponse>;

    enable?(): any;
    disable?(): any;
}

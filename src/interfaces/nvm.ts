import { NvmResponse } from "./nvmResponse";


export interface nvmAdapter {

    currentNodeVersion: string,

    getInstalledVersionList(): Promise<{ nodeList: string[] } | { error: unknown }>;
    getAvailableVersionList(): Promise<{ nodeRemoteList: any[] } | { error: unknown }>;
    getCurrentNodeVersion(): Promise<{ currentNodeVersion: string } | { error: unknown }>;

    useVersion(version: string): Promise<NvmResponse>;
    install(version: string): Promise<NvmResponse>;
    uninstall(version: string): Promise<NvmResponse>;

    enable?(): any;
    disable?(): any;
}

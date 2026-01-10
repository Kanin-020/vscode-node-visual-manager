import { ListResponse, ActionResponse } from "./nvm.response.";


export interface nvmAdapter {

    getCurrentNodeVersion(): Promise<{ currentNodeVersion: string } | { error: unknown }>;
    getInstalledVersionList(): Promise<ListResponse>;
    getAvailableVersionList(): Promise<ListResponse>;

    useVersion(version: string): Promise<ActionResponse>;
    install(version: string): Promise<ActionResponse>;
    uninstall(version: string): Promise<ActionResponse>;

    enable?(): any;
    disable?(): any;
}

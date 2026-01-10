import { CurrentVersionListResponse, ActionResponse, StatusResponse, AvailableVersionListResponse, CurrentVersionResponse } from "../types/response";


export interface nvmAdapter {

    getCurrentNodeVersion(): Promise<CurrentVersionResponse>;
    getInstalledVersionList(): Promise<CurrentVersionListResponse>;
    getAvailableVersionList(): Promise<AvailableVersionListResponse>;

    useVersion(version: string): Promise<ActionResponse>;
    install(version: string): Promise<ActionResponse>;
    uninstall(version: string): Promise<ActionResponse>;

    enable?(): Promise<StatusResponse>;
    disable?(): Promise<StatusResponse>;
}

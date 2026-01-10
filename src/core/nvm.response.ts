import { Version } from "@infraestructure/interfaces/version";

export type CurrentVersionResponse =
    | {
        currentNodeVersion: string;
    }
    | {
        error: unknown;
    };


export type ActionResponse =
    | {
        message: string;
        id: string;
        error?: never;
    }
    | {
        error: unknown;
        message?: never;
        id?: never;
    };

export type CurrentVersionListResponse =
    | { nodeList: string[] }
    | { error: Error };


export type AvailableVersionListResponse =
    | { nodeList: Version[] }
    | { error: Error };

export type StatusResponse =
    | {
        message: string;
    }
    | {
        error: unknown;
    };

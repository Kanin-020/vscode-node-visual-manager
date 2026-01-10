import { Version } from "./version";

export type CurrentVersionResponse =
    | {
        currentNodeVersion: string;
    }
    | {
        error: unknown;
    };

export type CurrentVersionListResponse =
    | { nodeList: string[] }
    | { error: Error };

export type AvailableVersionListResponse =
    | { nodeList: Version[] }
    | { error: Error };

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

export type StatusResponse =
    | {
        message: string;
    }
    | {
        error: unknown;
    };

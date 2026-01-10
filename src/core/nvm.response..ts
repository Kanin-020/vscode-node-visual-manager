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

export type ListResponse =
    | { nodeList: string[] }
    | { error: Error };

export type StatusResponse =
    | {
        message: string;
    }
    | {
        error: unknown;
    };

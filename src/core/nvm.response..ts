export type NvmResponse =
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

import {
    CurrentVersionListResponse,
    ActionResponse,
    StatusResponse,
    AvailableVersionListResponse,
    CurrentVersionResponse,
} from '../types/response';

/**
 * Core interface for NVM (Node Version Manager) operations.
 *
 * Defines the contract that all platform-specific implementations (Linux, Windows)
 * must fulfill. Used by the {@link NVM} facade class to delegate operations.
 *
 * @see {@link NvmToggleable} for platforms that support enable/disable.
 */
export interface NvmCore {
    /**
     * Fetches the currently active Node.js version.
     * @returns The current version or an error response.
     */
    getCurrentNodeVersion(): Promise<CurrentVersionResponse>;

    /**
     * Lists all locally installed Node.js versions.
     * @returns An array of installed version strings or an error response.
     */
    getInstalledVersionList(): Promise<CurrentVersionListResponse>;

    /**
     * Fetches all available Node.js versions from the remote repository.
     * @returns Categorized version list or an error response.
     */
    getAvailableVersionList(): Promise<AvailableVersionListResponse>;

    /**
     * Switches the active Node.js version.
     * @param version - Target version string (e.g., "18.0.0", "lts/*").
     * @returns Action result with optional shell command (Linux requires terminal).
     */
    useVersion(version: string): Promise<ActionResponse>;

    /**
     * Downloads and installs a specific Node.js version.
     * @param version - Version to install (e.g., "18.0.0").
     * @returns Action result with a success message or error.
     */
    install(version: string): Promise<ActionResponse>;

    /**
     * Compiles and installs a Node.js version from source code.
     * Only available on Linux/macOS.
     * @param version - Version to build and install.
     * @returns Action result with a success message or error.
     */
    installFromSource?(version: string): Promise<ActionResponse>;

    /**
     * Removes a locally installed Node.js version.
     * @param version - Version to uninstall.
     * @returns Action result with a success message or error.
     */
    uninstall(version: string): Promise<ActionResponse>;
}

/**
 * Extended NVM interface for platforms that support toggling NVM on/off.
 *
 * Currently only supported on Windows (`nvm on` / `nvm off`).
 * Linux/macOS do not have an equivalent toggle mechanism.
 *
 * @see {@link NvmCore} for the base interface.
 */
export interface NvmToggleable extends NvmCore {
    /**
     * Enables NVM (Windows only: runs `nvm on`).
     * @returns Status message or error.
     */
    enable(): Promise<StatusResponse>;

    /**
     * Disables NVM (Windows only: runs `nvm off`).
     * @returns Status message or error.
     */
    disable(): Promise<StatusResponse>;

    /**
     * Checks whether NVM is currently managing Node.js.
     * @returns `{ enabled: true }` or `{ enabled: false }`.
     */
    isEnabled(): Promise<{ enabled: boolean } | { error: unknown }>;
}

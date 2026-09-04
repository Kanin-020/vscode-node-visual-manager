import nvmLinux from '@infraestructure/nvm/nvm.linux';
import nvmWindows from '@infraestructure/nvm/nvm.windows';
import { NvmCore, NvmToggleable } from './nvm.port';
import os from 'node:os';
import path from 'node:path';
import fs from 'fs/promises';

import {
    ActionResponse,
    AvailableVersionListResponse,
    CurrentVersionListResponse,
    CurrentVersionResponse,
    StatusResponse,
} from '../types/response';

/**
 * Facade class for NVM (Node Version Manager) operations.
 *
 * Implements the Singleton pattern and delegates all operations to a
 * platform-specific adapter (Linux/macOS or Windows) resolved at instantiation time.
 *
 * This is the main entry point for all NVM operations in the extension.
 *
 * @example
 * ```typescript
 * import nvm from '@core/nvm/nvm';
 *
 * const current = await nvm.getCurrentNodeVersion();
 * const installed = await nvm.getInstalledVersionList();
 * await nvm.useVersion('18.0.0');
 * ```
 *
 * @see {@link NvmCore} for the interface contract.
 * @see {@link NvmToggleable} for platforms with enable/disable support.
 */
class NVM {
    private static instance: NVM;
    /** The platform-specific adapter instance. */
    private implementation: NvmCore;

    /**
     * Creates the NVM singleton and resolves the platform adapter.
     * Private to enforce singleton usage via {@link getInstance}.
     */
    private constructor() {
        this.implementation = this.resolveAdapter();
    }

    /**
     * Returns the singleton NVM instance.
     * Creates it on first call.
     * @returns The single NVM instance.
     */
    static getInstance(): NVM {
        if (!this.instance) {
            this.instance = new NVM();
        }
        return this.instance;
    }

    /**
     * Fetches the currently active Node.js version.
     * @returns The current version or an error response.
     */
    public async getCurrentNodeVersion(): Promise<CurrentVersionResponse> {
        return this.implementation.getCurrentNodeVersion();
    }

    /**
     * Lists all locally installed Node.js versions.
     * @returns An array of installed version strings or an error response.
     */
    public async getInstalledVersionList(): Promise<CurrentVersionListResponse> {
        return this.implementation.getInstalledVersionList();
    }

    /**
     * Fetches all available Node.js versions from the remote repository.
     * @returns Categorized version list or an error response.
     */
    public async getAvailableVersionList(): Promise<AvailableVersionListResponse> {
        return this.implementation.getAvailableVersionList();
    }

    /**
     * Switches the active Node.js version.
     * @param version - Target version string (e.g., "18.0.0", "lts/*").
     * @returns Action result with optional shell command for Linux terminals.
     */
    public async useVersion(version: string): Promise<ActionResponse> {
        return this.implementation.useVersion(version);
    }

    /**
     * Downloads and installs a specific Node.js version.
     * @param version - Version to install (e.g., "18.0.0").
     * @returns Action result with a success message or error.
     */
    public async install(version: string): Promise<ActionResponse> {
        return this.implementation.install(version);
    }

    /**
     * Compiles and installs a Node.js version from source code.
     * Only available on Linux/macOS.
     * @param version - Version to build and install.
     * @returns Action result with a success message or error.
     */
    public async installFromSource(version: string): Promise<ActionResponse> {
        return this.implementation.installFromSource?.(version);
    }

    /**
     * Removes a locally installed Node.js version.
     * @param version - Version to uninstall.
     * @returns Action result with a success message or error.
     */
    public async uninstall(version: string): Promise<ActionResponse> {
        return this.implementation.uninstall(version);
    }

    /**
     * Enables NVM on supported platforms (Windows only: `nvm on`).
     * @returns Status message or error. Returns error if platform doesn't support it.
     */
    public async enable(): Promise<StatusResponse> {
        if (!this.isToggleable()) {
            return { error: new Error('Enable/disable not supported on this platform') };
        }
        return (this.implementation as NvmToggleable).enable();
    }

    /**
     * Disables NVM on supported platforms (Windows only: `nvm off`).
     * @returns Status message or error. Returns error if platform doesn't support it.
     */
    public async disable(): Promise<StatusResponse> {
        if (!this.isToggleable()) {
            return { error: new Error('Enable/disable not supported on this platform') };
        }
        return (this.implementation as NvmToggleable).disable();
    }

    /**
     * Checks whether NVM is currently managing Node.js.
     * @returns `{ enabled: true }` or `{ enabled: false }`. Returns error on non-toggleable platforms.
     */
    public async isEnabled(): Promise<{ enabled: boolean } | { error: unknown }> {
        if (!this.isToggleable()) {
            return { error: new Error('NVM status check not supported on this platform') };
        }
        return (this.implementation as NvmToggleable).isEnabled();
    }

    /**
     * Checks if the current platform supports toggling NVM on/off.
     * @returns `true` if enable/disable is available (Windows), `false` otherwise.
     */
    public isToggleable(): boolean {
        return 'enable' in this.implementation && 'disable' in this.implementation;
    }

    /**
     * Alias for {@link isToggleable}. Checks if NVM can be enabled.
     * @returns `true` if the platform supports the enable command.
     */
    public canEnable(): boolean {
        return this.isToggleable();
    }

    /**
     * Alias for {@link isToggleable}. Checks if NVM can be disabled.
     * @returns `true` if the platform supports the disable command.
     */
    public canDisable(): boolean {
        return this.isToggleable();
    }

    /**
     * Checks if the current platform supports installing from source.
     * @returns `true` if `installFromSource` is available (Linux/macOS), `false` otherwise.
     */
    public canInstallFromSource(): boolean {
        return (
            'installFromSource' in this.implementation &&
            typeof this.implementation.installFromSource === 'function'
        );
    }

    /**
     * Reads `.nvmrc` from a project directory and activates the specified version.
     *
     * First installs the version if not present, then switches to it.
     * Returns an error if `.nvmrc` is not found (not a failure — just informational).
     *
     * @param projectPath - Absolute path to the project root directory.
     * @returns Action result with a success message or error.
     *
     * @example
     * ```typescript
     * const result = await nvm.useVersionFromProject('/home/user/my-project');
     * if ('error' in result) {
     *   console.log(result.error); // ".nvmrc not found..."
     * }
     * ```
     */
    public async useVersionFromProject(projectPath: string): Promise<ActionResponse> {
        const nvmrcPath = path.join(projectPath, '.nvmrc');

        try {
            const version = (await fs.readFile(nvmrcPath, 'utf-8')).trim();
            await this.install(version);
            return this.useVersion(version);
        } catch (err) {
            const error = err as NodeJS.ErrnoException;
            if (error.code === 'ENOENT') {
                return { error: '.nvmrc not found, using the current version of Node' };
            }
            return { error: err };
        }
    }

    /**
     * Resolves the platform-specific NVM adapter based on the current OS.
     * @returns The appropriate adapter instance.
     * @throws {Error} If the operating system is not supported.
     */
    private resolveAdapter(): NvmCore {
        const operativeSystem: NodeJS.Platform = os.platform();

        switch (operativeSystem) {
            case 'win32':
                return nvmWindows;
            case 'linux':
            case 'darwin':
                return nvmLinux;
            default:
                throw new Error('Operative system not supported yet.');
        }
    }
}

/** Singleton NVM instance — the main entry point for all version management operations. */
export default NVM.getInstance();

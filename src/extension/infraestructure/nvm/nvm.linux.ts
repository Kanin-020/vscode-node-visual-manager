import { NvmCore } from '@core/nvm/nvm.port';
import {
    ActionResponse,
    AvailableVersionListResponse,
    CurrentVersionListResponse,
    CurrentVersionResponse,
} from '@core/types/response';
import { Version } from '@core/types/version';
import { sanitizeVersion } from '@core/nvm/versionValidator';
import {
    sortVersionStrings,
    categorizeVersions,
    mergeCategorizedVersions,
} from '@core/nvm/versionUtils';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Linux/macOS implementation of the NVM adapter.
 *
 * Executes NVM commands via bash with `source ~/.nvm/nvm.sh` to ensure
 * the NVM environment is loaded. Supports `installFromSource` for compiling
 * Node.js from source on Unix systems.
 *
 * The `useVersion` method returns a shell command (instead of executing directly)
 * because `nvm use` modifies the shell environment, which requires a terminal.
 *
 * @implements {NvmCore}
 */
const nvmLinux: NvmCore = {
    getCurrentNodeVersion,
    getInstalledVersionList,
    getAvailableVersionList,
    useVersion,
    install,
    installFromSource,
    uninstall,
};

/**
 * Fetches the currently active Node.js version on Linux/macOS.
 *
 * Sources the NVM script and runs `nvm current`.
 * @returns The current version string or an error response.
 */
async function getCurrentNodeVersion(): Promise<CurrentVersionResponse> {
    try {
        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm current"');

        if (stdout.includes('No current version')) {
            return { currentNodeVersion: stdout };
        }

        const currentVersion = stdout.replace('v', '').trim();

        if (stderr) {
            throw new Error(stderr);
        }

        return { currentNodeVersion: currentVersion };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Lists all locally installed Node.js versions on Linux/macOS.
 *
 * Parses the output of `nvm list`, extracts version strings, and sorts them
 * in descending order (newest first).
 * @returns Sorted array of installed version strings or an error response.
 */
async function getInstalledVersionList(): Promise<CurrentVersionListResponse> {
    try {
        const { stdout, stderr } = await execAsync('bash -c "source ~/.nvm/nvm.sh && nvm list"');

        if (stderr) {
            throw new Error(stderr);
        }

        const defaultIndex = stdout.indexOf('default');
        const filteredList = defaultIndex !== -1 ? stdout.slice(0, defaultIndex + 1) : stdout;

        const versionRegex = /(\d+\.\d+\.\d+|system)/g;
        const versionList = filteredList.match(versionRegex) ?? [];

        return { nodeList: sortVersionStrings(versionList) };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Fetches all available Node.js versions from the remote repository.
 *
 * Parses the output of `nvm ls-remote`, categorizes versions by type (LTS/Current),
 * and merges them into a sorted list.
 * @returns Categorized and sorted version list or an error response.
 */
async function getAvailableVersionList(): Promise<AvailableVersionListResponse> {
    try {
        const { stdout, stderr } = await execAsync(
            'bash -c "source ~/.nvm/nvm.sh && nvm ls-remote"',
        );

        if (stderr) {
            throw new Error(stderr);
        }

        const versionRegex = /(\d+\.\d+\.\d+)/g;
        const versionEntries: Version[] = [];

        for (const line of stdout.split('\n')) {
            if (line === '') {
                continue;
            }

            const match = line.match(versionRegex);
            const version = match?.[0];

            if (version) {
                const releaseType = line.includes('LTS') ? 'LTS' : 'Current';
                versionEntries.push({ version, releaseType });
            }
        }

        const categorized = categorizeVersions(versionEntries);
        return { nodeList: mergeCategorizedVersions(categorized) };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Internal helper to install a Node.js version on Linux/macOS.
 *
 * @param version - Version to install (must pass validation).
 * @param fromSource - If `true`, compiles from source (`nvm install -s`).
 * @returns Action result with stdout or error.
 */
async function installVersion(
    version: string,
    fromSource: boolean = false,
): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);
        const flag = fromSource ? ' -s' : '';
        const { stdout } = await execAsync(
            `bash -c "source ~/.nvm/nvm.sh && nvm install${flag} ${safeVersion}"`,
        );

        return { message: stdout, id: safeVersion };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Downloads and installs a prebuilt Node.js version.
 * @param version - Version to install (e.g., "18.0.0").
 * @returns Action result with a success message or error.
 */
async function install(version: string): Promise<ActionResponse> {
    return installVersion(version, false);
}

/**
 * Compiles and installs a Node.js version from source code.
 *
 * First checks if the version is already installed before building.
 * @param version - Version to build and install.
 * @returns Action result with a success message or error.
 */
async function installFromSource(version: string): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);

        const { stdout: lsOutput } = await execAsync(
            `bash -c "source ~/.nvm/nvm.sh && nvm ls ${safeVersion}"`,
        );

        if (lsOutput.includes(safeVersion)) {
            return { message: `Node ${safeVersion} is already installed`, id: safeVersion };
        }

        return installVersion(safeVersion, true);
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Removes a locally installed Node.js version and clears the NVM cache.
 *
 * @param version - Version to uninstall.
 * @returns Action result with a success message or error.
 */
async function uninstall(version: string): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);
        const { stdout, stderr } = await execAsync(
            `bash -c "source ~/.nvm/nvm.sh && nvm cache clear && nvm uninstall ${safeVersion}"`,
        );

        if (stderr) {
            throw new Error(stderr);
        }

        return { message: stdout, id: safeVersion };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Generates the shell command to switch the active Node.js version.
 *
 * On Linux/macOS, `nvm use` modifies the shell environment, so it must be
 * executed in a terminal. This method returns the command string instead of
 * executing it directly — the provider layer creates a terminal for it.
 *
 * @param version - Target version to activate.
 * @returns Action result with the shell `command` field for terminal execution.
 */
async function useVersion(version: string): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);
        const command = `source ~/.nvm/nvm.sh && nvm use ${safeVersion}`;

        return {
            message: `Now using node ${safeVersion}`,
            id: safeVersion,
            command,
        };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

export default nvmLinux;

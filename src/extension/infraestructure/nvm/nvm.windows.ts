import { NvmToggleable } from '@core/nvm/nvm.port';
import {
    CurrentVersionListResponse,
    ActionResponse,
    StatusResponse,
    AvailableVersionListResponse,
    CurrentVersionResponse,
} from '@core/types/response';
import { Version } from '@core/types/version';
import { sanitizeVersion } from '@core/nvm/versionValidator';
import { sortVersionObjects } from '@core/nvm/versionUtils';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Windows implementation of the NVM adapter.
 *
 * Executes NVM commands directly (without bash sourcing) since Windows NVM
 * modifies system symlinks. Supports enable/disable via `nvm on`/`nvm off`.
 *
 * Unlike Linux, `nvm use` on Windows executes directly via `exec` because
 * the command modifies the system, making the change persistent.
 *
 * @implements {NvmToggleable}
 */
const nvmWindows: NvmToggleable = {
    getCurrentNodeVersion,
    getInstalledVersionList,
    getAvailableVersionList,
    useVersion,
    install,
    uninstall,
    enable,
    disable,
    isEnabled,
};

/**
 * Fetches the currently active Node.js version on Windows.
 *
 * Runs `nvm current` and strips the leading `v` prefix.
 * @returns The current version string or an error response.
 */
async function getCurrentNodeVersion(): Promise<CurrentVersionResponse> {
    try {
        const { stdout } = await execAsync('nvm default');

        const match = stdout.match(/v?(\d+\.\d+\.\d+)/);
        if (!match) {
            return { currentNodeVersion: 'No current version' };
        }

        return { currentNodeVersion: match[1] };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Lists all locally installed Node.js versions on Windows.
 *
 * Parses the output of `nvm list` using a word-boundary regex.
 * @returns Array of installed version strings or an error response.
 */
async function getInstalledVersionList(): Promise<CurrentVersionListResponse> {
    try {
        const { stdout } = await execAsync('nvm list installed');

        const versionList = stdout.match(/\b\d+\.\d+\.\d+\b/g) ?? [];

        return { nodeList: versionList };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Fetches all available Node.js versions from the Windows NVM mirror.
 *
 * Parses the output of `nvm list releases --no-limit`, extracting version
 * strings from each line and sorting them in descending order.
 * @returns Sorted version list or an error response.
 */
async function getAvailableVersionList(): Promise<AvailableVersionListResponse> {
    try {
        const { stdout } = await execAsync('nvm list releases --no-limit');

        const versionEntries: Version[] = [];

        for (const line of stdout.split('\n')) {
            const match = line.match(/v?(\d+\.\d+\.\d+)/);
            if (match) {
                versionEntries.push({
                    version: match[1],
                    releaseType: 'Release',
                });
            }
        }

        return { nodeList: sortVersionObjects(versionEntries) };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Downloads and installs a specific Node.js version on Windows.
 *
 * Parses the output to extract a clean installation message.
 * @param version - Version to install (e.g., "18.0.0").
 * @returns Action result with a success message or error.
 */
async function install(version: string): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);
        const { stdout } = await execAsync('nvm install ' + safeVersion);

        const message = parseInstallOutput(stdout);

        return { message, id: safeVersion };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Parses the output of `nvm install` for NVM for Windows v2.0.0.
 *
 * The output contains spinner progress lines separated by `\r`,
 * followed by result lines separated by `\n`.
 * @param stdout - Raw stdout from `nvm install`.
 * @returns Cleaned message string.
 */
function parseInstallOutput(stdout: string): string {
    const lines = stdout.split('\n');
    const meaningful = lines
        .map((line) => line.replace(/\r/g, '').trim())
        .filter((line) => line.length > 0);

    const resultLines = meaningful.filter(
        (line) =>
            line.startsWith('Installed') ||
            line.startsWith('SKIPPED') ||
            line.startsWith('Cached') ||
            line.startsWith('Completed'),
    );

    return resultLines.join('\n') || meaningful[meaningful.length - 1] || '';
}

/**
 * Removes a locally installed Node.js version on Windows.
 *
 * @param version - Version to uninstall.
 * @returns Action result with a success message or error.
 */
async function uninstall(version: string): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);
        const { stdout } = await execAsync('nvm uninstall ' + safeVersion);

        return { message: stdout, id: safeVersion };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Switches the active Node.js version on Windows.
 *
 * Unlike Linux, Windows `nvm use` modifies system symlinks directly,
 * so it can be executed via `exec` without requiring a terminal.
 *
 * @param version - Target version to activate.
 * @returns Action result with a success message or error.
 */
async function useVersion(version: string): Promise<ActionResponse> {
    try {
        const safeVersion = sanitizeVersion(version);
        const { stdout } = await execAsync('nvm use ' + safeVersion);

        return { message: stdout, id: safeVersion };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Enables NVM on Windows (runs `nvm on`).
 *
 * When NVM is disabled, Node.js versions are not managed through NVM.
 * @returns Status message or error.
 */
async function enable(): Promise<StatusResponse> {
    try {
        const { stdout } = await execAsync('nvm on');

        return { message: stdout };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Disables NVM on Windows (runs `nvm off`).
 *
 * When disabled, Node.js versions are not managed through NVM.
 * @returns Status message or error.
 */
async function disable(): Promise<StatusResponse> {
    try {
        const { stdout } = await execAsync('nvm off');

        return { message: stdout };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

/**
 * Checks whether NVM is currently managing Node.js on Windows.
 *
 * Parses the output of `nvm env` to extract the Version Management Status field.
 * @returns `{ enabled: true }` if NVM is managing, `{ enabled: false }` otherwise.
 */
async function isEnabled(): Promise<{ enabled: boolean } | { error: unknown }> {
    try {
        const { stdout } = await execAsync('nvm env');

        const match = stdout.match(/Status\s*:\s*(on|off)/i);
        return { enabled: match?.[1]?.toLowerCase() === 'on' };
    } catch (error) {
        return { error: new Error(String(error)) };
    }
}

export default nvmWindows;

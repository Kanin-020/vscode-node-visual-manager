import { Version } from './version';

/**
 * Response type for fetching the currently active Node.js version.
 *
 * - **Success**: Contains `currentNodeVersion` with the version string.
 * - **Error**: Contains `error` with the failure reason.
 *
 * @example
 * ```typescript
 * // Success
 * const ok: CurrentVersionResponse = { currentNodeVersion: '18.0.0' };
 *
 * // Error
 * const err: CurrentVersionResponse = { error: new Error('nvm not found') };
 * ```
 */
export type CurrentVersionResponse =
    | {
          /** The currently active Node.js version string */
          currentNodeVersion: string;
      }
    | {
          /** Error information if the operation failed */
          error: unknown;
      };

/**
 * Response type for fetching the list of locally installed Node.js versions.
 *
 * - **Success**: Contains `nodeList` with an array of version strings.
 * - **Error**: Contains `error` with the failure reason.
 *
 * @example
 * ```typescript
 * const response: CurrentVersionListResponse = { nodeList: ['18.0.0', '20.12.2'] };
 * ```
 */
export type CurrentVersionListResponse =
    | {
          /** Array of installed Node.js version strings */
          nodeList: string[];
      }
    | {
          /** Error information if the operation failed */
          error: Error;
      };

/**
 * Response type for fetching the list of available (remote) Node.js versions.
 *
 * - **Success**: Contains `nodeList` with categorized version objects.
 * - **Error**: Contains `error` with the failure reason.
 *
 * @example
 * ```typescript
 * const response: AvailableVersionListResponse = {
 *   nodeList: [
 *     { version: '20.12.2', releaseType: 'LTS' },
 *     { version: '22.0.0', releaseType: 'Current' }
 *   ]
 * };
 * ```
 */
export type AvailableVersionListResponse =
    | {
          /** Array of available Node.js versions with their release types */
          nodeList: Version[];
      }
    | {
          /** Error information if the operation failed */
          error: Error;
      };

/**
 * Response type for mutation operations (install, uninstall, use version).
 *
 * - **Success**: Contains `message`, `id`, and optionally a shell `command` for
 *   platforms that require terminal execution (e.g., Linux `nvm use`).
 * - **Error**: Contains `error` with the failure reason.
 * - **Undefined**: Returned when the operation was skipped (e.g., version already installed).
 *
 * @example
 * ```typescript
 * // Success with command (Linux - needs terminal)
 * const response: ActionResponse = {
 *   message: 'Now using node 18.0.0',
 *   id: '18.0.0',
 *   command: 'source ~/.nvm/nvm.sh && nvm use 18.0.0'
 * };
 *
 * // Success without command (Windows - direct exec)
 * const winResponse: ActionResponse = {
 *   message: 'Now using node 18.0.0',
 *   id: '18.0.0'
 * };
 * ```
 */
export type ActionResponse =
    | {
          /** Human-readable message describing the result */
          message: string;
          /** Version identifier involved in the operation */
          id: string;
          /** Shell command to execute in a terminal (Linux only, optional) */
          command?: string;
          error?: never;
      }
    | {
          /** Error information if the operation failed */
          error: unknown;
          message?: never;
          id?: never;
          command?: never;
      }
    | undefined;

/**
 * Response type for enable/disable (toggle) operations.
 *
 * - **Success**: Contains `message` describing the result.
 * - **Error**: Contains `error` with the failure reason.
 * - **Undefined**: Returned when the operation is not supported on the platform.
 *
 * @example
 * ```typescript
 * const response: StatusResponse = { message: 'NVM is now on' };
 * ```
 */
export type StatusResponse =
    | {
          /** Human-readable message describing the result */
          message: string;
      }
    | {
          /** Error information if the operation failed */
          error: unknown;
      }
    | undefined;

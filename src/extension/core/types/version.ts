/**
 * Represents a Node.js version with its release category.
 *
 * @example
 * ```typescript
 * const ltsVersion: Version = { version: '20.12.2', releaseType: 'LTS' };
 * const currentVersion: Version = { version: '22.0.0', releaseType: 'Current' };
 * ```
 */
export type Version = {
    /** Semver version string (e.g., "18.0.0", "20.12.2") */
    version: string;
    /** Release category: "Current", "LTS", "Old Stable", or "Old Unstable" */
    releaseType: string;
};

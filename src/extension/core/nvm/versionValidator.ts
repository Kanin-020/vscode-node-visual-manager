/**
 * Validates that a version string is a legitimate semver version or nvm shortcut.
 *
 * This is a **security function** that prevents command injection by rejecting
 * any input that doesn't match the expected format. All user-provided version
 * strings must pass through {@link sanitizeVersion} before being used in shell commands.
 *
 * Accepted formats:
 * - Semver: `MAJOR.MINOR.PATCH` (e.g., "18.0.0", "20.12.2")
 * - nvm shortcuts: `lts/*`, `lts/<name>`, `node`, `system`, `latest`
 *
 * @param version - The version string to validate.
 * @returns `true` if the version is valid and safe to use, `false` otherwise.
 *
 * @example
 * ```typescript
 * isValidVersion('18.0.0');      // true
 * isValidVersion('lts/*');       // true
 * isValidVersion('18.0.0; rm -rf /');  // false (injection attempt)
 * isValidVersion('');            // false
 * ```
 */
const VALID_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const VALID_NVM_SHORTCUTS = /^(lts\/\*|lts\/[a-z-]+|node|system|latest)$/i;

export function isValidVersion(version: string): boolean {
    if (!version || typeof version !== 'string') {
        return false;
    }

    const trimmed = version.trim();

    return VALID_VERSION_PATTERN.test(trimmed) || VALID_NVM_SHORTCUTS.test(trimmed);
}

/**
 * Validates and sanitizes a version string for safe use in shell commands.
 *
 * Trims whitespace and validates against the whitelist pattern.
 * Throws an error if the version is invalid, preventing injection attacks.
 *
 * @param version - The raw version string to sanitize.
 * @returns The trimmed, validated version string.
 * @throws {Error} If the version format is invalid or potentially malicious.
 *
 * @example
 * ```typescript
 * const safe = sanitizeVersion('  18.0.0  ');  // '18.0.0'
 * const lts = sanitizeVersion('lts/*');        // 'lts/*'
 * sanitizeVersion('18.0.0; rm -rf /');         // throws Error
 * ```
 */
export function sanitizeVersion(version: string): string {
    const trimmed = version.trim();

    if (!isValidVersion(trimmed)) {
        throw new Error(
            `Invalid version format: "${version}". Expected semver (e.g., 18.0.0) or nvm shortcut (e.g., lts/*).`,
        );
    }

    return trimmed;
}

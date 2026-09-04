import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically random nonce for Content Security Policy (CSP).
 *
 * The nonce is used in webview HTML to allow only authorized scripts to execute,
 * preventing XSS attacks in the VSCode webview.
 *
 * @returns A base64-encoded 16-byte random string.
 *
 * @example
 * ```typescript
 * const nonce = getNonce();
 * // "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 * ```
 */
export function getNonce(): string {
    return randomBytes(16).toString('base64');
}

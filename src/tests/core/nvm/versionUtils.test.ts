import { ok, deepStrictEqual, strictEqual } from 'assert';
import {
    compareVersions,
    sortVersionStrings,
    sortVersionObjects,
    categorizeVersions,
    mergeCategorizedVersions,
} from '../../../extension/core/nvm/versionUtils';
import { Version } from '../../../extension/core/types/version';

describe('versionUtils', () => {
    describe('compareVersions', () => {
        it('should return negative when a > b (newer first)', () => {
            ok(compareVersions('20.0.0', '18.0.0') < 0);
            ok(compareVersions('18.1.0', '18.0.0') < 0);
            ok(compareVersions('18.0.1', '18.0.0') < 0);
        });

        it('should return positive when a < b (older second)', () => {
            ok(compareVersions('18.0.0', '20.0.0') > 0);
            ok(compareVersions('18.0.0', '18.1.0') > 0);
        });

        it('should return 0 for equal versions', () => {
            strictEqual(compareVersions('18.0.0', '18.0.0'), 0);
        });

        it('should sort "system" to the end', () => {
            ok(compareVersions('system', '18.0.0') > 0);
            ok(compareVersions('18.0.0', 'system') < 0);
        });

        it('should treat different length versions as equal when matching parts are same', () => {
            strictEqual(compareVersions('18.0.0', '18.0'), 0);
            strictEqual(compareVersions('18.0', '18.0.0'), 0);
        });
    });

    describe('sortVersionStrings', () => {
        it('should sort versions in descending order (newest first)', () => {
            const input = ['18.0.0', '20.0.0', '16.0.0', '19.1.0'];
            const result = sortVersionStrings(input);
            deepStrictEqual(result, ['20.0.0', '19.1.0', '18.0.0', '16.0.0']);
        });

        it('should put "system" at the end', () => {
            const input = ['system', '18.0.0', '20.0.0'];
            const result = sortVersionStrings(input);
            deepStrictEqual(result, ['20.0.0', '18.0.0', 'system']);
        });

        it('should not mutate the original array', () => {
            const input = ['18.0.0', '20.0.0'];
            const original = [...input];
            sortVersionStrings(input);
            deepStrictEqual(input, original);
        });

        it('should handle empty array', () => {
            deepStrictEqual(sortVersionStrings([]), []);
        });

        it('should handle single element', () => {
            deepStrictEqual(sortVersionStrings(['18.0.0']), ['18.0.0']);
        });
    });

    describe('sortVersionObjects', () => {
        it('should sort Version objects by version field', () => {
            const input: Version[] = [
                { version: '18.0.0', releaseType: 'Current' },
                { version: '20.0.0', releaseType: 'LTS' },
                { version: '16.0.0', releaseType: 'Current' },
            ];
            const result = sortVersionObjects(input);
            strictEqual(result[0].version, '20.0.0');
            strictEqual(result[1].version, '18.0.0');
            strictEqual(result[2].version, '16.0.0');
        });

        it('should not mutate the original array', () => {
            const input: Version[] = [
                { version: '18.0.0', releaseType: 'Current' },
                { version: '20.0.0', releaseType: 'LTS' },
            ];
            const original = input.map((v) => ({ ...v }));
            sortVersionObjects(input);
            deepStrictEqual(input, original);
        });
    });

    describe('categorizeVersions', () => {
        it('should separate versions by releaseType', () => {
            const input: Version[] = [
                { version: '20.0.0', releaseType: 'LTS' },
                { version: '21.0.0', releaseType: 'Current' },
                { version: '16.0.0', releaseType: 'Old Stable' },
                { version: '15.0.0', releaseType: 'Old Unstable' },
                { version: '18.0.0', releaseType: 'LTS' },
            ];
            const result = categorizeVersions(input);
            strictEqual(result.lts.length, 2);
            strictEqual(result.current.length, 1);
            strictEqual(result.oldStable.length, 1);
            strictEqual(result.oldUnstable.length, 1);
        });

        it('should handle empty array', () => {
            const result = categorizeVersions([]);
            strictEqual(result.lts.length, 0);
            strictEqual(result.current.length, 0);
            strictEqual(result.oldStable.length, 0);
            strictEqual(result.oldUnstable.length, 0);
        });

        it('should ignore unknown releaseTypes', () => {
            const input: Version[] = [{ version: '18.0.0', releaseType: 'Unknown' }];
            const result = categorizeVersions(input);
            strictEqual(result.lts.length, 0);
            strictEqual(result.current.length, 0);
        });
    });

    describe('mergeCategorizedVersions', () => {
        it('should merge in order: LTS, Current, Old Stable, Old Unstable', () => {
            const categorized = {
                lts: [
                    { version: '18.0.0', releaseType: 'LTS' },
                    { version: '20.0.0', releaseType: 'LTS' },
                ],
                current: [{ version: '21.0.0', releaseType: 'Current' }],
                oldStable: [{ version: '16.0.0', releaseType: 'Old Stable' }],
                oldUnstable: [{ version: '15.0.0', releaseType: 'Old Unstable' }],
            };
            const result = mergeCategorizedVersions(categorized);
            strictEqual(result.length, 5);
            strictEqual(result[0].releaseType, 'LTS');
            strictEqual(result[1].releaseType, 'LTS');
            strictEqual(result[2].releaseType, 'Current');
            strictEqual(result[3].releaseType, 'Old Stable');
            strictEqual(result[4].releaseType, 'Old Unstable');
        });

        it('should sort within each category', () => {
            const categorized = {
                lts: [
                    { version: '18.0.0', releaseType: 'LTS' },
                    { version: '20.0.0', releaseType: 'LTS' },
                ],
                current: [] as Version[],
                oldStable: [] as Version[],
                oldUnstable: [] as Version[],
            };
            const result = mergeCategorizedVersions(categorized);
            strictEqual(result[0].version, '20.0.0');
            strictEqual(result[1].version, '18.0.0');
        });

        it('should handle empty categories', () => {
            const categorized = {
                lts: [] as Version[],
                current: [] as Version[],
                oldStable: [] as Version[],
                oldUnstable: [] as Version[],
            };
            deepStrictEqual(mergeCategorizedVersions(categorized), []);
        });
    });
});

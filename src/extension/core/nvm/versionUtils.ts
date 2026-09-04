import { Version } from '../types/version';

/**
 * Compares two semver version strings numerically.
 *
 * Splits versions by `.` and compares each part as a number.
 * The `"system"` version is always treated as the oldest (sorted last).
 *
 * @param versionA - First version string to compare.
 * @param versionB - Second version string to compare.
 * @returns Negative if A > B (newer), positive if A < B (older), 0 if equal.
 *
 * @example
 * ```typescript
 * compareVersions('20.0.0', '18.0.0');  // -1 (20 is newer)
 * compareVersions('18.0.0', '20.0.0');  //  1 (18 is older)
 * compareVersions('18.0.0', '18.0.0');  //  0 (equal)
 * compareVersions('system', '18.0.0');  //  1 (system is oldest)
 * ```
 */
export function compareVersions(versionA: string, versionB: string): number {
    if (versionA === 'system') {
        return 1;
    }
    if (versionB === 'system') {
        return -1;
    }

    const partsA = versionA.split('.').map(Number);
    const partsB = versionB.split('.').map(Number);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const partA = partsA[i] || 0;
        const partB = partsB[i] || 0;

        if (partA > partB) {
            return -1;
        }
        if (partA < partB) {
            return 1;
        }
    }
    return 0;
}

/**
 * Sorts an array of version strings in descending order (newest first).
 *
 * @param versions - Array of semver version strings.
 * @returns New sorted array (does not mutate the original).
 *
 * @example
 * ```typescript
 * sortVersionStrings(['18.0.0', '20.0.0', '16.0.0']);
 * // ['20.0.0', '18.0.0', '16.0.0']
 * ```
 */
export function sortVersionStrings(versions: string[]): string[] {
    return [...versions].sort(compareVersions);
}

/**
 * Sorts an array of {@link Version} objects by their version field (newest first).
 *
 * @param versions - Array of Version objects.
 * @returns New sorted array (does not mutate the original).
 *
 * @example
 * ```typescript
 * const sorted = sortVersionObjects([
 *   { version: '18.0.0', releaseType: 'Current' },
 *   { version: '20.0.0', releaseType: 'LTS' },
 * ]);
 * // sorted[0].version === '20.0.0'
 * ```
 */
export function sortVersionObjects(versions: Version[]): Version[] {
    return [...versions].sort((a, b) => compareVersions(a.version, b.version));
}

/**
 * Categorizes an array of {@link Version} objects by their release type.
 *
 * Groups versions into four categories: `current`, `lts`, `oldStable`, and `oldUnstable`.
 * Versions with unrecognized types are silently ignored.
 *
 * @param versions - Array of Version objects to categorize.
 * @returns An object with four arrays, one per release category.
 *
 * @example
 * ```typescript
 * const versions: Version[] = [
 *   { version: '20.0.0', releaseType: 'LTS' },
 *   { version: '22.0.0', releaseType: 'Current' },
 * ];
 * const grouped = categorizeVersions(versions);
 * // grouped.lts.length === 1
 * // grouped.current.length === 1
 * ```
 */
export function categorizeVersions(versions: Version[]): {
    current: Version[];
    lts: Version[];
    oldStable: Version[];
    oldUnstable: Version[];
} {
    const categorized = {
        current: [] as Version[],
        lts: [] as Version[],
        oldStable: [] as Version[],
        oldUnstable: [] as Version[],
    };

    for (const version of versions) {
        switch (version.releaseType) {
            case 'Current':
                categorized.current.push(version);
                break;
            case 'LTS':
                categorized.lts.push(version);
                break;
            case 'Old Stable':
                categorized.oldStable.push(version);
                break;
            case 'Old Unstable':
                categorized.oldUnstable.push(version);
                break;
        }
    }

    return categorized;
}

/**
 * Merges categorized version groups into a single sorted list.
 *
 * Order: LTS → Current → Old Stable → Old Unstable.
 * Each category is internally sorted by version (newest first).
 *
 * @param categorized - Output from {@link categorizeVersions}.
 * @returns Flat array of all versions in display order.
 *
 * @example
 * ```typescript
 * const categorized = categorizeVersions(versions);
 * const merged = mergeCategorizedVersions(categorized);
 * // First entries are LTS versions, then Current, etc.
 * ```
 */
export function mergeCategorizedVersions(
    categorized: ReturnType<typeof categorizeVersions>,
): Version[] {
    return [
        ...sortVersionObjects(categorized.lts),
        ...sortVersionObjects(categorized.current),
        ...sortVersionObjects(categorized.oldStable),
        ...sortVersionObjects(categorized.oldUnstable),
    ];
}

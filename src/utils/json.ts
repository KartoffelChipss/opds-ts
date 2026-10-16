import { applyBaseUrl } from './url';

/**
 * Checks if a value is blank as defined by OPDS 2.0
 * (null, undefined, "", [] or an object without properties).
 * @param value - The value to check
 * @returns True if the value is blank
 */
export function isBlank(value: unknown): boolean {
    if (value === null || value === undefined || value === '') return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Deep-copies a JSON value, removing blank values and resolving every `href`
 * against the base URL.
 * @param value - The value to clean
 * @param baseUrl - The base URL to apply to relative hrefs (optional)
 * @returns The cleaned copy
 */
export function cleanJson<T>(value: T, baseUrl?: string): T {
    if (Array.isArray(value)) {
        return value
            .map((item) => cleanJson(item, baseUrl))
            .filter((item) => !isBlank(item)) as T;
    }
    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            const cleaned =
                key === 'href' && typeof val === 'string'
                    ? applyBaseUrl(val, baseUrl)
                    : cleanJson(val, baseUrl);
            if (!isBlank(cleaned)) result[key] = cleaned;
        }
        return result as T;
    }
    return value;
}

/**
 * Parses a JSON string (or accepts an already parsed value) and ensures it is an object.
 * @param input - JSON string or object
 * @param name - Name of the expected structure, used in error messages
 * @returns The parsed object
 */
export function parseJsonObject(
    input: string | object,
    name: string
): Record<string, any> {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error(`Invalid ${name}: expected a JSON object`);
    if (
        parsed.metadata === null ||
        typeof parsed.metadata !== 'object' ||
        parsed.metadata.title === undefined
    )
        throw new Error(`Invalid ${name}: missing metadata.title`);
    return parsed;
}

/**
 * Checks whether a link has the given relation.
 * @param link - The link to check
 * @param rels - One or more relations to look for
 * @returns True if the link has any of the relations
 */
export function hasRel(
    link: { rel?: string | string[] },
    ...rels: string[]
): boolean {
    if (!link.rel) return false;
    const linkRels = Array.isArray(link.rel) ? link.rel : [link.rel];
    return linkRels.some((rel) => rels.includes(rel));
}

/**
 * Checks if a URL is absolute.
 * @param url - The URL to check
 * @returns True if the URL is absolute, false otherwise
 */
export function isAbsoluteUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Applies the base URL to a given URL if it's not absolute.
 * @param url - The URL to apply the base URL to
 * @param baseUrl - The base URL to apply (optional)
 * @returns The resulting URL
 */
export function applyBaseUrl(url: string, baseUrl?: string): string {
    if (!baseUrl) return url;
    return isAbsoluteUrl(url)
        ? url
        : `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
}

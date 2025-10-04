import { isAbsoluteUrl, applyBaseUrl } from '../../utils/url';

describe('isAbsoluteUrl', () => {
    it('should return true for absolute URLs', () => {
        expect(isAbsoluteUrl('http://example.com')).toBe(true);
        expect(isAbsoluteUrl('https://example.com')).toBe(true);
        expect(isAbsoluteUrl('ftp://example.com')).toBe(true);
        expect(isAbsoluteUrl('mailto:test@example.com')).toBe(true);
        expect(isAbsoluteUrl('tel:+1234567890')).toBe(true);
    });

    it('should return false for relative URLs', () => {
        expect(isAbsoluteUrl('/path/to/resource')).toBe(false);
        expect(isAbsoluteUrl('path/to/resource')).toBe(false);
        expect(isAbsoluteUrl('../resource')).toBe(false);
        expect(isAbsoluteUrl('resource')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
        expect(isAbsoluteUrl('ht!tp://example.com')).toBe(false);
        expect(isAbsoluteUrl('://example.com')).toBe(false);
        expect(isAbsoluteUrl('http//example.com')).toBe(false);
    });
});

describe('applyBaseUrl', () => {
    const baseUrl = 'http://example.com/base/';

    it('should return the original URL if no base URL is provided', () => {
        expect(applyBaseUrl('/path/to/resource')).toBe('/path/to/resource');
        expect(applyBaseUrl('http://example.com/path')).toBe(
            'http://example.com/path'
        );
    });

    it('should return the original URL if it is absolute', () => {
        expect(applyBaseUrl('http://example.com/path', baseUrl)).toBe(
            'http://example.com/path'
        );
        expect(applyBaseUrl('https://example.com/path', baseUrl)).toBe(
            'https://example.com/path'
        );
    });

    it('should apply the base URL to relative URLs', () => {
        expect(applyBaseUrl('path/to/resource', baseUrl)).toBe(
            'http://example.com/base/path/to/resource'
        );
        expect(applyBaseUrl('../resource', baseUrl)).toBe(
            'http://example.com/base/../resource' // this does not resolve the path
        );
    });

    it('should handle base URLs without trailing slashes', () => {
        const baseUrlNoSlash = 'http://example.com/base';
        expect(applyBaseUrl('/path/to/resource', baseUrlNoSlash)).toBe(
            'http://example.com/base/path/to/resource'
        );
    });
});

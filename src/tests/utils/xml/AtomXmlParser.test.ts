import { AtomXmlParser } from '../../../utils/xml/AtomXmlParser';

describe('AtomXmlParser', () => {
    let parser: AtomXmlParser;

    beforeEach(() => {
        parser = new AtomXmlParser();
    });

    it('should parse basic XML structure', () => {
        const xml = `
            <entry>
                <id>test-id</id>
                <title>Test Title</title>
            </entry>
        `;

        const result = parser.parse(xml);
        expect(result.entry).toBeDefined();
        expect(result.entry.id).toBe('test-id');
        expect(result.entry.title).toBe('Test Title');
    });

    it('should extract text content correctly', () => {
        expect(parser.extractText('simple string')).toBe('simple string');
        expect(parser.extractText({ '#text': 'text content' })).toBe(
            'text content'
        );
        expect(parser.extractText({ text: 'other text' })).toBe('other text');
        expect(parser.extractText(undefined)).toBeUndefined();
        expect(parser.extractText(null)).toBeUndefined();
    });

    it('should extract attributes correctly', () => {
        const element = {
            '@_href': 'http://example.com',
            '@_type': 'text/html',
            '@_rel': 'alternate',
        };

        expect(parser.extractAttribute(element, 'href')).toBe(
            'http://example.com'
        );
        expect(parser.extractAttribute(element, 'type')).toBe('text/html');
        expect(parser.extractAttribute(element, 'rel')).toBe('alternate');
        expect(parser.extractAttribute(element, 'missing')).toBeUndefined();
    });

    it('should parse links correctly', () => {
        const linkElements = [
            {
                '@_rel': 'self',
                '@_href': '/feed.xml',
                '@_type': 'application/atom+xml',
            },
            {
                '@_rel': 'alternate',
                '@_href': '/entry.html',
                '@_type': 'text/html',
                '@_title': 'Entry Page',
            },
        ];

        const links = parser.parseLinks(linkElements);

        expect(links).toHaveLength(2);
        expect(links[0]).toEqual({
            rel: 'self',
            href: '/feed.xml',
            type: 'application/atom+xml',
        });
        expect(links[1]).toEqual({
            rel: 'alternate',
            href: '/entry.html',
            type: 'text/html',
            title: 'Entry Page',
        });
    });

    it('should parse single link element', () => {
        const linkElement = {
            '@_rel': 'self',
            '@_href': '/feed.xml',
            '@_type': 'application/atom+xml',
        };

        const links = parser.parseLinks(linkElement);

        expect(links).toHaveLength(1);
        expect(links[0]).toEqual({
            rel: 'self',
            href: '/feed.xml',
            type: 'application/atom+xml',
        });
    });

    it('should parse link properties', () => {
        const linkElement = {
            '@_rel': 'http://opds-spec.org/acquisition/buy',
            '@_href': '/buy.html',
            '@_type': 'text/html',
            '@_opds:price': '9.99',
            '@_currency': 'USD',
            '@_custom-attr': 'custom-value',
        };

        const links = parser.parseLinks([linkElement]);

        expect(links[0].properties).toEqual({
            'opds:price': '9.99',
            currency: 'USD',
            'custom-attr': 'custom-value',
        });
    });

    it('should parse author information', () => {
        const authorElement = {
            name: 'John Doe',
        };

        expect(parser.parseAuthor(authorElement)).toBe('John Doe');
        expect(parser.parseAuthor('Simple Author')).toBe('Simple Author');
        expect(parser.parseAuthor(undefined)).toBeUndefined();
        expect(parser.parseAuthor(null)).toBeUndefined();
    });

    it('should parse author with text element', () => {
        const authorElement = {
            name: { '#text': 'Jane Smith' },
        };

        expect(parser.parseAuthor(authorElement)).toBe('Jane Smith');
    });

    it('should ensure array conversion', () => {
        expect(parser.ensureArray(undefined)).toEqual([]);
        expect(parser.ensureArray(null)).toEqual([]);
        expect(parser.ensureArray('single')).toEqual(['single']);
        expect(parser.ensureArray(['array'])).toEqual(['array']);
        expect(parser.ensureArray({ obj: 'value' })).toEqual([
            { obj: 'value' },
        ]);
    });

    it('should handle complex XML with namespaces', () => {
        const xml = `
            <?xml version="1.0" encoding="UTF-8"?>
            <feed xmlns="http://www.w3.org/2005/Atom" 
                  xmlns:opds="http://opds-spec.org/2010/catalog">
                <id>test-feed</id>
                <title>Test Feed</title>
                <link rel="self" href="/feed.xml" type="application/atom+xml"/>
            </feed>
        `;

        const result = parser.parse(xml);
        expect(result.feed).toBeDefined();
        expect(result.feed.id).toBe('test-feed');
        expect(result.feed.title).toBe('Test Feed');
        expect(result.feed.link).toBeDefined();
    });

    it('should handle empty or invalid input gracefully', () => {
        expect(() => parser.parse('')).toThrow();
        expect(() => parser.parse('invalid xml')).toThrow();

        expect(parser.parseLinks([])).toEqual([]);
        expect(parser.parseLinks(null)).toEqual([]);
        expect(parser.parseLinks(undefined)).toEqual([]);
    });
});

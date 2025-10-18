import { AtomEntryBuilder } from '../../../utils/xml/AtomEntryBuilder';
import { EntryOptions, Link } from '../../../versions/v1_2/types';

describe('AtomEntryBuilder', () => {
    let builder: AtomEntryBuilder;

    beforeEach(() => {
        builder = new AtomEntryBuilder();
    });

    it('should create a basic entry structure', () => {
        const xml = builder.build();

        expect(xml).toContain('<entry');
    });

    it('should set entry metadata correctly', () => {
        const options: EntryOptions = {
            id: 'test-entry',
            title: 'Test Entry',
            updated: '2023-01-01T00:00:00Z',
            author: 'Test Author',
            summary: 'Test summary',
            content: { type: 'text', value: 'Test content' },
        };

        const xml = builder.setMetadata(options).build();

        expect(xml).toContain('<id>test-entry</id>');
        expect(xml).toContain('<title>Test Entry</title>');
        expect(xml).toContain('<updated>2023-01-01T00:00:00Z</updated>');
        expect(xml).toContain('<name>Test Author</name>');
        expect(xml).toContain('<summary type="text">Test summary</summary>');
        expect(xml).toContain('<content type="text">Test content</content>');
    });

    it('should use current date when updated is not provided', () => {
        const options: EntryOptions = {
            id: 'test-entry',
            title: 'Test Entry',
        };

        const xml = builder.setMetadata(options).build();
        const currentYear = new Date().getFullYear();

        expect(xml).toContain(`<updated>${currentYear}`);
    });

    it('should handle content with custom type', () => {
        const options: EntryOptions = {
            id: 'test-entry',
            title: 'Test Entry',
            content: { type: 'html', value: '<p>HTML content</p>' },
        };

        const xml = builder.setMetadata(options).build();

        expect(xml).toContain(
            '<content type="html">&lt;p&gt;HTML content&lt;/p&gt;</content>'
        );
    });

    it('should handle entries without optional fields', () => {
        const options: EntryOptions = {
            id: 'minimal-entry',
            title: 'Minimal Entry',
        };

        const xml = builder.setMetadata(options).build();

        expect(xml).toContain('<id>minimal-entry</id>');
        expect(xml).toContain('<title>Minimal Entry</title>');
        expect(xml).toContain('<updated>'); // Should have auto-generated timestamp
        expect(xml).not.toContain('<author>');
        expect(xml).not.toContain('<summary>');
        expect(xml).not.toContain('<content>');
    });

    it('should add links correctly', () => {
        const links: Link[] = [
            {
                rel: 'http://opds-spec.org/image',
                href: '/image.jpg',
                type: 'image/jpeg',
            },
            {
                rel: 'http://opds-spec.org/acquisition',
                href: '/book.epub',
                type: 'application/epub+zip',
            },
        ];

        const xml = builder.addLinks(links).build();

        expect(xml).toContain('rel="http://opds-spec.org/image"');
        expect(xml).toContain('href="/image.jpg"');
        expect(xml).toContain('rel="http://opds-spec.org/acquisition"');
        expect(xml).toContain('href="/book.epub"');
    });

    it('should apply base URL to relative links', () => {
        const links: Link[] = [
            {
                rel: 'http://opds-spec.org/image',
                href: '/image.jpg',
                type: 'image/jpeg',
            },
        ];

        const xml = builder.addLinks(links, 'https://example.com').build();

        expect(xml).toContain('href="https://example.com/image.jpg"');
    });

    it('should handle link properties', () => {
        const links: Link[] = [
            {
                rel: 'http://opds-spec.org/acquisition/buy',
                href: '/buy.html',
                type: 'text/html',
                properties: { 'opds:price': '9.99', currency: 'USD' },
            },
        ];

        const xml = builder.addLinks(links).build();

        expect(xml).toContain('opds:price="9.99"');
        expect(xml).toContain('currency="USD"');
    });

    it('should handle extra attributes', () => {
        const options: EntryOptions = {
            id: 'extra-entry',
            title: 'Extra Entry',
            extra: { 'custom-attr': 'custom-value', another: 123 },
        };

        const xml = builder.setMetadata(options).build();

        expect(xml).toContain('custom-attr="custom-value"');
        expect(xml).toContain('another="123"');
    });

    it('should support method chaining', () => {
        const options: EntryOptions = {
            id: 'chain-entry',
            title: 'Chain Entry',
        };

        const links: Link[] = [
            {
                rel: 'alternate',
                href: '/entry.xml',
                type: 'application/atom+xml',
            },
        ];

        const xml = builder.setMetadata(options).addLinks(links).build();

        expect(xml).toContain('<id>chain-entry</id>');
        expect(xml).toContain('rel="alternate"');
    });

    it('should control pretty printing', () => {
        const options: EntryOptions = {
            id: 'pretty-entry',
            title: 'Pretty Entry',
        };

        const prettyXml = builder.setMetadata(options).build(true);
        const compactXml = builder.setMetadata(options).build(false);

        expect(prettyXml).toMatch(/\n\s+</); // Contains newlines and indentation
        expect(compactXml).not.toMatch(/\n\s+</); // No pretty formatting
    });
});

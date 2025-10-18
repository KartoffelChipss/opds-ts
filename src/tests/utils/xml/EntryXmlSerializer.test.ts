import { EntryXmlSerializer } from '../../../utils/xml/EntryXmlSerializer';
import { Entry } from '../../../versions/v1_2/entry';

describe('EntryXmlSerializer', () => {
    let entry: Entry;
    let serializer: EntryXmlSerializer;

    beforeEach(() => {
        entry = new Entry('test-entry', 'Test Entry')
            .setAuthor('Entry Author')
            .setUpdated('2023-01-01T00:00:00Z')
            .setSummary('Test summary')
            .setContent({ type: 'text', value: 'Test content' })
            .addLink({
                rel: 'http://opds-spec.org/image',
                href: '/image.jpg',
                type: 'image/jpeg',
            })
            .addLink({
                rel: 'http://opds-spec.org/acquisition',
                href: '/book.epub',
                type: 'application/epub+zip',
            });

        serializer = new EntryXmlSerializer(entry);
    });

    it('should serialize a complete entry', () => {
        const xml = serializer.serialize();

        expect(xml).toContain('<entry');
        expect(xml).toContain('<id>test-entry</id>');
        expect(xml).toContain('<title>Test Entry</title>');
        expect(xml).toContain('<updated>2023-01-01T00:00:00Z</updated>');
        expect(xml).toContain('<name>Entry Author</name>');
        expect(xml).toContain('<summary type="text">Test summary</summary>');
        expect(xml).toContain('<content type="text">Test content</content>');
        expect(xml).toContain('rel="http://opds-spec.org/image"');
        expect(xml).toContain('rel="http://opds-spec.org/acquisition"');
    });

    it('should apply base URL during serialization', () => {
        const xml = serializer.serialize({ baseUrl: 'https://example.com' });

        expect(xml).toContain('href="https://example.com/image.jpg"');
        expect(xml).toContain('href="https://example.com/book.epub"');
    });

    it('should control pretty printing', () => {
        const prettyXml = serializer.serialize({ prettyPrint: true });
        const compactXml = serializer.serialize({ prettyPrint: false });

        expect(prettyXml).toMatch(/\n\s+</);
        expect(compactXml).not.toMatch(/\n\s+</);
    });

    it('should use default pretty printing when not specified', () => {
        const xml = serializer.serialize({});
        expect(xml).toMatch(/\n\s+</); // Should be pretty printed by default
    });

    it('should serialize minimal entry without optional content', () => {
        const minimalEntry = new Entry('minimal', 'Minimal Entry');
        const minimalSerializer = new EntryXmlSerializer(minimalEntry);

        const xml = minimalSerializer.serialize();

        expect(xml).toContain('<id>minimal</id>');
        expect(xml).toContain('<title>Minimal Entry</title>');
        expect(xml).toContain('<updated>'); // Should have auto-generated timestamp
        expect(xml).not.toContain('<author>');
        expect(xml).not.toContain('<summary>');
        expect(xml).not.toContain('<content>');
        expect(xml).not.toContain('<link'); // No links
    });

    it('should create builder instance', () => {
        const builder = serializer.createBuilder();
        expect(builder).toBeDefined();

        const xml = builder.build();
        expect(xml).toContain('<entry');
    });

    it('should handle entries with image and thumbnail links', () => {
        entry
            .addImage('/large.jpg', 'image/jpeg')
            .addThumbnail('/thumb.jpg', 'image/jpeg');

        const xml = serializer.serialize();

        expect(xml).toContain('rel="http://opds-spec.org/image"');
        expect(xml).toContain('rel="http://opds-spec.org/image/thumbnail"');
        expect(xml).toContain('href="/large.jpg"');
        expect(xml).toContain('href="/thumb.jpg"');
    });

    it('should handle entries with acquisition links', () => {
        entry
            .addAcquisition('/download.epub', 'application/epub+zip')
            .addAcquisition('/download.pdf', 'application/pdf');

        const xml = serializer.serialize();

        expect(xml).toContain('rel="http://opds-spec.org/acquisition"');
        expect(xml).toContain('href="/download.epub"');
        expect(xml).toContain('href="/download.pdf"');
        expect(xml).toContain('type="application/epub+zip"');
        expect(xml).toContain('type="application/pdf"');
    });

    it('should serialize entry with subsection link', () => {
        entry.addSubsection('/category/fiction', 'acquisition');

        const xml = serializer.serialize();

        expect(xml).toContain('rel="subsection"');
        expect(xml).toContain('href="/category/fiction"');
        expect(xml).toContain(
            'type="application/atom+xml;profile=opds-catalog;kind=acquisition"'
        );
    });

    it('should handle entries with extra attributes', () => {
        entry.addExtra('customField', 'customValue');

        const xml = serializer.serialize();

        // Extra attributes should appear on the entry element
        expect(xml).toContain('<id>test-entry</id>');
        expect(xml).toContain('customField="customValue"');
    });

    it('should maintain backward compatibility', () => {
        // Test that the original toXml method on Entry still works
        const xmlFromEntry = entry.toXml({
            baseUrl: 'https://legacy.example.com',
            prettyPrint: true,
        });

        const xmlFromSerializer = serializer.serialize({
            baseUrl: 'https://legacy.example.com',
            prettyPrint: true,
        });

        // Both should produce similar XML structure
        expect(xmlFromEntry).toContain('<id>test-entry</id>');
        expect(xmlFromSerializer).toContain('<id>test-entry</id>');
        expect(xmlFromEntry).toContain(
            'href="https://legacy.example.com/image.jpg"'
        );
        expect(xmlFromSerializer).toContain(
            'href="https://legacy.example.com/image.jpg"'
        );
    });
});

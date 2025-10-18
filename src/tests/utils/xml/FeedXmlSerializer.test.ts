import { FeedXmlSerializer } from '../../../utils/xml/FeedXmlSerializer';
import { Feed } from '../../../versions/v1_2/feed';
import { Entry } from '../../../versions/v1_2/entry';

describe('FeedXmlSerializer', () => {
    let feed: Feed;
    let serializer: FeedXmlSerializer;

    beforeEach(() => {
        feed = new Feed('test-feed', 'Test Feed')
            .setAuthor('Feed Author')
            .setUpdated('2023-01-01T00:00:00Z')
            .addSelfLink('/feed.xml', 'navigation')
            .addNavigationLink('start', '/root');

        const entry = new Entry('entry1', 'Test Entry')
            .setAuthor('Entry Author')
            .setSummary('Test summary');

        feed.addEntry(entry);
        serializer = new FeedXmlSerializer(feed);
    });

    it('should serialize a complete feed', () => {
        const xml = serializer.serialize();

        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
        expect(xml).toContain('<id>test-feed</id>');
        expect(xml).toContain('<title>Test Feed</title>');
        expect(xml).toContain('<updated>2023-01-01T00:00:00Z</updated>');
        expect(xml).toContain('<name>Feed Author</name>');
        expect(xml).toContain('rel="self"');
        expect(xml).toContain('rel="start"');
        expect(xml).toContain('<entry>');
        expect(xml).toContain('<title>Test Entry</title>');
    });

    it('should apply base URL during serialization', () => {
        const xml = serializer.serialize({ baseUrl: 'https://example.com' });

        expect(xml).toContain('href="https://example.com/feed.xml"');
        expect(xml).toContain('href="https://example.com/root"');
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

    it('should serialize minimal feed without entries', () => {
        const minimalFeed = new Feed('minimal', 'Minimal Feed');
        const minimalSerializer = new FeedXmlSerializer(minimalFeed);

        const xml = minimalSerializer.serialize();

        expect(xml).toContain('<id>minimal</id>');
        expect(xml).toContain('<title>Minimal Feed</title>');
        expect(xml).toContain('<updated>'); // Should have auto-generated timestamp
        expect(xml).not.toContain('<entry>'); // No entries
        expect(xml).not.toContain('<author>'); // No author
    });

    it('should create builder instance', () => {
        const builder = serializer.createBuilder();
        expect(builder).toBeDefined();

        const xml = builder.build();
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
    });

    it('should handle feeds with navigation links', () => {
        feed.addNavigationLinks({
            previous: '/page1',
            next: '/page3',
            first: '/page1',
            last: '/page10',
        });

        const xml = serializer.serialize();

        expect(xml).toContain('rel="previous"');
        expect(xml).toContain('rel="next"');
        expect(xml).toContain('rel="first"');
        expect(xml).toContain('rel="last"');
        expect(xml).toContain(
            'type="application/atom+xml;profile=opds-catalog;kind=navigation"'
        );
    });

    it('should serialize feed with language attribute', () => {
        feed.setLang('de');

        const xml = serializer.serialize();

        expect(xml).toContain('xml:lang="de"');
    });

    it('should serialize feed with extra properties', () => {
        feed.addExtra('customField', 'customValue');

        const xml = serializer.serialize();

        // Extra properties don't appear in XML directly, but feed should still serialize
        expect(xml).toContain('<id>test-feed</id>');
    });
});

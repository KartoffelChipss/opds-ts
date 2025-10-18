import { AtomFeedBuilder } from '../../../utils/xml/AtomFeedBuilder';
import { FeedOptions, Link } from '../../../versions/v1_2/types';
import { Entry } from '../../../versions/v1_2/entry';

describe('AtomFeedBuilder', () => {
    let builder: AtomFeedBuilder;

    beforeEach(() => {
        builder = new AtomFeedBuilder();
    });

    it('should create a basic feed structure', () => {
        const xml = builder.build();

        expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
        expect(xml).toContain('<feed xmlns="http://www.w3.org/2005/Atom"');
        expect(xml).toContain('xmlns:opds="http://opds-spec.org/2010/catalog"');
        expect(xml).toContain('xmlns:dcterms="http://purl.org/dc/terms/"');
    });

    it('should set feed metadata correctly', () => {
        const options: FeedOptions = {
            id: 'test-feed',
            title: 'Test Feed',
            updated: '2023-01-01T00:00:00Z',
            author: 'Test Author',
            lang: 'en',
        };

        const xml = builder.setMetadata(options).build();

        expect(xml).toContain('xml:lang="en"');
        expect(xml).toContain('<id>test-feed</id>');
        expect(xml).toContain('<title>Test Feed</title>');
        expect(xml).toContain('<updated>2023-01-01T00:00:00Z</updated>');
        expect(xml).toContain('<name>Test Author</name>');
    });

    it('should use current date when updated is not provided', () => {
        const options: FeedOptions = {
            id: 'test-feed',
            title: 'Test Feed',
        };

        const xml = builder.setMetadata(options).build();
        const currentYear = new Date().getFullYear();

        expect(xml).toContain(`<updated>${currentYear}`);
    });

    it('should handle author from extra field', () => {
        const options: FeedOptions = {
            id: 'test-feed',
            title: 'Test Feed',
            extra: { author: 'Extra Author' },
        };

        const xml = builder.setMetadata(options).build();

        expect(xml).toContain('<name>Extra Author</name>');
    });

    it('should add links correctly', () => {
        const links: Link[] = [
            { rel: 'self', href: '/feed.xml', type: 'application/atom+xml' },
            {
                rel: 'start',
                href: '/root',
                type: 'application/atom+xml;profile=opds-catalog;kind=navigation',
            },
        ];

        const xml = builder.addLinks(links).build();

        expect(xml).toContain('rel="self"');
        expect(xml).toContain('href="/feed.xml"');
        expect(xml).toContain('rel="start"');
        expect(xml).toContain('href="/root"');
    });

    it('should apply base URL to relative links', () => {
        const links: Link[] = [
            { rel: 'self', href: '/feed.xml', type: 'application/atom+xml' },
        ];

        const xml = builder.addLinks(links, 'https://example.com').build();

        expect(xml).toContain('href="https://example.com/feed.xml"');
    });

    it('should handle link properties', () => {
        const links: Link[] = [
            {
                rel: 'self',
                href: '/feed.xml',
                type: 'application/atom+xml',
                properties: { 'pse:count': 10, custom: true },
            },
        ];

        const xml = builder.addLinks(links).build();

        expect(xml).toContain('pse:count="10"');
        expect(xml).toContain('custom="true"');
    });

    it('should add entries correctly', () => {
        const entry = new Entry('entry1', 'Test Entry')
            .setAuthor('Entry Author')
            .setSummary('Entry summary');

        const xml = builder.addEntries([entry]).build();

        expect(xml).toContain('<entry>');
        expect(xml).toContain('<title>Test Entry</title>');
        expect(xml).toContain('<name>Entry Author</name>');
        expect(xml).toContain('<summary type="text">Entry summary</summary>');
    });

    it('should support method chaining', () => {
        const options: FeedOptions = {
            id: 'chain-test',
            title: 'Chain Test',
        };

        const links: Link[] = [
            { rel: 'self', href: '/feed.xml', type: 'application/atom+xml' },
        ];

        const entry = new Entry('entry1', 'Test Entry');

        const xml = builder
            .setMetadata(options)
            .addLinks(links)
            .addEntries([entry])
            .build();

        expect(xml).toContain('<id>chain-test</id>');
        expect(xml).toContain('rel="self"');
        expect(xml).toContain('<title>Test Entry</title>');
    });

    it('should control pretty printing', () => {
        const options: FeedOptions = {
            id: 'pretty-test',
            title: 'Pretty Test',
        };

        const prettyXml = builder.setMetadata(options).build(true);
        const compactXml = builder.setMetadata(options).build(false);

        expect(prettyXml).toMatch(/\n\s+</); // Contains newlines and indentation
        expect(compactXml).not.toMatch(/\n\s+</); // No pretty formatting
    });
});

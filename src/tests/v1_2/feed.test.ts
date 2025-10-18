import { Feed } from '../../versions/v1_2/feed';
import { Entry } from '../../versions/v1_2/entry';

describe('Feed', () => {
    const baseUrl = 'https://example.com';

    it('should construct with id and title', () => {
        const feed = new Feed('feed1', 'Test Feed');
        expect(feed.getOptions().id).toBe('feed1');
        expect(feed.getOptions().title).toBe('Test Feed');
    });

    it('should construct with FeedOptions object', () => {
        const feed = new Feed({
            id: 'feed2',
            title: 'Another Feed',
            lang: 'en',
        });
        expect(feed.getOptions().lang).toBe('en');
    });

    it('should allow chaining methods', () => {
        const feed = new Feed('feed3', 'Chained Feed')
            .setAuthor('Author Name')
            .setUpdated('2025-01-01T00:00:00Z')
            .setKind('navigation')
            .setLang('de')
            .addExtra('foo', 'bar')
            .addLink({ rel: 'self', href: '/self' });

        const opts = feed.getOptions();
        expect(opts.author).toBe('Author Name');
        expect(opts.updated).toBe('2025-01-01T00:00:00Z');
        expect(opts.kind).toBe('navigation');
        expect(opts.lang).toBe('de');
        expect(opts.extra?.foo).toBe('bar');
        expect(opts.links?.length).toBe(1);
    });

    it('should add single and multiple entries', () => {
        const feed = new Feed('feed4', 'Entries Feed');
        const entry1 = new Entry('entry1', 'Entry 1');
        const entry2 = new Entry('entry2', 'Entry 2');

        feed.addEntry(entry1).addEntries([entry2]);
        expect(feed.getEntries().length).toBe(2);
    });

    it('should generate XML with correct structure', () => {
        const feed = new Feed('feed5', 'XML Feed')
            .setAuthor('Feed Author')
            .addSelfLink('/feed', 'navigation')
            .addNavigationLink('start', '/');

        const entry = new Entry('entry1', 'Entry 1')
            .setAuthor('Entry Author')
            .setSummary('Entry summary')
            .addLink({ rel: 'alternate', href: '/entry1' });

        feed.addEntry(entry);

        const xml = feed.toXml({ baseUrl });

        expect(xml).toContain('<feed');
        expect(xml).toContain('<id>feed5</id>');
        expect(xml).toContain('<title>XML Feed</title>');
        expect(xml).toContain('<author>');
        expect(xml).toContain('<name>Feed Author</name>');
        expect(xml).toContain('rel="self"');
        expect(xml).toContain('rel="start"');
        expect(xml).toContain('<entry>');
        expect(xml).toContain('<title>Entry 1</title>');
        expect(xml).toContain('<name>Entry Author</name>');
        expect(xml).toContain('<summary type="text">Entry summary</summary>');
        expect(xml).toContain(`href="${baseUrl}/entry1"`);
    });

    it('should respect prettyPrint option', () => {
        const feed = new Feed('feed6', 'Pretty Feed');
        const xmlPretty = feed.toXml({ prettyPrint: true });
        const xmlCompact = feed.toXml({ prettyPrint: false });
        expect(xmlPretty).toMatch(/\n\s*</); // pretty printed contains newlines
        expect(xmlCompact).not.toMatch(/\n\s*</); // compact does not
    });

    it('should apply baseUrl to relative links', () => {
        const feed = new Feed('feed7', 'Base URL Feed');
        feed.addLink({ rel: 'self', href: '/self' });
        const xml = feed.toXml({ baseUrl });
        expect(xml).toContain(`href="${baseUrl}/self"`);
    });

    it('should include extra attributes on links', () => {
        const feed = new Feed('feed8', 'Extra Link Feed');
        feed.addLink({
            rel: 'self',
            href: '/self',
            properties: { 'pse:count': 10 },
        });
        const xml = feed.toXml({ baseUrl });
        expect(xml).toContain('pse:count="10"');
    });

    describe('Navigation Links', () => {
        it('should add a single navigation link', () => {
            const feed = new Feed('nav1', 'Navigation Test');
            feed.addNavigationLink('start', '/root');

            const startLink = feed.getNavigationLink('start');
            expect(startLink).toBeDefined();
            expect(startLink?.rel).toBe('start');
            expect(startLink?.href).toBe('/root');
            expect(startLink?.type).toBe(
                'application/atom+xml;profile=opds-catalog;kind=navigation'
            );
        });

        it('should replace existing navigation link with same rel', () => {
            const feed = new Feed('nav2', 'Replace Test');
            feed.addNavigationLink('next', '/page2');
            feed.addNavigationLink('next', '/page3');

            const nextLinks = feed
                .getLinks()
                .filter((link) => link.rel === 'next');
            expect(nextLinks).toHaveLength(1);
            expect(nextLinks[0].href).toBe('/page3');
        });

        it('should add multiple navigation links at once', () => {
            const feed = new Feed('nav3', 'Multiple Links Test');
            feed.addNavigationLinks({
                start: '/root',
                previous: '/page1',
                next: '/page3',
                first: '/page1',
                last: '/page10',
            });

            expect(feed.getNavigationLink('start')?.href).toBe('/root');
            expect(feed.getNavigationLink('previous')?.href).toBe('/page1');
            expect(feed.getNavigationLink('next')?.href).toBe('/page3');
            expect(feed.getNavigationLink('first')?.href).toBe('/page1');
            expect(feed.getNavigationLink('last')?.href).toBe('/page10');
        });

        it('should skip undefined values in addNavigationLinks', () => {
            const feed = new Feed('nav4', 'Skip Undefined Test');
            feed.addNavigationLinks({
                start: '/root',
                previous: undefined,
                next: '/page3',
            });

            expect(feed.getNavigationLink('start')).toBeDefined();
            expect(feed.getNavigationLink('previous')).toBeUndefined();
            expect(feed.getNavigationLink('next')).toBeDefined();
        });

        it('should return undefined for non-existent navigation links', () => {
            const feed = new Feed('nav5', 'Non-existent Test');
            expect(feed.getNavigationLink('next')).toBeUndefined();
        });

        it('should chain navigation link methods', () => {
            const feed = new Feed('nav6', 'Chaining Test')
                .addNavigationLink('start', '/root')
                .addNavigationLinks({
                    previous: '/page1',
                    next: '/page3',
                });

            expect(feed.getNavigationLink('start')).toBeDefined();
            expect(feed.getNavigationLink('previous')).toBeDefined();
            expect(feed.getNavigationLink('next')).toBeDefined();
        });

        it('should generate correct XML for navigation links', () => {
            const feed = new Feed('nav7', 'XML Navigation Test');
            feed.addNavigationLinks({
                start: '/root',
                next: '/page2',
                previous: '/page1',
            });

            const xml = feed.toXml({ baseUrl });
            expect(xml).toContain('rel="start"');
            expect(xml).toContain('rel="next"');
            expect(xml).toContain('rel="previous"');
            expect(xml).toContain(`href="${baseUrl}/root"`);
            expect(xml).toContain(`href="${baseUrl}/page2"`);
            expect(xml).toContain(`href="${baseUrl}/page1"`);
            expect(xml).toContain(
                'type="application/atom+xml;profile=opds-catalog;kind=navigation"'
            );
        });

        it('should handle replacement in addNavigationLinks', () => {
            const feed = new Feed('nav8', 'Replacement Test');
            feed.addNavigationLink('next', '/page2');
            feed.addNavigationLinks({
                next: '/page3',
                last: '/page10',
            });

            const nextLinks = feed
                .getLinks()
                .filter((link) => link.rel === 'next');
            expect(nextLinks).toHaveLength(1);
            expect(nextLinks[0].href).toBe('/page3');
            expect(feed.getNavigationLink('last')?.href).toBe('/page10');
        });
    });

    describe('Self Links', () => {
        it('should get self link', () => {
            const feed = new Feed('self1', 'Self Link Test');
            feed.addSelfLink('/feed', 'navigation');

            const selfLink = feed.getSelfLink();
            expect(selfLink).toBeDefined();
            expect(selfLink?.rel).toBe('self');
            expect(selfLink?.href).toBe('/feed');
        });

        it('should return undefined when no self link exists', () => {
            const feed = new Feed('self2', 'No Self Link Test');
            expect(feed.getSelfLink()).toBeUndefined();
        });
    });
});

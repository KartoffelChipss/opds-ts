import { Entry } from '../../versions/v1_2/entry';

describe('Entry', () => {
    const baseUrl = 'https://example.com';

    it('should construct with id and title', () => {
        const entry = new Entry('id1', 'Test Title');
        const opts = entry.getOptions();
        expect(opts.id).toBe('id1');
        expect(opts.title).toBe('Test Title');
    });

    it('should construct with EntryOptions object', () => {
        const entry = new Entry({
            id: 'id2',
            title: 'Another Title',
            author: 'Author Name',
            summary: 'A summary',
        });

        const opts = entry.getOptions();
        expect(opts.author).toBe('Author Name');
        expect(opts.summary).toBe('A summary');
    });

    it('should allow chaining methods', () => {
        const entry = new Entry('id3', 'Chained Entry')
            .setAuthor('Chainer')
            .setSummary('Summary text')
            .addLink({ rel: 'self', href: '/self' })
            .addExtra('foo', 'bar');

        const opts = entry.getOptions();
        expect(opts.author).toBe('Chainer');
        expect(opts.summary).toBe('Summary text');
        expect(opts.links?.length).toBe(1);
        expect(opts.extra?.foo).toBe('bar');
    });

    it('should add a subsection link', () => {
        const entry = new Entry('id_sub', 'Subsection Entry').addSubsection(
            '/subsection',
            'navigation'
        );

        const opts = entry.getOptions();
        expect(opts.links?.[0].rel).toBe('subsection');
        expect(opts.links?.[0].href).toBe('/subsection');
        expect(opts.links?.[0].type).toBe(
            'application/atom+xml;profile=opds-catalog;kind=navigation'
        );
    });

    it('should add an acquisition link', () => {
        const entry = new Entry('id_acq', 'Acquisition Entry').addSubsection(
            '/acquisition',
            'acquisition'
        );

        const opts = entry.getOptions();
        expect(opts.links?.[0].rel).toBe('subsection');
        expect(opts.links?.[0].href).toBe('/acquisition');
        expect(opts.links?.[0].type).toBe(
            'application/atom+xml;profile=opds-catalog;kind=acquisition'
        );
    });

    it('should add image and thumbnail links', () => {
        const entry = new Entry('id_img', 'Image Entry')
            .addImage('/images/img.jpg')
            .addThumbnail('/images/thumb.jpg');

        const opts = entry.getOptions();
        expect(opts.links?.[0].rel).toBe('http://opds-spec.org/image');
        expect(opts.links?.[0].type).toBe('image/jpeg');
        expect(opts.links?.[0].href).toBe('/images/img.jpg');

        expect(opts.links?.[1].rel).toBe(
            'http://opds-spec.org/image/thumbnail'
        );
        expect(opts.links?.[1].type).toBe('image/jpeg');
        expect(opts.links?.[1].href).toBe('/images/thumb.jpg');
    });

    it('should generate XML with correct structure', () => {
        const entry = new Entry('id4', 'XML Entry')
            .setAuthor('XML Author')
            .setSummary('XML Summary')
            .addLink({ rel: 'self', href: '/self' })
            .addPageStream(
                'http://example.com/entry/1/stream/{pageNumber}',
                'application/pdf',
                100
            )
            .addExtra('test:testkey', '10');

        const xml = entry.toXml({ baseUrl });

        expect(xml).toContain('<entry');
        expect(xml).toContain('<id>id4</id>');
        expect(xml).toContain('<title>XML Entry</title>');
        expect(xml).toContain('<author>');
        expect(xml).toContain('<name>XML Author</name>');
        expect(xml).toContain('<summary type="text">XML Summary</summary>');
        expect(xml).toContain('<link');
        expect(xml).toContain('href="https://example.com/self"'); // test if baseUrl is applied
        expect(xml).toContain('test:testkey="10"');
        expect(xml).toContain('pse:count="100"');
    });

    it('should generate updated timestamp if missing', () => {
        const entry = new Entry('id5', 'No Updated');
        const xml = entry.toXml();
        expect(xml).toMatch(/<updated>.*<\/updated>/);
    });

    it('should leave absolute URLs unchanged', () => {
        const entry = new Entry('id6', 'Absolute URL').addLink({
            rel: 'self',
            href: 'https://cdn.example.com/resource.jpg',
        });

        const xml = entry.toXml({ baseUrl });
        expect(xml).toContain('href="https://cdn.example.com/resource.jpg"');
    });
});

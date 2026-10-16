import { Publication } from '../../versions/v2/publication';

describe('Publication (v2)', () => {
    const baseUrl = 'https://example.com';

    it('should construct with identifier and title', () => {
        const pub = new Publication('urn:isbn:978031600000X', 'Moby-Dick');
        expect(pub.getIdentifier()).toBe('urn:isbn:978031600000X');
        expect(pub.getTitle()).toBe('Moby-Dick');
    });

    it('should construct with options and not share metadata', () => {
        const metadata = { title: { en: 'The Little Prince' } };
        const pub = new Publication({ metadata }).setDescription('desc');
        expect(pub.getTitle()).toEqual({ en: 'The Little Prince' });
        expect(metadata).not.toHaveProperty('description');
    });

    it('should set metadata with chaining', () => {
        const pub = new Publication('id', 'Title')
            .setType('http://schema.org/Book')
            .setSubtitle('Sub')
            .setLanguage('en')
            .setModified('2015-09-29T17:00:00Z')
            .setPublished('1851')
            .setNumberOfPages(635)
            .setPublisher('Harper & Brothers');

        expect(pub.getMetadata()).toMatchObject({
            '@type': 'http://schema.org/Book',
            subtitle: 'Sub',
            language: 'en',
            modified: '2015-09-29T17:00:00Z',
            published: '1851',
            numberOfPages: 635,
            publisher: 'Harper & Brothers',
        });
    });

    it('should collect multiple contributors of the same role', () => {
        const pub = new Publication('id', 'Title').addAuthor('A');
        expect(pub.getMetadata().author).toBe('A');
        pub.addAuthor({ name: 'B', sortAs: 'B, B' });
        expect(pub.getMetadata().author).toEqual([
            'A',
            { name: 'B', sortAs: 'B, B' },
        ]);
        pub.addContributor('translator', 'T');
        expect(pub.getMetadata().translator).toBe('T');
    });

    it('should set series, collections and subjects', () => {
        const pub = new Publication('id', 'Title')
            .setSeries('The Extraordinary Voyages', 3, [
                { href: '/series/167', type: 'application/opds+json' },
            ])
            .addCollection('SciFi Classics')
            .addSubject('Adventure')
            .addSubject({ name: 'Fiction', scheme: 'http://example.com' });

        const json = pub.toObject();
        expect(json.metadata.belongsTo).toEqual({
            series: {
                name: 'The Extraordinary Voyages',
                position: 3,
                links: [{ href: '/series/167', type: 'application/opds+json' }],
            },
            collection: 'SciFi Classics',
        });
        expect(json.metadata.subject).toEqual([
            'Adventure',
            { name: 'Fiction', scheme: 'http://example.com' },
        ]);
    });

    it('should add acquisition links with properties', () => {
        const pub = new Publication('id', 'Title')
            .addSelfLink('/publication.json')
            .addAcquisition('/file.epub', 'application/epub+zip', 'download')
            .addAcquisition('/buy', 'text/html', 'buy', {
                price: { currency: 'USD', value: 4.99 },
                indirectAcquisition: [{ type: 'application/epub+zip' }],
            });

        expect(pub.getSelfLink()?.type).toBe(
            'application/opds-publication+json'
        );
        expect(pub.getAcquisitionLinks()).toHaveLength(2);
        expect(pub.getLinks()[2]).toEqual({
            rel: 'buy',
            href: '/buy',
            type: 'text/html',
            properties: {
                price: { currency: 'USD', value: 4.99 },
                indirectAcquisition: [{ type: 'application/epub+zip' }],
            },
        });
    });

    it('should default acquisition rel to acquisition', () => {
        const pub = new Publication('id', 'Title').addAcquisition(
            '/f',
            'application/pdf'
        );
        expect(pub.getLinks()[0].rel).toBe('acquisition');
    });

    it('should add images', () => {
        const pub = new Publication('id', 'Title')
            .addImage('/cover.jpg', 'image/jpeg', { width: 800, height: 1400 })
            .addImage('/cover.png', 'image/png');
        expect(pub.getImages()).toEqual([
            {
                href: '/cover.jpg',
                type: 'image/jpeg',
                width: 800,
                height: 1400,
            },
            { href: '/cover.png', type: 'image/png' },
        ]);
    });

    it('should serialize with base URL and strip blank values', () => {
        const pub = new Publication('id', 'Title')
            .setDescription('')
            .addAcquisition('/file.epub', 'application/epub+zip', 'download')
            .addImage('cover.jpg')
            .addExtra('readingOrder', []);

        const json = JSON.parse(pub.toJson({ baseUrl }));
        expect(json).toEqual({
            metadata: { identifier: 'id', title: 'Title' },
            links: [
                {
                    rel: 'download',
                    href: 'https://example.com/file.epub',
                    type: 'application/epub+zip',
                },
            ],
            images: [
                { href: 'https://example.com/cover.jpg', type: 'image/jpeg' },
            ],
        });
    });

    it('should support compact JSON and JSON.stringify', () => {
        const pub = new Publication('id', 'Title');
        expect(pub.toJson({ prettyPrint: false })).toBe(
            '{"metadata":{"identifier":"id","title":"Title"}}'
        );
        expect(JSON.stringify(pub)).toBe(pub.toJson({ prettyPrint: false }));
    });

    it('should validate required fields', () => {
        const pub = new Publication('id', 'Title').addImage(
            '/c.tiff',
            'image/tiff'
        );
        const errors = pub.validate();
        expect(errors).toHaveLength(2);
        expect(errors[0]).toMatch(/acquisition link/);

        pub.addAcquisition('/f', 'application/epub+zip', 'download').addImage(
            '/c.jpg'
        );
        expect(pub.validate()).toEqual([]);
    });

    it('should accept OPDS 1.x acquisition relations', () => {
        const pub = new Publication('id', 'Title').addLink({
            rel: 'http://opds-spec.org/acquisition/open-access',
            href: '/f',
        });
        expect(pub.validate()).toEqual([]);
    });

    it('should round-trip through JSON', () => {
        const source = {
            metadata: {
                '@type': 'http://schema.org/EBook',
                identifier: 'urn:isbn:9780000000002',
                title: 'A Journey into the Center of the Earth',
                author: {
                    name: 'Jules Verne',
                    links: [{ href: '/author/1' }],
                },
            },
            links: [{ rel: 'download', href: '/f.epub' }],
            images: [{ href: '/c.jpg', type: 'image/jpeg' }],
            custom: [{ href: '/x' }],
        };
        const pub = Publication.fromJson(JSON.stringify(source));
        expect(pub.getOptions().extra).toEqual({ custom: [{ href: '/x' }] });
        expect(pub.toObject()).toEqual(source);
    });

    it('should throw on invalid JSON input', () => {
        expect(() => Publication.fromJson('[]')).toThrow();
        expect(() => Publication.fromJson({ links: [] })).toThrow(
            /metadata.title/
        );
    });
});

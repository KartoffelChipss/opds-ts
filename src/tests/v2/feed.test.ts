import { Feed } from '../../versions/v2/feed';
import { Group } from '../../versions/v2/group';
import { Facet } from '../../versions/v2/facet';
import { Publication } from '../../versions/v2/publication';

function mobyDick() {
    return new Publication('urn:isbn:978031600000X', 'Moby-Dick')
        .setType('http://schema.org/Book')
        .addAuthor('Herman Melville')
        .setLanguage('en')
        .setModified('2015-09-29T17:00:00Z')
        .addSelfLink('http://example.org/publication.json')
        .addAcquisition(
            'http://example.org/file.epub',
            'application/epub+zip',
            'download'
        )
        .addImage('http://example.org/cover.jpg', 'image/jpeg', {
            height: 1400,
            width: 800,
        });
}

describe('Feed (v2)', () => {
    const baseUrl = 'https://example.com';

    it('should construct with title or options', () => {
        expect(new Feed('Catalog').getTitle()).toBe('Catalog');
        const feed = new Feed({
            metadata: { title: 'Catalog', description: 'desc' },
            links: [{ rel: 'self', href: '/opds' }],
        });
        expect(feed.getMetadata().description).toBe('desc');
        expect(feed.getSelfLink()?.href).toBe('/opds');
    });

    it('should produce the navigation example from the spec', () => {
        const feed = new Feed('Example for navigation')
            .addSelfLink('http://example.com/opds')
            .addNavigation('/new', 'New Publications')
            .addNavigation('/popular', 'Popular Publications');

        expect(feed.validate()).toEqual([]);
        expect(feed.toObject()).toEqual({
            metadata: { title: 'Example for navigation' },
            links: [
                {
                    rel: 'self',
                    href: 'http://example.com/opds',
                    type: 'application/opds+json',
                },
            ],
            navigation: [
                {
                    href: '/new',
                    title: 'New Publications',
                    type: 'application/opds+json',
                },
                {
                    href: '/popular',
                    title: 'Popular Publications',
                    type: 'application/opds+json',
                },
            ],
        });
    });

    it('should replace an existing self link', () => {
        const feed = new Feed('F').addSelfLink('/a').addSelfLink('/b');
        expect(feed.getLinks()).toHaveLength(1);
        expect(feed.getSelfLink()?.href).toBe('/b');
    });

    it('should list publications', () => {
        const feed = new Feed('Example listing publications')
            .addSelfLink('http://example.com/new')
            .addPublication(mobyDick());

        expect(feed.validate()).toEqual([]);
        const json = feed.toObject();
        expect(json.publications).toHaveLength(1);
        expect(json.publications[0].metadata.title).toBe('Moby-Dick');
        expect(json.publications[0].images[0].width).toBe(800);
    });

    it('should support pagination', () => {
        const feed = new Feed('Paginated feed')
            .setPagination({
                numberOfItems: 5678,
                itemsPerPage: 50,
                currentPage: 2,
            })
            .addSelfLink('https://example.com/?page=2')
            .addPaginationLinks({
                previous: '/?page=1',
                next: '/?page=3',
                last: '/?page=114',
            })
            .addPaginationLink('next', '/?page=4');

        expect(feed.getMetadata()).toEqual({
            title: 'Paginated feed',
            numberOfItems: 5678,
            itemsPerPage: 50,
            currentPage: 2,
        });
        expect(feed.getLinks()).toHaveLength(4);
        expect(feed.getPaginationLink('next')?.href).toBe('/?page=4');

        const parsed = new Feed({
            metadata: { title: 'P' },
            links: [{ rel: ['first', 'prev'], href: '/1' }],
        });
        expect(parsed.getPaginationLink('previous')?.href).toBe('/1');
        expect(parsed.getPaginationLink('first')?.href).toBe('/1');
    });

    it('should add a templated search link and validate it', () => {
        const feed = new Feed('Search')
            .addSelfLink('/')
            .addNavigation('/new', 'New')
            .addSearchLink('/search{?query,title,author}');

        expect(feed.getSearchLink()).toEqual({
            rel: 'search',
            href: '/search{?query,title,author}',
            type: 'application/opds+json',
            templated: true,
        });
        expect(feed.validate()).toEqual([]);

        const bad = new Feed('Search')
            .addSelfLink('/')
            .addNavigation('/new', 'New')
            .addSearchLink('/search{?q}');
        expect(bad.validate()).toEqual([
            'Search link must be a URI template with a "query" parameter',
        ]);
    });

    it('should support facets', () => {
        const facet = new Facet('Language')
            .addFacet('/fr', 'French', { numberOfItems: 10 })
            .addFacet('/en', 'English', { numberOfItems: 40, active: true });

        const feed = new Feed('Faceted')
            .addSelfLink('/en')
            .addPublication(mobyDick())
            .addFacet(facet);

        expect(feed.validate()).toEqual([]);
        expect(feed.toObject().facets).toEqual([
            {
                metadata: { title: 'Language' },
                links: [
                    {
                        href: '/fr',
                        title: 'French',
                        type: 'application/opds+json',
                        properties: { numberOfItems: 10 },
                    },
                    {
                        href: '/en',
                        title: 'English',
                        type: 'application/opds+json',
                        rel: 'self',
                        properties: { numberOfItems: 40 },
                    },
                ],
            },
        ]);
    });

    it('should support groups mixing navigation and publications', () => {
        const feed = new Feed('Example for groups')
            .addSelfLink('http://example.com/grouped')
            .addGroup(
                new Group('Main Menu')
                    .addNavigation('/new', 'New Publications')
                    .addNavigation('/popular', 'Popular Publications'),
                new Group('Featured Books')
                    .setNumberOfItems(20)
                    .addSelfLink('https://example.com/featured')
                    .addPublication(mobyDick())
            );

        expect(feed.validate()).toEqual([]);
        const json = feed.toObject();
        expect(json.groups).toHaveLength(2);
        expect(json.groups[0].navigation).toHaveLength(2);
        expect(json.groups[1].metadata).toEqual({
            title: 'Featured Books',
            numberOfItems: 20,
        });
        expect(json.groups[1].publications).toHaveLength(1);
    });

    it('should report validation problems', () => {
        const feed = new Feed('Broken')
            .addFacet(new Facet('Empty'))
            .addGroup(new Group('Empty group'))
            .addNavigationLink({ href: '/x' } as any);
        feed.addGroup(
            new Group('Both')
                .addNavigation('/a', 'A')
                .addPublication(new Publication('id', 'T'))
        );

        expect(feed.validate()).toEqual([
            'Feed must contain a self link',
            'navigation link /x must have a title',
            'facets[0]: Facet group must contain at least one link',
            'groups[0]: Group must contain either a navigation or a publications collection',
            'groups[1]: Group must contain either a navigation or a publications collection',
            'groups[1]: publications[0]: Publication must contain at least one acquisition link',
        ]);
        expect(new Feed('Empty').addSelfLink('/').validate()).toEqual([
            'Feed must contain at least one navigation, publications or groups collection',
        ]);
    });

    it('should resolve relative hrefs everywhere with base URL', () => {
        const pub = new Publication('id', 'T')
            .addAuthor({ name: 'A', links: [{ href: '/author/1' }] })
            .addAcquisition('/f.epub', 'application/epub+zip', 'download')
            .addImage('/c.jpg');
        const feed = new Feed('F')
            .addSelfLink('/opds')
            .addSearchLink('/search{?query}')
            .addPublication(pub)
            .addFacet(new Facet('Sort').addFacet('/sort/new', 'Newest'))
            .addGroup(new Group('G').addNavigation('nav', 'Nav'));

        const json = JSON.parse(feed.toJson({ baseUrl }));
        expect(json.links[0].href).toBe('https://example.com/opds');
        expect(json.links[1].href).toBe('https://example.com/search{?query}');
        expect(json.publications[0].metadata.author.links[0].href).toBe(
            'https://example.com/author/1'
        );
        expect(json.publications[0].links[0].href).toBe(
            'https://example.com/f.epub'
        );
        expect(json.publications[0].images[0].href).toBe(
            'https://example.com/c.jpg'
        );
        expect(json.facets[0].links[0].href).toBe(
            'https://example.com/sort/new'
        );
        expect(json.groups[0].navigation[0].href).toBe(
            'https://example.com/nav'
        );
        // Internal state is untouched
        expect(feed.getSelfLink()?.href).toBe('/opds');
    });

    it('should keep extra properties', () => {
        const feed = new Feed('F')
            .addSelfLink('/')
            .addNavigation('/a', 'A')
            .addExtra('custom', [{ href: '/c' }]);
        expect(feed.toObject().custom).toEqual([{ href: '/c' }]);
    });

    it('should round-trip a full feed through JSON', () => {
        const feed = new Feed('Round trip')
            .setIdentifier('urn:uuid:1')
            .setModified('2025-01-01T00:00:00Z')
            .setPagination({
                numberOfItems: 1,
                itemsPerPage: 10,
                currentPage: 1,
            })
            .addSelfLink('/rt')
            .addSearchLink('/search{?query}')
            .addNavigation('/new', 'New', 'http://opds-spec.org/sort/new')
            .addPublication(mobyDick())
            .addFacet(
                new Facet('Language')
                    .addFacet('/en', 'English', { active: true })
                    .addFacet('/de', 'German')
            )
            .addGroup(new Group('Featured').addPublication(mobyDick()))
            .addExtra('custom', [{ href: '/c' }]);

        const json = feed.toJson();
        const parsed = Feed.fromJson(json);

        expect(parsed).toBeInstanceOf(Feed);
        expect(parsed.getPublications()[0]).toBeInstanceOf(Publication);
        expect(parsed.getFacets()[0]).toBeInstanceOf(Facet);
        expect(parsed.getGroups()[0]).toBeInstanceOf(Group);
        expect(parsed.getExtra()).toEqual({ custom: [{ href: '/c' }] });
        expect(parsed.toJson()).toBe(json);
        expect(parsed.validate()).toEqual([]);
    });

    it('should parse the grouped example from the spec', () => {
        const feed = Feed.fromJson({
            metadata: { title: 'Example for groups' },
            links: [
                {
                    rel: 'self',
                    href: 'http://example.com/grouped',
                    type: 'application/opds+json',
                },
            ],
            groups: [
                {
                    metadata: { title: 'Main Menu' },
                    navigation: [
                        {
                            href: '/new',
                            title: 'New Publications',
                            type: 'application/opds+json',
                        },
                    ],
                },
                {
                    metadata: { title: 'Featured Books', numberOfItems: 20 },
                    links: [
                        {
                            rel: 'self',
                            href: 'https://example.com/featured',
                            type: 'application/opds+json',
                        },
                    ],
                    publications: [mobyDick().toObject()],
                },
            ],
        });

        expect(feed.getGroups()[0].getNavigation()[0].title).toBe(
            'New Publications'
        );
        expect(feed.getGroups()[1].getSelfLink()?.href).toBe(
            'https://example.com/featured'
        );
        expect(
            feed.getGroups()[1].getPublications()[0].getMetadata().author
        ).toBe('Herman Melville');
        expect(feed.validate()).toEqual([]);
    });

    it('should throw on invalid feed JSON', () => {
        expect(() => Feed.fromJson('not json')).toThrow();
        expect(() => Feed.fromJson('null')).toThrow(/expected a JSON object/);
        expect(() => Feed.fromJson({ metadata: {} })).toThrow(/metadata.title/);
    });
});

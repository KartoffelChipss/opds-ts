import {
    FeedOptions,
    LanguageMap,
    Link,
    OPDS_FEED_TYPE,
    PaginationRel,
    SerializationOptions,
} from './types';
import { BaseCollection } from './collection';
import { Facet } from './facet';
import { Group } from './group';
import { Publication } from './publication';
import { cleanJson, hasRel, parseJsonObject } from '../../utils/json';

/**
 * An OPDS 2.0 catalog feed.
 */
export class Feed extends BaseCollection {
    private facets: Facet[] = [];
    private groups: Group[] = [];
    private extra?: Record<string, any>;

    /**
     * Creates a new Feed instance.
     * @param options - The options for the feed.
     */
    constructor(options: FeedOptions);

    /**
     * Creates a new Feed instance with a title.
     * @param title - The title of the feed.
     */
    constructor(title: LanguageMap);

    constructor(param: FeedOptions | LanguageMap) {
        if (typeof param === 'object' && 'metadata' in param) {
            const options = param as FeedOptions;
            super(options.metadata, options.links, options.navigation);
            this.extra = options.extra ? { ...options.extra } : undefined;
        } else if (param !== undefined) {
            super({ title: param as LanguageMap });
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    /**
     * Sets the identifier of the feed.
     * @param identifier - The identifier (URI) of the feed.
     * @returns The Feed instance (for chaining).
     */
    setIdentifier(identifier: string) {
        return this.setMetadataField('identifier', identifier);
    }

    /**
     * Sets the pagination metadata of the feed.
     * @param pagination - Total number of items, items per page and the current page.
     * @returns The Feed instance (for chaining).
     */
    setPagination({
        numberOfItems,
        itemsPerPage,
        currentPage,
    }: {
        numberOfItems?: number;
        itemsPerPage?: number;
        currentPage?: number;
    }) {
        return this.setMetadata({ numberOfItems, itemsPerPage, currentPage });
    }

    /**
     * Adds a pagination link to the feed. Any existing link with the same relation is replaced.
     * @param rel - The relation (`first`, `previous`, `next` or `last`).
     * @param href - The URL of the page.
     * @returns The Feed instance (for chaining).
     */
    addPaginationLink(rel: PaginationRel, href: string) {
        this.links = this.links.filter((link) => link.rel !== rel);
        return this.addLink({ rel, href, type: OPDS_FEED_TYPE });
    }

    /**
     * Adds multiple pagination links to the feed. Existing links with the same relation are replaced.
     * @param links - Object with relations as keys and URLs as values.
     * @returns The Feed instance (for chaining).
     */
    addPaginationLinks(links: Partial<Record<PaginationRel, string>>) {
        Object.entries(links).forEach(([rel, href]) => {
            if (href) this.addPaginationLink(rel as PaginationRel, href);
        });
        return this;
    }

    /**
     * Gets a pagination link of the feed.
     * @param rel - The relation (`first`, `previous`, `next` or `last`).
     * @returns The link, or undefined if not found.
     */
    getPaginationLink(rel: PaginationRel): Link | undefined {
        const rels = rel === 'previous' ? ['previous', 'prev'] : [rel];
        return this.links.find((link) => hasRel(link, ...rels));
    }

    /**
     * Adds a search link to the feed.
     * @param href - The URI template of the search, which must contain a `query` parameter (e.g. `/search{?query}`).
     * @param type - The media type of the search results (default: `application/opds+json`).
     * @returns The Feed instance (for chaining).
     */
    addSearchLink(href: string, type: string = OPDS_FEED_TYPE) {
        return this.addLink({ rel: 'search', href, type, templated: true });
    }

    /**
     * Gets the search link of the feed.
     * @returns The search link, or undefined if not found.
     */
    getSearchLink(): Link | undefined {
        return this.links.find((link) => hasRel(link, 'search'));
    }

    /**
     * Adds one or more facet groups to the feed.
     * @param facets - The facet groups to add.
     * @returns The Feed instance (for chaining).
     */
    addFacet(...facets: Facet[]) {
        this.facets.push(...facets);
        return this;
    }

    /**
     * Gets the facet groups of the feed.
     * @returns The array of facet groups.
     */
    getFacets() {
        return this.facets;
    }

    /**
     * Adds one or more groups to the feed.
     * @param groups - The groups to add.
     * @returns The Feed instance (for chaining).
     */
    addGroup(...groups: Group[]) {
        this.groups.push(...groups);
        return this;
    }

    /**
     * Gets the groups of the feed.
     * @returns The array of groups.
     */
    getGroups() {
        return this.groups;
    }

    /**
     * Adds an extra top-level property (e.g. a custom sub-collection) to the feed.
     * @param key - The key of the property.
     * @param value - The value of the property.
     * @returns The Feed instance (for chaining).
     */
    addExtra(key: string, value: any) {
        if (!this.extra) {
            this.extra = {};
        }
        this.extra[key] = value;
        return this;
    }

    /**
     * Gets the extra top-level properties of the feed.
     * @returns The extra properties.
     */
    getExtra() {
        return this.extra || {};
    }

    /**
     * Checks the feed against the requirements of the OPDS 2.0 specification.
     * @returns A list of problems. An empty list means the feed is valid.
     */
    validate(): string[] {
        const errors: string[] = [];
        if (!this.metadata.title)
            errors.push('Feed must have a title in its metadata');
        if (!this.getSelfLink()) errors.push('Feed must contain a self link');
        if (
            this.navigation.length === 0 &&
            this.publications.length === 0 &&
            this.groups.length === 0
        )
            errors.push(
                'Feed must contain at least one navigation, publications or groups collection'
            );
        errors.push(...this.validateNavigation(''));
        errors.push(...this.validatePublications(''));
        this.facets.forEach((facet, index) =>
            errors.push(
                ...facet.validate().map((e) => `facets[${index}]: ${e}`)
            )
        );
        this.groups.forEach((group, index) =>
            errors.push(
                ...group.validate().map((e) => `groups[${index}]: ${e}`)
            )
        );
        const search = this.getSearchLink();
        if (search && !/\{[?&][^}]*\bquery\b[^}]*\}/.test(search.href))
            errors.push(
                'Search link must be a URI template with a "query" parameter'
            );
        return errors;
    }

    /**
     * Converts the feed to a plain object following the OPDS 2.0 JSON structure.
     * Blank values are removed.
     * @param options - Serialization options (only `baseUrl` is used).
     * @returns The feed as a plain object.
     */
    toObject({ baseUrl }: SerializationOptions = {}): Record<string, any> {
        return cleanJson(
            {
                ...this.extra,
                metadata: this.metadata,
                links: this.links,
                navigation: this.navigation,
                facets: this.facets.map((facet) => facet.toObject()),
                publications: this.publications.map((publication) =>
                    publication.toObject()
                ),
                groups: this.groups.map((group) => group.toObject()),
            },
            baseUrl
        );
    }

    /**
     * Converts the feed to an OPDS 2.0 JSON string.
     * @param options - Serialization options.
     * @returns The feed as a JSON string.
     */
    toJson({ baseUrl, prettyPrint = true }: SerializationOptions = {}) {
        return JSON.stringify(
            this.toObject({ baseUrl }),
            null,
            prettyPrint ? 2 : undefined
        );
    }

    /**
     * Used by `JSON.stringify` to serialize the feed.
     */
    toJSON() {
        return this.toObject();
    }

    /**
     * Creates a Feed instance from OPDS 2.0 JSON.
     * @param json - The JSON string or an already parsed object.
     * @returns A new Feed instance.
     */
    static fromJson(json: string | object): Feed {
        const {
            metadata,
            links,
            navigation,
            publications,
            facets,
            groups,
            ...extra
        } = parseJsonObject(json, 'OPDS 2.0 feed');
        const feed = new Feed({
            metadata,
            links,
            navigation,
            extra: Object.keys(extra).length > 0 ? extra : undefined,
        });
        if (Array.isArray(publications))
            feed.addPublications(publications.map(Publication.fromJson));
        if (Array.isArray(facets)) feed.addFacet(...facets.map(Facet.fromJson));
        if (Array.isArray(groups)) feed.addGroup(...groups.map(Group.fromJson));
        return feed;
    }
}

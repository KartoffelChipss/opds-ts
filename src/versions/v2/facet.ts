import {
    FacetOptions,
    FeedMetadata,
    LanguageMap,
    Link,
    OPDS_FEED_TYPE,
    SerializationOptions,
} from './types';
import { cleanJson, parseJsonObject } from '../../utils/json';

/**
 * A facet group in an OPDS 2.0 feed, used to filter or reorder the publications of a feed.
 */
export class Facet {
    private metadata: FeedMetadata;
    private links: Link[];

    /**
     * Creates a new Facet instance.
     * @param options - The options for the facet group.
     */
    constructor(options: FacetOptions);

    /**
     * Creates a new Facet instance with a title.
     * @param title - The title of the facet group (e.g. `Language`).
     */
    constructor(title: LanguageMap);

    constructor(param: FacetOptions | LanguageMap) {
        if (typeof param === 'object' && 'metadata' in param) {
            const options = param as FacetOptions;
            this.metadata = { ...options.metadata };
            this.links = options.links ? [...options.links] : [];
        } else if (param !== undefined) {
            this.metadata = { title: param as LanguageMap };
            this.links = [];
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    /**
     * Gets the title of the facet group.
     * @returns The title.
     */
    getTitle() {
        return this.metadata.title;
    }

    /**
     * Gets the metadata of the facet group.
     * @returns The metadata object.
     */
    getMetadata() {
        return this.metadata;
    }

    /**
     * Adds one or more links to the facet group.
     * @param links - The links to add.
     * @returns The Facet instance (for chaining).
     */
    addLink(...links: Link[]) {
        this.links.push(...links);
        return this;
    }

    /**
     * Adds a facet to the group. This is a convenience method for facets linking to OPDS 2.0 feeds.
     * @param href - The URL of the facet.
     * @param title - The title of the facet (e.g. `English`).
     * @param options - `numberOfItems` hints at the number of publications for this facet, `active` marks the facet as currently selected.
     * @returns The Facet instance (for chaining).
     */
    addFacet(
        href: string,
        title: string,
        {
            numberOfItems,
            active = false,
            type = OPDS_FEED_TYPE,
        }: { numberOfItems?: number; active?: boolean; type?: string } = {}
    ) {
        return this.addLink({
            href,
            title,
            type,
            rel: active ? 'self' : undefined,
            properties:
                numberOfItems !== undefined ? { numberOfItems } : undefined,
        });
    }

    /**
     * Gets the links of the facet group.
     * @returns The array of links.
     */
    getLinks() {
        return this.links;
    }

    /**
     * Checks the facet group against the requirements of the OPDS 2.0 specification.
     * @returns A list of problems. An empty list means the facet group is valid.
     */
    validate(): string[] {
        const errors: string[] = [];
        if (!this.metadata.title)
            errors.push('Facet group must have a title in its metadata');
        if (this.links.length === 0)
            errors.push('Facet group must contain at least one link');
        return errors;
    }

    /**
     * Converts the facet group to a plain object following the OPDS 2.0 JSON structure.
     * @param options - Serialization options (only `baseUrl` is used).
     * @returns The facet group as a plain object.
     */
    toObject({ baseUrl }: SerializationOptions = {}): Record<string, any> {
        return cleanJson(
            { metadata: this.metadata, links: this.links },
            baseUrl
        );
    }

    /**
     * Used by `JSON.stringify` to serialize the facet group.
     */
    toJSON() {
        return this.toObject();
    }

    /**
     * Creates a Facet instance from OPDS 2.0 JSON.
     * @param json - The JSON string or an already parsed object.
     * @returns A new Facet instance.
     */
    static fromJson(json: string | object): Facet {
        const { metadata, links } = parseJsonObject(json, 'OPDS 2.0 facet');
        return new Facet({ metadata, links });
    }
}

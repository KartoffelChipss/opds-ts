import {
    ACQUISITION_RELS,
    AcquisitionRel,
    Contributor,
    ContributorObject,
    ContributorRole,
    LanguageMap,
    Link,
    LinkProperties,
    OPDS_IMAGE_TYPES,
    OPDS_PUBLICATION_TYPE,
    PublicationMetadata,
    PublicationOptions,
    SerializationOptions,
    Subject,
} from './types';
import { cleanJson, hasRel, parseJsonObject } from '../../utils/json';

function appendValue<T>(existing: T | T[] | undefined, value: T): T | T[] {
    if (existing === undefined) return value;
    return Array.isArray(existing) ? [...existing, value] : [existing, value];
}

/**
 * An OPDS 2.0 publication.
 */
export class Publication {
    private options: PublicationOptions;

    /**
     * Creates a new Publication instance.
     * @param options - The options for the publication.
     */
    constructor(options: PublicationOptions);

    /**
     * Creates a new Publication instance with identifier and title.
     * @param identifier - The unique identifier (URI) of the publication. (e.g. `urn:isbn:9780000000002`)
     * @param title - The title of the publication.
     */
    constructor(identifier: string, title: LanguageMap);

    constructor(param1: PublicationOptions | string, param2?: LanguageMap) {
        if (typeof param1 === 'string' && param2 !== undefined) {
            this.options = { metadata: { identifier: param1, title: param2 } };
        } else if (typeof param1 === 'object') {
            this.options = {
                ...param1,
                metadata: { ...param1.metadata },
            };
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    /**
     * Gets the identifier of the publication.
     * @returns The identifier of the publication.
     */
    getIdentifier() {
        return this.options.metadata.identifier;
    }

    /**
     * Gets the title of the publication.
     * @returns The title of the publication.
     */
    getTitle() {
        return this.options.metadata.title;
    }

    /**
     * Gets the metadata of the publication.
     * @returns The metadata object.
     */
    getMetadata(): PublicationMetadata {
        return this.options.metadata;
    }

    /**
     * Merges the given fields into the metadata of the publication.
     * @param metadata - The metadata fields to set.
     * @returns The Publication instance (for chaining).
     */
    setMetadata(metadata: Partial<PublicationMetadata>) {
        this.options.metadata = { ...this.options.metadata, ...metadata };
        return this;
    }

    /**
     * Sets a specific metadata field of the publication.
     * @param key - The key of the metadata field.
     * @param value - The value to set.
     * @returns The Publication instance (for chaining).
     */
    setMetadataField<K extends keyof PublicationMetadata>(
        key: K,
        value: PublicationMetadata[K]
    ) {
        this.options.metadata[key] = value;
        return this;
    }

    /**
     * Sets the schema.org type of the publication.
     * @param type - The type URI (e.g. `http://schema.org/Book`).
     * @returns The Publication instance (for chaining).
     */
    setType(type: string) {
        return this.setMetadataField('@type', type);
    }

    /**
     * Sets the subtitle of the publication.
     * @param subtitle - The subtitle.
     * @returns The Publication instance (for chaining).
     */
    setSubtitle(subtitle: LanguageMap) {
        return this.setMetadataField('subtitle', subtitle);
    }

    /**
     * Sets the description of the publication.
     * @param description - The description text.
     * @returns The Publication instance (for chaining).
     */
    setDescription(description: string) {
        return this.setMetadataField('description', description);
    }

    /**
     * Sets the language(s) of the publication.
     * @param language - BCP 47 language tag(s) (e.g. `en`).
     * @returns The Publication instance (for chaining).
     */
    setLanguage(language: string | string[]) {
        return this.setMetadataField('language', language);
    }

    /**
     * Sets the last modification date of the publication.
     * @param modified - The date in ISO 8601 format.
     * @returns The Publication instance (for chaining).
     */
    setModified(modified: string) {
        return this.setMetadataField('modified', modified);
    }

    /**
     * Sets the publication date of the publication.
     * @param published - The date in ISO 8601 format.
     * @returns The Publication instance (for chaining).
     */
    setPublished(published: string) {
        return this.setMetadataField('published', published);
    }

    /**
     * Adds a contributor with the given role. Multiple contributors with the same role are collected in a list.
     * @param role - The role of the contributor (e.g. `author`, `translator`, `publisher`).
     * @param contributor - The name of the contributor, or a contributor object.
     * @returns The Publication instance (for chaining).
     */
    addContributor(
        role: ContributorRole,
        contributor: string | ContributorObject
    ) {
        const metadata = this.options.metadata;
        metadata[role] = appendValue(
            metadata[role] as Contributor | undefined,
            contributor
        ) as Contributor;
        return this;
    }

    /**
     * Adds an author to the publication.
     * @param author - The name of the author, or a contributor object.
     * @returns The Publication instance (for chaining).
     */
    addAuthor(author: string | ContributorObject) {
        return this.addContributor('author', author);
    }

    /**
     * Sets the publisher of the publication.
     * @param publisher - The name of the publisher, or a contributor object.
     * @returns The Publication instance (for chaining).
     */
    setPublisher(publisher: string | ContributorObject) {
        return this.setMetadataField('publisher', publisher);
    }

    /**
     * Adds a subject to the publication.
     * @param subject - The subject name, or a subject object.
     * @returns The Publication instance (for chaining).
     */
    addSubject(subject: Exclude<Subject, any[]>) {
        this.options.metadata.subject = appendValue(
            this.options.metadata.subject,
            subject
        ) as Subject;
        return this;
    }

    /**
     * Sets the series the publication belongs to.
     * @param name - The name of the series.
     * @param position - The position of the publication in the series (optional).
     * @param links - Links related to the series, e.g. to a feed of the series (optional).
     * @returns The Publication instance (for chaining).
     */
    setSeries(name: LanguageMap, position?: number, links?: Link[]) {
        this.options.metadata.belongsTo = {
            ...this.options.metadata.belongsTo,
            series: { name, position, links },
        };
        return this;
    }

    /**
     * Adds a collection the publication belongs to.
     * @param collection - The name of the collection, or a collection object.
     * @returns The Publication instance (for chaining).
     */
    addCollection(collection: string | ContributorObject) {
        const belongsTo = { ...this.options.metadata.belongsTo };
        belongsTo.collection = appendValue(
            belongsTo.collection as Contributor | undefined,
            collection
        ) as Contributor;
        this.options.metadata.belongsTo = belongsTo;
        return this;
    }

    /**
     * Sets the number of pages of the publication.
     * @param numberOfPages - The number of pages.
     * @returns The Publication instance (for chaining).
     */
    setNumberOfPages(numberOfPages: number) {
        return this.setMetadataField('numberOfPages', numberOfPages);
    }

    /**
     * Adds one or more links to the publication.
     * @param links - The links to add.
     * @returns The Publication instance (for chaining).
     */
    addLink(...links: Link[]) {
        if (!this.options.links) {
            this.options.links = [];
        }
        this.options.links.push(...links);
        return this;
    }

    /**
     * Adds multiple links to the publication.
     * @param links - The links to add.
     * @returns The Publication instance (for chaining).
     */
    addLinks(links: Link[]) {
        return this.addLink(...links);
    }

    /**
     * Gets the current links of the publication.
     * @returns The array of links.
     */
    getLinks() {
        return this.options.links || [];
    }

    /**
     * Adds a self link to the publication, pointing to its OPDS publication document.
     * @param href - The URL of the publication document.
     * @returns The Publication instance (for chaining).
     */
    addSelfLink(href: string) {
        return this.addLink({ rel: 'self', href, type: OPDS_PUBLICATION_TYPE });
    }

    /**
     * Gets the self link of the publication.
     * @returns The self link, or undefined if not found.
     */
    getSelfLink(): Link | undefined {
        return this.getLinks().find((link) => hasRel(link, 'self'));
    }

    /**
     * Adds an acquisition link to the publication.
     * @param href - The URL of the acquisition link.
     * @param type - The media type of the resource (e.g. `application/epub+zip`).
     * @param rel - The acquisition relation (default: `acquisition`). See https://specs.opds.io/opds-2.0#53-acquisition-links
     * @param properties - Additional link properties, such as `price` or `indirectAcquisition` (optional).
     * @returns The Publication instance (for chaining).
     */
    addAcquisition(
        href: string,
        type: string,
        rel: AcquisitionRel = 'acquisition',
        properties?: LinkProperties
    ) {
        return this.addLink({ rel, href, type, properties });
    }

    /**
     * Gets all acquisition links of the publication.
     * @returns The array of acquisition links.
     */
    getAcquisitionLinks() {
        return this.getLinks().filter((link) =>
            hasRel(link, ...ACQUISITION_RELS)
        );
    }

    /**
     * Adds an image to the images collection of the publication.
     * @param href - The URL of the image.
     * @param type - The media type of the image (default: `image/jpeg`).
     * @param size - The dimensions of the image in pixels (optional).
     * @returns The Publication instance (for chaining).
     */
    addImage(
        href: string,
        type: string = 'image/jpeg',
        size?: { width?: number; height?: number }
    ) {
        if (!this.options.images) {
            this.options.images = [];
        }
        this.options.images.push({ href, type, ...size });
        return this;
    }

    /**
     * Gets the images of the publication.
     * @returns The array of image links.
     */
    getImages() {
        return this.options.images || [];
    }

    /**
     * Adds an extra top-level property (e.g. a custom sub-collection) to the publication.
     * @param key - The key of the property.
     * @param value - The value of the property.
     * @returns The Publication instance (for chaining).
     */
    addExtra(key: string, value: any) {
        if (!this.options.extra) {
            this.options.extra = {};
        }
        this.options.extra[key] = value;
        return this;
    }

    /**
     * Gets the publication options.
     * @returns The publication options.
     */
    getOptions() {
        return this.options;
    }

    /**
     * Checks the publication against the requirements of the OPDS 2.0 specification.
     * @returns A list of problems. An empty list means the publication is valid.
     */
    validate(): string[] {
        const errors: string[] = [];
        if (!this.options.metadata.title)
            errors.push('Publication must have a title in its metadata');
        if (this.getAcquisitionLinks().length === 0)
            errors.push(
                'Publication must contain at least one acquisition link'
            );
        const images = this.getImages();
        if (
            images.length > 0 &&
            !images.some(
                (image) => image.type && OPDS_IMAGE_TYPES.includes(image.type)
            )
        )
            errors.push(
                `At least one image must use one of: ${OPDS_IMAGE_TYPES.join(', ')}`
            );
        return errors;
    }

    /**
     * Converts the publication to a plain object following the OPDS 2.0 JSON structure.
     * Blank values are removed.
     * @param options - Serialization options (only `baseUrl` is used).
     * @returns The publication as a plain object.
     */
    toObject({ baseUrl }: SerializationOptions = {}): Record<string, any> {
        const { metadata, links, images, extra } = this.options;
        return cleanJson({ ...extra, metadata, links, images }, baseUrl);
    }

    /**
     * Converts the publication to an OPDS 2.0 JSON string.
     * @param options - Serialization options.
     * @returns The publication as a JSON string.
     */
    toJson({ baseUrl, prettyPrint = true }: SerializationOptions = {}) {
        return JSON.stringify(
            this.toObject({ baseUrl }),
            null,
            prettyPrint ? 2 : undefined
        );
    }

    /**
     * Used by `JSON.stringify` to serialize the publication.
     */
    toJSON() {
        return this.toObject();
    }

    /**
     * Creates a Publication instance from OPDS 2.0 JSON.
     * @param json - The JSON string or an already parsed object.
     * @returns A new Publication instance.
     */
    static fromJson(json: string | object): Publication {
        const { metadata, links, images, ...extra } = parseJsonObject(
            json,
            'OPDS 2.0 publication'
        );
        return new Publication({
            metadata,
            links,
            images,
            extra: Object.keys(extra).length > 0 ? extra : undefined,
        });
    }
}

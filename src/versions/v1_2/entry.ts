import {
    AcquisitionRel,
    DCMetadata,
    EntryOptions,
    FeedKind,
    Link,
    SerializationOptions,
} from './types';
import { EntryXmlSerializer } from '../../utils/xml/EntryXmlSerializer';
import { EntryXmlParser } from '../../utils/xml/EntryXmlParser';

/**
 * An entry in an OPDS feed.
 */
export class Entry {
    private options: EntryOptions;

    /**
     * Creates a new Entry instance.
     * @param options - The options for the entry.
     */
    constructor(options: EntryOptions);

    /**
     * Creates a new Entry instance with id and title.
     * @param id - The unique identifier for the entry.
     * @param title - The title of the entry.
     */
    constructor(id: string, title: string);

    constructor(param1: EntryOptions | string, param2?: string) {
        if (typeof param1 === 'string' && param2 !== undefined) {
            this.options = { id: param1, title: param2, dcMetadata: {} };
        } else if (typeof param1 === 'object') {
            this.options = { ...param1, dcMetadata: param1.dcMetadata || {} };
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    /**
     * Gets the ID of the entry.
     * @returns The ID of the entry.
     */
    getId() {
        return this.options.id;
    }

    /**
     * Gets the title of the entry.
     * @returns The title of the entry.
     */
    getTitle() {
        return this.options.title;
    }

    /**
     * Adds one or more links to the feed.
     * @param links - The links to add.
     * @returns The Feed instance (for chaining).
     */
    addLink(...links: Link[]) {
        if (!this.options.links) {
            this.options.links = [];
        }
        this.options.links.push(...links);
        return this;
    }

    /**
     * Adds multiple links to the entry.
     * @param links - The links to add.
     * @returns The Entry instance (for chaining).
     */
    addLinks(links: Link[]) {
        if (!this.options.links) {
            this.options.links = [];
        }
        this.options.links.push(...links);
        return this;
    }

    /**
     * Adds an image link to the entry. This is a convenience method for adding an image link with the appropriate rel and type. The image is assumed to be a JPEG.
     * @param href - The URL of the image.
     * @returns The Entry instance (for chaining).
     */
    addImage(href: string, type: string = 'image/jpeg') {
        return this.addLink({
            rel: 'http://opds-spec.org/image',
            href,
            type,
        });
    }

    /**
     * Adds a thumbnail link to the entry. This is a convenience method for adding a thumbnail link with the appropriate rel and type. The thumbnail is assumed to be a JPEG.
     * @param href - The URL of the thumbnail image.
     * @returns The Entry instance (for chaining).
     */
    addThumbnail(href: string, type: string = 'image/jpeg') {
        return this.addLink({
            rel: 'http://opds-spec.org/image/thumbnail',
            href,
            type,
        });
    }

    /**
     * Adds a subsection link to the entry. This is a convenience method for adding a subsection link with the appropriate rel and type. This is used to link to a subsection feed (e.g. a category or collection).
     * @param href - The URL of the subsection.
     * @param kind - The kind of the feed (navigation or acquisition).
     * @returns The Entry instance (for chaining).
     */
    addSubsection(href: string, kind: FeedKind) {
        return this.addLink({
            rel: 'subsection',
            href,
            type: `application/atom+xml;profile=opds-catalog;kind=${kind}`,
        });
    }

    /**
     * Adds an acquisition link to the entry. This is a convenience method for adding an acquisition link with the appropriate rel. If openAccess is true, the rel will be set to open-access.
     * @param href - The URL of the acquisition link.
     * @param contentTtype - The content type of the acquisition link (e.g., application/epub+zip or application/x-cbz).
     * @param aquisitionRel - The specific acquisition relation (e.g., buy, borrow, sample). OPDS acquisition relations: https://specs.opds.io/opds-1.2#521-acquisition-relations
     * @returns The Entry instance (for chaining).
     */
    addAcquisition(
        href: string,
        contentTtype: string,
        aquisitionRel?: AcquisitionRel
    ) {
        return this.addLink({
            rel: aquisitionRel
                ? `http://opds-spec.org/acquisition/${aquisitionRel}`
                : 'http://opds-spec.org/acquisition',
            href,
            type: contentTtype,
        });
    }

    /**
     * Adds a page stream link to the entry. This is a convenience method for adding a page stream link with the appropriate rel and properties. This is using the [OPDS Page Stream Extension](https://anansi-project.github.io/docs/category/opds-page-streaming-extension).
     * @param href - The URL of the page stream link. (Replaces `{pageNumber}` with the actual page number when requesting a specific page.)
     * @param type - The type of the page stream link (e.g., `image/jpeg`).
     * @param pageCount - The total number of pages in the resource.
     * @returns The Entry instance (for chaining).
     */
    addPageStream(href: string, type: string, pageCount: number) {
        return this.addLink({
            rel: 'http://vaemendis.net/opds-pse/stream',
            href,
            type,
            properties: {
                'xmlns:pse': 'http://vaemendis.net/opds-pse/ns',
                'pse:count': pageCount,
            },
        });
    }

    /**
     * Sets the summary of the entry.
     * @param summary - The summary text.
     * @returns The Entry instance (for chaining).
     */
    setSummary(summary: string) {
        this.options.summary = summary;
        return this;
    }

    /**
     * Gets the summary of the entry.
     * @returns The summary text.
     */
    getSummary() {
        return this.options.summary;
    }

    /**
     * Sets the content of the entry.
     * @param content - The content object with type and value.
     * @returns The Entry instance (for chaining).
     */
    setContent(content: { type?: string; value: string }) {
        this.options.content = content;
        return this;
    }

    /**
     * Gets the content of the entry.
     * @returns The content object.
     */
    getContent() {
        return this.options.content;
    }

    /**
     * Sets the author of the entry.
     * @param author - The author's name.
     * @returns The Entry instance (for chaining).
     */
    setAuthor(author: string) {
        this.options.author = author;
        return this;
    }

    /**
     * Gets the author information of the entry.
     * @returns The author information.
     */
    getAuthor() {
        return this.options.author;
    }

    /**
     * Sets the updated date of the entry.
     * @param updated - The updated date in ISO 8601 format.
     * @returns The Entry instance (for chaining).
     */
    setUpdated(updated: string) {
        this.options.updated = updated;
        return this;
    }

    /**
     * Gets the updated date of the entry.
     * @returns The updated date.
     */
    getUpdated() {
        return this.options.updated;
    }

    /**
     * Sets the rights information for the entry.
     * @param rights - The rights information.
     * @returns The Entry instance (for chaining).
     */
    setRights(rights: string) {
        this.options.rights = rights;
        return this;
    }

    /**
     * Gets the rights information of the entry.
     * @returns The rights information.
     */
    getRights() {
        return this.options.rights;
    }

    /**
     * Sets the DC metadata of the entry.
     * @param dcMetadata - The DC metadata object.
     * @returns The Entry instance (for chaining).
     */
    setDcMetadata(dcMetadata: DCMetadata) {
        this.options.dcMetadata = dcMetadata;
        return this;
    }

    /**
     * Sets a specific field in the DC metadata of the entry.
     * @param key - The key of the DC metadata field.
     * @param value - The value to set for the specified field.
     * @returns The Entry instance (for chaining).
     */
    setDcMetadataField<K extends keyof DCMetadata>(
        key: K,
        value: DCMetadata[K]
    ) {
        if (!this.options.dcMetadata) {
            this.options.dcMetadata = {};
        }
        this.options.dcMetadata[key] = value;
        return this;
    }

    /**
     * Gets the DC metadata of the entry.
     * @returns The DC metadata.
     */
    getDcMetadata(): DCMetadata {
        return this.options.dcMetadata || {};
    }

    /**
     * Adds extra metadata to the entry.
     * @param key - The key for the extra metadata.
     * @param value - The value for the extra metadata.
     * @returns The Entry instance (for chaining).
     */
    addExtra(key: string, value: any) {
        if (!this.options.extra) {
            this.options.extra = {};
        }
        this.options.extra[key] = value;
        return this;
    }

    /**
     * Gets the current links in the entry.
     * @returns The array of links.
     */
    getLinks() {
        return this.options.links || [];
    }

    /**
     * Gets the entry options.
     * @returns The entry options.
     */
    getOptions() {
        return this.options;
    }

    /**
     * Converts the entry to XML string.
     * @param options Serialization options.
     * @returns XML string representing the entry
     */
    toXml({ baseUrl, prettyPrint = true }: SerializationOptions = {}): string {
        const serializer = new EntryXmlSerializer(this);
        return serializer.serialize({ baseUrl, prettyPrint });
    }

    /**
     * Creates an Entry instance from an XML string.
     * @param xmlString - The XML string representing an entry.
     * @returns A new Entry instance.
     */
    static fromXml(xmlString: string): Entry {
        return EntryXmlParser.fromXml(xmlString);
    }
}

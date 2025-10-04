import { create } from 'xmlbuilder2';
import { EntryOptions, FeedKind, Link } from '../../model/types';
import { applyBaseUrl } from '../../utils/url';

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
            this.options = { id: param1, title: param2 };
        } else if (typeof param1 === 'object') {
            this.options = { ...param1 };
        } else {
            throw new Error('Invalid constructor arguments');
        }
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
     * @param type - The type of the acquisition link (e.g., application/epub+zip or application/x-cbz).
     * @param openAccess - Whether the acquisition is open access.
     * @returns The Entry instance (for chaining).
     */
    addAcquisition(href: string, type: string, openAccess = false) {
        return this.addLink({
            rel: openAccess
                ? 'http://opds-spec.org/acquisition/open-access'
                : 'http://opds-spec.org/acquisition',
            href,
            type,
        });
    }

    /**
     * Adds a page stream link to the entry. This is a convenience method for adding a page stream link with the appropriate rel and properties. This is using the [OPDS Page Stream Extension](https://anansi-project.github.io/docs/category/opds-page-streaming-extension).
     * @param href - The URL of the page stream link. (Replaces {pageNumber} with the actual page number when requesting a specific page.)
     * @param type - The type of the page stream link (e.g., image/jpeg).
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
     * Sets the content of the entry.
     * @param content - The content object with type and value.
     * @returns The Entry instance (for chaining).
     */
    setContent(content: { type?: string; value: string }) {
        this.options.content = content;
        return this;
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
     * Sets the updated date of the entry.
     * @param updated - The updated date in ISO 8601 format.
     * @returns The Entry instance (for chaining).
     */
    setUpdated(updated: string) {
        this.options.updated = updated;
        return this;
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
     * Gets the entry options.
     * @returns The entry options.
     */
    getOptions() {
        return this.options;
    }

    /**
     * Converts the entry to XML string.
     * @param options.baseUrl - Base URL to resolve relative links (optional).
     * @param options.prettyPrint - Whether to pretty print the XML (default: true).
     * @returns XML string representing the entry
     */
    toXml({
        baseUrl,
        prettyPrint = true,
    }: { baseUrl?: string; prettyPrint?: boolean } = {}): string {
        const entryEl = create().ele('entry');
        entryEl.ele('id').txt(this.options.id).up();
        entryEl.ele('title').txt(this.options.title).up();
        entryEl
            .ele('updated')
            .txt(this.options.updated || new Date().toISOString())
            .up();

        if (this.options.author) {
            entryEl
                .ele('author')
                .ele('name')
                .txt(this.options.author)
                .up()
                .up();
        }

        if (this.options.summary) {
            entryEl
                .ele('summary', { type: 'text' })
                .txt(this.options.summary)
                .up();
        }

        if (this.options.content) {
            entryEl
                .ele('content', { type: this.options.content.type || 'text' })
                .txt(this.options.content.value)
                .up();
        }

        for (const link of this.options.links || []) {
            const href = applyBaseUrl(link.href, baseUrl);
            const linkElement = entryEl.ele('link');

            const { properties, ...attrs } = link;
            linkElement.att({ ...attrs, href });

            if (properties && typeof properties === 'object') {
                Object.entries(properties).forEach(([key, value]) => {
                    linkElement.att(key, String(value));
                });
            }

            linkElement.up();
        }

        if (this.options.extra) {
            Object.entries(this.options.extra).forEach(([key, value]) => {
                entryEl.att(key, String(value));
            });
        }

        return entryEl.end({ prettyPrint });
    }
}

import { create } from 'xmlbuilder2';
import { FeedKind, FeedOptions, Link } from '../../model/types';
import { Entry } from './entry';
import { applyBaseUrl } from '../../utils/url';

export class Feed {
    private options: FeedOptions;
    private entries: Entry[] = [];

    constructor(options: FeedOptions);
    constructor(id: string, title: string);

    constructor(param1: FeedOptions | string, param2?: string) {
        if (typeof param1 === 'string' && param2 !== undefined) {
            this.options = { id: param1, title: param2 };
        } else if (typeof param1 === 'object') {
            this.options = { ...param1 };
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    /**
     * Adds one or more entries to the feed.
     * @param entries - The entries to add.
     * @returns The Feed instance (for chaining).
     */
    addEntry(...entries: Entry[]) {
        this.entries.push(...entries);
        return this;
    }

    /**
     * Adds multiple entries to the feed.
     * @param entries - The entries to add.
     * @returns The Feed instance (for chaining).
     */
    addEntries(entries: Entry[]) {
        this.entries.push(...entries);
        return this;
    }

    /**
     * Sets the updated date of the feed.
     * @param updated - The updated date in ISO 8601 format.
     * @returns The Feed instance (for chaining).
     */
    setUpdated(updated: string) {
        this.options.updated = updated;
        return this;
    }

    /**
     * Sets the kind of the feed.
     * @param kind - The kind of the feed (e.g., 'navigation', 'acquisition').
     * @returns The Feed instance (for chaining).
     */
    setKind(kind: FeedKind) {
        this.options.kind = kind;
        return this;
    }

    /**
     * Sets the author of the feed.
     * @param author - The author of the feed.
     * @returns The Feed instance (for chaining).
     */
    setAuthor(author: string) {
        this.options.author = author;
        return this;
    }

    /**
     * Sets the language of the feed.
     * @param lang - The language of the feed. (e.g. 'en', 'de', etc.)
     * @returns The Feed instance (for chaining).
     */
    setLang(lang: string) {
        this.options.lang = lang;
        return this;
    }

    /**
     * Adds extra fields to the feed.
     * @param key - The key of the extra field.
     * @param value - The value of the extra field.
     * @returns The Feed instance (for chaining).
     */
    addExtra(key: string, value: any) {
        if (!this.options.extra) {
            this.options.extra = {};
        }
        this.options.extra[key] = value;
        return this;
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
     * Adds a self link to the feed. This is a convenience method for adding a self link with the appropriate rel and type.
     * @param href - The URL of the feed.
     * @param kind - The kind of the feed (navigation or acquisition).
     * @returns The Feed instance (for chaining).
     */
    addSelfLink(href: string, kind?: FeedKind) {
        return this.addLink({
            rel: 'self',
            href,
            type: `application/atom+xml;profile=opds-catalog;kind=${kind || this.options.kind || 'navigation'}`,
        });
    }

    /**
     * Adds a start link to the feed. This is a convenience method for adding a start link with the appropriate rel and type.
     * @param href - The URL of the start link.
     * @returns The Feed instance (for chaining).
     */
    addStartLink(href: string) {
        return this.addLink({
            rel: 'start',
            href,
            type: `application/atom+xml;profile=opds-catalog;kind=navigation`,
        });
    }

    /**
     * Gets the current feed options.
     * @returns The feed options.
     */
    getOptions() {
        return this.options;
    }

    /**
     * Gets the current entries in the feed.
     * @returns The array of entries.
     */
    getEntries() {
        return this.entries;
    }

    /**
     * Converts the feed to an OPDS/Atom XML string.
     * @param options.baseUrl - Base URL to resolve relative links (optional).
     * @param options.prettyPrint - Whether to pretty print the XML (default: true).
     * @return The feed as an XML string.
     */
    toXml({
        baseUrl,
        prettyPrint = true,
    }: { baseUrl?: string; prettyPrint?: boolean } = {}) {
        const root = create({ version: '1.0', encoding: 'utf-8' }).ele('feed', {
            xmlns: 'http://www.w3.org/2005/Atom',
            'xmlns:opds': 'http://opds-spec.org/2010/catalog',
            'xmlns:dcterms': 'http://purl.org/dc/terms/',
        });

        if (this.options.lang) {
            root.att('xml:lang', this.options.lang);
        }

        root.ele('id').txt(this.options.id).up();
        root.ele('title').txt(this.options.title).up();
        root.ele('updated')
            .txt(this.options.updated || new Date().toISOString())
            .up();

        const authorName =
            this.options.author ||
            (this.options.extra && this.options.extra.author) ||
            undefined;
        if (authorName) {
            root.ele('author').ele('name').txt(authorName).up().up();
        }

        for (const link of this.options.links || []) {
            const href = applyBaseUrl(link.href, baseUrl);
            const linkElement = root.ele('link');

            const { properties, ...attrs } = link;
            linkElement.att({ ...attrs, href });

            if (properties && typeof properties === 'object') {
                Object.entries(properties).forEach(([key, value]) => {
                    linkElement.att(key, String(value));
                });
            }

            linkElement.up();
        }

        for (const entry of this.entries) {
            const entryXml = entry.toXml({ baseUrl, prettyPrint: false });
            const frag = create(entryXml).root();
            root.import(frag);
        }

        return root.end({ prettyPrint });
    }
}

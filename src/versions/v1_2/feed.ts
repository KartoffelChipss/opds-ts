import { FeedKind, FeedOptions, Link, NavigationRel } from './types';
import { Entry } from './entry';
import { FeedXmlSerializer } from '../../utils/xml';
import { FeedXmlParser } from '../../utils/xml/FeedXmlParser';

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
     * Gets the current entries in the feed.
     * @returns The array of entries.
     */
    getEntries() {
        return this.entries;
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
     * Gets the updated date of the feed.
     * @returns The updated date in ISO 8601 format.
     */
    getUpdated() {
        return this.options.updated;
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
     * Gets the kind of the feed.
     * @returns The kind of the feed.
     */
    getKind() {
        return this.options.kind;
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
     * Gets the author of the feed.
     * @returns The author of the feed.
     */
    getAuthor() {
        return this.options.author;
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
     * Gets the language of the feed.
     * @returns The language of the feed.
     */
    getLang() {
        return this.options.lang;
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
     * Gets the current links in the entry.
     * @returns The array of links.
     */
    getLinks() {
        return this.options.links || [];
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
     * Gets the self link of the feed.
     * @returns The self link, or undefined if not found.
     */
    getSelfLink(): Link | undefined {
        const links = this.getLinks();
        return links.find((link) => link.rel === 'self');
    }

    /**
     * Adds a navigation link to the feed with the specified rel attribute.
     * If a navigation link with the same rel already exists, it will be replaced.
     * @param rel - The relationship type ('start', 'previous', 'next', 'last', 'first').
     * @param href - The URL of the link.
     * @returns The Feed instance (for chaining).
     */
    addNavigationLink(rel: NavigationRel, href: string) {
        // Remove any existing navigation link with the same rel
        if (this.options.links) {
            this.options.links = this.options.links.filter(
                (link) => link.rel !== rel
            );
        }

        return this.addLink({
            rel,
            href,
            type: `application/atom+xml;profile=opds-catalog;kind=navigation`,
        });
    }

    /**
     * Gets a navigation link from the feed by its rel attribute.
     * @param rel - The relationship type ('start', 'previous', 'next', 'last', 'first').
     * @returns The navigation link, or undefined if not found.
     */
    getNavigationLink(rel: NavigationRel): Link | undefined {
        const links = this.getLinks();
        return links.find((link) => link.rel === rel);
    }

    /**
     * Adds multiple navigation links to the feed.
     * If navigation links with the same rel already exist, they will be replaced.
     * @param links - Object with navigation link types as keys and URLs as values.
     * @returns The Feed instance (for chaining).
     */
    addNavigationLinks(links: Partial<Record<NavigationRel, string>>) {
        Object.entries(links).forEach(([rel, href]) => {
            if (href) {
                this.addNavigationLink(rel as NavigationRel, href);
            }
        });
        return this;
    }

    /**
     * Gets the current feed options.
     * @returns The feed options.
     */
    getOptions() {
        return this.options;
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
        const serializer = new FeedXmlSerializer(this);
        return serializer.serialize({ baseUrl, prettyPrint });
    }

    /**
     * Creates a Feed instance from an XML string.
     * @param xmlString - The XML string representing a feed.
     * @returns A new Feed instance.
     */
    static fromXml(xmlString: string): Feed {
        return FeedXmlParser.fromXml(xmlString);
    }
}

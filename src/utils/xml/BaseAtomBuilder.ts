import { Link } from '../../model/types';
import { applyBaseUrl } from '../url';
import { XmlSerializable, AtomElementBuilder } from './types';

export abstract class BaseAtomBuilder<T extends XmlSerializable>
    implements AtomElementBuilder<T>
{
    protected root: any;

    constructor(
        protected elementName: string,
        protected namespaces?: Record<string, string>
    ) {
        this.initializeRoot();
    }

    protected abstract initializeRoot(): void;
    protected abstract addCoreMetadata(options: T): void;
    protected abstract addExtraContent(options: T): void;

    /**
     * Sets the metadata for the element (id, title, updated, author, etc.).
     * @param options - The element options containing metadata.
     * @returns The builder instance for chaining.
     */
    setMetadata(options: T): this {
        this.addCoreMetadata(options);
        this.addExtraContent(options);
        return this;
    }

    /**
     * Adds links to the element.
     * @param links - Array of links to add.
     * @param baseUrl - Base URL to resolve relative links.
     * @returns The builder instance for chaining.
     */
    addLinks(links: Link[], baseUrl?: string): this {
        for (const link of links) {
            this.addLink(link, baseUrl);
        }
        return this;
    }

    /**
     * Adds a single link to the element.
     * @param link - The link to add.
     * @param baseUrl - Base URL to resolve relative links.
     * @returns The builder instance for chaining.
     */
    addLink(link: Link, baseUrl?: string): this {
        const href = applyBaseUrl(link.href, baseUrl);
        const linkElement = this.root.ele('link');

        const { properties, ...attrs } = link;
        linkElement.att({ ...attrs, href });

        if (properties && typeof properties === 'object') {
            Object.entries(properties).forEach(([key, value]) => {
                linkElement.att(key, String(value));
            });
        }

        linkElement.up();
        return this;
    }

    /**
     * Builds and returns the final XML string.
     * @param prettyPrint - Whether to format the XML with indentation.
     * @returns The XML string.
     */
    build(prettyPrint: boolean = true): string {
        return this.root.end({ prettyPrint });
    }

    /**
     * Gets the root XML element for advanced manipulation.
     * @returns The root XML element.
     */
    getRoot() {
        return this.root;
    }

    /**
     * Helper method to add author element if present.
     * @param authorName - The author name to add.
     */
    protected addAuthorIfPresent(authorName?: string): void {
        if (authorName) {
            this.root.ele('author').ele('name').txt(authorName).up().up();
        }
    }

    /**
     * Helper method to add extra attributes to the root element.
     * @param extra - Extra attributes to add.
     */
    protected addExtraAttributes(extra?: Record<string, any>): void {
        if (extra) {
            Object.entries(extra).forEach(([key, value]) => {
                this.root.att(key, String(value));
            });
        }
    }
}

import {
    FeedMetadata,
    LanguageMap,
    Link,
    NavigationLink,
    OPDS_FEED_TYPE,
} from './types';
import { Publication } from './publication';
import { hasRel } from '../../utils/json';

/**
 * Shared functionality of feeds and groups: metadata, links, navigation and publications.
 */
export abstract class BaseCollection {
    protected metadata: FeedMetadata;
    protected links: Link[];
    protected navigation: NavigationLink[];
    protected publications: Publication[] = [];

    protected constructor(
        metadata: FeedMetadata,
        links?: Link[],
        navigation?: NavigationLink[]
    ) {
        this.metadata = { ...metadata };
        this.links = links ? [...links] : [];
        this.navigation = navigation ? [...navigation] : [];
    }

    /**
     * Gets the title.
     * @returns The title.
     */
    getTitle() {
        return this.metadata.title;
    }

    /**
     * Gets the metadata.
     * @returns The metadata object.
     */
    getMetadata(): FeedMetadata {
        return this.metadata;
    }

    /**
     * Merges the given fields into the metadata.
     * @param metadata - The metadata fields to set.
     * @returns This instance (for chaining).
     */
    setMetadata(metadata: Partial<FeedMetadata>) {
        this.metadata = { ...this.metadata, ...metadata };
        return this;
    }

    /**
     * Sets a specific metadata field.
     * @param key - The key of the metadata field.
     * @param value - The value to set.
     * @returns This instance (for chaining).
     */
    setMetadataField<K extends keyof FeedMetadata>(
        key: K,
        value: FeedMetadata[K]
    ) {
        this.metadata[key] = value;
        return this;
    }

    /**
     * Sets the subtitle.
     * @param subtitle - The subtitle.
     * @returns This instance (for chaining).
     */
    setSubtitle(subtitle: LanguageMap) {
        return this.setMetadataField('subtitle', subtitle);
    }

    /**
     * Sets the description.
     * @param description - The description text.
     * @returns This instance (for chaining).
     */
    setDescription(description: string) {
        return this.setMetadataField('description', description);
    }

    /**
     * Sets the last modification date.
     * @param modified - The date in ISO 8601 format.
     * @returns This instance (for chaining).
     */
    setModified(modified: string) {
        return this.setMetadataField('modified', modified);
    }

    /**
     * Sets the total number of items in the collection.
     * @param numberOfItems - The number of items.
     * @returns This instance (for chaining).
     */
    setNumberOfItems(numberOfItems: number) {
        return this.setMetadataField('numberOfItems', numberOfItems);
    }

    /**
     * Adds one or more links.
     * @param links - The links to add.
     * @returns This instance (for chaining).
     */
    addLink(...links: Link[]) {
        this.links.push(...links);
        return this;
    }

    /**
     * Adds multiple links.
     * @param links - The links to add.
     * @returns This instance (for chaining).
     */
    addLinks(links: Link[]) {
        return this.addLink(...links);
    }

    /**
     * Gets the current links.
     * @returns The array of links.
     */
    getLinks() {
        return this.links;
    }

    /**
     * Adds a self link. Any existing self link is replaced.
     * @param href - The URL of the collection.
     * @param type - The media type (default: `application/opds+json`).
     * @returns This instance (for chaining).
     */
    addSelfLink(href: string, type: string = OPDS_FEED_TYPE) {
        this.links = this.links.filter((link) => !hasRel(link, 'self'));
        return this.addLink({ rel: 'self', href, type });
    }

    /**
     * Gets the self link.
     * @returns The self link, or undefined if not found.
     */
    getSelfLink(): Link | undefined {
        return this.links.find((link) => hasRel(link, 'self'));
    }

    /**
     * Adds one or more links to the navigation collection. Each link must have a title.
     * @param links - The navigation links to add.
     * @returns This instance (for chaining).
     */
    addNavigationLink(...links: NavigationLink[]) {
        this.navigation.push(...links);
        return this;
    }

    /**
     * Adds a link to the navigation collection. This is a convenience method for links to other OPDS 2.0 feeds.
     * @param href - The URL of the linked feed.
     * @param title - The title of the link.
     * @param rel - The relation of the link (optional).
     * @param type - The media type (default: `application/opds+json`).
     * @returns This instance (for chaining).
     */
    addNavigation(
        href: string,
        title: string,
        rel?: string,
        type: string = OPDS_FEED_TYPE
    ) {
        return this.addNavigationLink({ href, title, rel, type });
    }

    /**
     * Gets the navigation links.
     * @returns The array of navigation links.
     */
    getNavigation() {
        return this.navigation;
    }

    /**
     * Adds one or more publications.
     * @param publications - The publications to add.
     * @returns This instance (for chaining).
     */
    addPublication(...publications: Publication[]) {
        this.publications.push(...publications);
        return this;
    }

    /**
     * Adds multiple publications.
     * @param publications - The publications to add.
     * @returns This instance (for chaining).
     */
    addPublications(publications: Publication[]) {
        return this.addPublication(...publications);
    }

    /**
     * Gets the publications.
     * @returns The array of publications.
     */
    getPublications() {
        return this.publications;
    }

    protected validateNavigation(prefix: string): string[] {
        return this.navigation
            .filter((link) => !link.title)
            .map(
                (link) =>
                    `${prefix}navigation link ${link.href} must have a title`
            );
    }

    protected validatePublications(prefix: string): string[] {
        return this.publications.flatMap((publication, index) =>
            publication
                .validate()
                .map((error) => `${prefix}publications[${index}]: ${error}`)
        );
    }
}

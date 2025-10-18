import { FeedOptions } from '../../model/types';
import { Feed } from '../../versions/v1_2/feed';
import { Entry } from '../../versions/v1_2/entry';
import { AtomXmlParser } from './AtomXmlParser';
import { EntryXmlParser } from './EntryXmlParser';

export class FeedXmlParser extends AtomXmlParser {
    /**
     * Parses an XML string and creates a Feed instance.
     * @param xmlString - The XML string representing a feed.
     * @returns A new Feed instance.
     */
    static fromXml(xmlString: string): Feed {
        const parser = new FeedXmlParser();
        return parser.parseFeed(xmlString);
    }

    /**
     * Parses an XML string and creates a Feed instance.
     * @param xmlString - The XML string representing a feed.
     * @returns A new Feed instance.
     */
    parseFeed(xmlString: string): Feed {
        const parsed = this.parse(xmlString);

        const feedElement = parsed.feed || parsed;

        if (!feedElement) throw new Error('No feed element found in XML');

        const options = this.extractFeedOptions(feedElement);
        const feed = new Feed(options);

        if (options.author) feed.setAuthor(options.author);
        if (options.updated) feed.setUpdated(options.updated);
        if (options.kind) feed.setKind(options.kind);
        if (options.lang) feed.setLang(options.lang);

        // Links are already included in the options, no need to add them again

        if (options.extra) {
            Object.entries(options.extra).forEach(([key, value]) => {
                feed.addExtra(key, value);
            });
        }

        if (feedElement.entry) {
            const entryElements = this.ensureArray(feedElement.entry);
            const entryParser = new EntryXmlParser();

            entryElements.forEach((entryElement) => {
                try {
                    const entryOptions =
                        entryParser.extractEntryOptions(entryElement);
                    const entry = new Entry(entryOptions);

                    if (entryOptions.author)
                        entry.setAuthor(entryOptions.author);
                    if (entryOptions.updated)
                        entry.setUpdated(entryOptions.updated);
                    if (entryOptions.summary)
                        entry.setSummary(entryOptions.summary);
                    if (entryOptions.content)
                        entry.setContent(entryOptions.content);
                    // Links are already included in the entryOptions, no need to add them again
                    if (entryOptions.extra) {
                        Object.entries(entryOptions.extra).forEach(
                            ([key, value]) => {
                                entry.addExtra(key, value);
                            }
                        );
                    }

                    feed.addEntry(entry);
                } catch {
                    // Continue parsing other entries
                }
            });
        }

        return feed;
    }

    /**
     * Extracts FeedOptions from a parsed feed element.
     * @param feedElement - The parsed feed element.
     * @returns FeedOptions object.
     */
    private extractFeedOptions(feedElement: any): FeedOptions {
        const id = this.extractText(feedElement.id);
        const title = this.extractText(feedElement.title);

        if (!id || !title) {
            throw new Error('Feed must have both id and title');
        }

        const options: FeedOptions = { id, title };

        const updated = this.extractText(feedElement.updated);
        if (updated) options.updated = updated;

        const author = this.parseAuthor(feedElement.author);
        if (author) options.author = author;

        const lang =
            this.extractAttribute(feedElement, 'xml:lang') ||
            this.extractAttribute(feedElement, 'lang');
        if (lang) options.lang = lang;

        if (feedElement.link) {
            const linkElements = this.ensureArray(feedElement.link);
            options.links = this.parseLinks(linkElements);

            const selfLink = options.links.find((link) => link.rel === 'self');
            if (selfLink && selfLink.type) {
                if (selfLink.type.includes('kind=navigation')) {
                    options.kind = 'navigation';
                } else if (selfLink.type.includes('kind=acquisition')) {
                    options.kind = 'acquisition';
                }
            }
        }

        // Extract extra attributes
        const extra: Record<string, any> = {};
        if (typeof feedElement === 'object') {
            Object.keys(feedElement).forEach((key) => {
                if (
                    key.startsWith('@_') &&
                    ![
                        '@_xmlns',
                        '@_xml:lang',
                        '@_xmlns:opds',
                        '@_xmlns:dcterms',
                    ].includes(key)
                ) {
                    const attrName = key.substring(2);
                    extra[attrName] = feedElement[key];
                }
            });
        }

        if (Object.keys(extra).length > 0) {
            options.extra = extra;
        }

        return options;
    }
}

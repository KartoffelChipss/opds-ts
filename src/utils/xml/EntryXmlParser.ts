import { EntryOptions } from '../../versions/v1_2/types';
import { Entry } from '../../versions/v1_2/entry';
import { AtomXmlParser } from './AtomXmlParser';

export class EntryXmlParser extends AtomXmlParser {
    /**
     * Parses an XML string and creates an Entry instance.
     * @param xmlString - The XML string representing an entry.
     * @returns A new Entry instance.
     */
    static fromXml(xmlString: string): Entry {
        const parser = new EntryXmlParser();
        return parser.parseEntry(xmlString);
    }

    /**
     * Parses an XML string and creates an Entry instance.
     * @param xmlString - The XML string representing an entry.
     * @returns A new Entry instance.
     */
    parseEntry(xmlString: string): Entry {
        const parsed = this.parse(xmlString);

        const entryElement = parsed.entry || parsed;

        if (!entryElement) {
            throw new Error('No entry element found in XML');
        }

        const options = this.extractEntryOptions(entryElement);
        const entry = new Entry(options);

        if (options.author) entry.setAuthor(options.author);
        if (options.updated) entry.setUpdated(options.updated);
        if (options.summary) entry.setSummary(options.summary);
        if (options.content) entry.setContent(options.content);

        // Links are already included in the options, no need to add them again

        if (options.extra) {
            Object.entries(options.extra).forEach(([key, value]) => {
                entry.addExtra(key, value);
            });
        }

        return entry;
    }

    /**
     * Extracts EntryOptions from a parsed entry element.
     * @param entryElement - The parsed entry element.
     * @returns EntryOptions object.
     */
    extractEntryOptions(entryElement: any): EntryOptions {
        const id = this.extractText(entryElement.id);
        const title = this.extractText(entryElement.title);

        if (!id || !title) {
            throw new Error('Entry must have both id and title');
        }

        const options: EntryOptions = { id, title };

        const updated = this.extractText(entryElement.updated);
        if (updated) options.updated = updated;

        const author = this.parseAuthor(entryElement.author);
        if (author) options.author = author;

        const summary = this.extractText(entryElement.summary);
        if (summary) options.summary = summary;

        if (entryElement.content) {
            const contentType =
                this.extractAttribute(entryElement.content, 'type') || 'text';
            const contentValue = this.extractText(entryElement.content);
            if (contentValue) {
                options.content = {
                    type: contentType,
                    value: contentValue,
                };
            }
        }

        if (entryElement.link) {
            const linkElements = this.ensureArray(entryElement.link);
            options.links = this.parseLinks(linkElements);
        }

        const extra: Record<string, any> = {};
        if (typeof entryElement === 'object') {
            Object.keys(entryElement).forEach((key) => {
                if (
                    key.startsWith('@_') &&
                    !['@_xmlns', '@_xml:lang'].includes(key)
                ) {
                    const attrName = key.substring(2);
                    extra[attrName] = entryElement[key];
                }
            });
        }

        if (Object.keys(extra).length > 0) {
            options.extra = extra;
        }

        return options;
    }
}

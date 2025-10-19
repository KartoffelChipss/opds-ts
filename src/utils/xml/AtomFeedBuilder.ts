import { create } from 'xmlbuilder2';
import { FeedOptions } from '../../versions/v1_2/types';
import { Entry } from '../../versions/v1_2/entry';
import { BaseAtomBuilder } from './BaseAtomBuilder';

export class AtomFeedBuilder extends BaseAtomBuilder<FeedOptions> {
    constructor() {
        super('feed', {
            xmlns: 'http://www.w3.org/2005/Atom',
            'xmlns:opds': 'http://opds-spec.org/2010/catalog',
            'xmlns:dc': 'http://purl.org/dc/terms/',
        });
    }

    protected initializeRoot(): void {
        this.root = create({ version: '1.0', encoding: 'utf-8' }).ele(
            this.elementName,
            this.namespaces
        );
    }

    protected addCoreMetadata(options: FeedOptions): void {
        if (options.lang) {
            this.root.att('xml:lang', options.lang);
        }

        this.root.ele('id').txt(options.id).up();
        this.root.ele('title').txt(options.title).up();
        this.root
            .ele('updated')
            .txt(options.updated || new Date().toISOString())
            .up();

        const authorName =
            options.author ||
            (options.extra && options.extra.author) ||
            undefined;
        this.addAuthorIfPresent(authorName);
    }

    protected addExtraContent(options: FeedOptions): void {}

    /**
     * Adds entries to the feed.
     * @param entries - Array of entries to add.
     * @param baseUrl - Base URL to resolve relative links.
     * @returns The builder instance for chaining.
     */
    addEntries(entries: Entry[], baseUrl?: string): this {
        for (const entry of entries) {
            const entryXml = entry.toXml({ baseUrl, prettyPrint: false });
            const frag = create(entryXml).root();
            this.root.import(frag);
        }
        return this;
    }
}

import { Feed } from '../../versions/v1_2/feed';
import { AtomFeedBuilder } from './AtomFeedBuilder';
import { SerializationOptions } from '../../versions/v1_2/types';

export class FeedXmlSerializer {
    constructor(private feed: Feed) {}

    /**
     * Serializes the feed to OPDS/Atom XML format.
     * @param options - Serialization options including baseUrl and prettyPrint.
     * @returns The XML string representation of the feed.
     */
    serialize(options: SerializationOptions = {}): string {
        const { baseUrl, prettyPrint = true } = options;

        const builder = new AtomFeedBuilder();

        return builder
            .setMetadata(this.feed.getOptions())
            .addLinks(this.feed.getLinks(), baseUrl)
            .addEntries(this.feed.getEntries(), baseUrl)
            .build(prettyPrint);
    }

    /**
     * Creates a new AtomFeedBuilder instance for advanced XML manipulation.
     * @returns A new AtomFeedBuilder instance.
     */
    createBuilder(): AtomFeedBuilder {
        return new AtomFeedBuilder();
    }
}

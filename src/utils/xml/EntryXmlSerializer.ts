import { Entry } from '../../versions/v1_2/entry';
import { AtomEntryBuilder } from './AtomEntryBuilder';
import { SerializationOptions } from '../../versions/v1_2/types';

export class EntryXmlSerializer {
    constructor(private entry: Entry) {}

    /**
     * Serializes the entry to Atom XML format.
     * @param options - Serialization options including baseUrl and prettyPrint.
     * @returns The XML string representation of the entry.
     */
    serialize(options: SerializationOptions = {}): string {
        const { baseUrl, prettyPrint = true } = options;

        const builder = new AtomEntryBuilder();

        return builder
            .setMetadata(this.entry.getOptions())
            .addLinks(this.entry.getLinks(), baseUrl)
            .build(prettyPrint);
    }

    /**
     * Creates a new AtomEntryBuilder instance for advanced XML manipulation.
     * @returns A new AtomEntryBuilder instance.
     */
    createBuilder(): AtomEntryBuilder {
        return new AtomEntryBuilder();
    }
}

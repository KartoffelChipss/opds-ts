import { create } from 'xmlbuilder2';
import { EntryOptions } from '../../versions/v1_2/types';
import { BaseAtomBuilder } from './BaseAtomBuilder';

export class AtomEntryBuilder extends BaseAtomBuilder<EntryOptions> {
    constructor() {
        super('entry');
    }

    protected initializeRoot(): void {
        this.root = create().ele(this.elementName);
    }

    protected addCoreMetadata(options: EntryOptions): void {
        this.root.ele('id').txt(options.id).up();
        this.root.ele('title').txt(options.title).up();
        this.root
            .ele('updated')
            .txt(options.updated || new Date().toISOString())
            .up();

        this.addAuthorIfPresent(options.author);
    }

    protected addExtraContent(options: EntryOptions): void {
        if (options.summary) {
            this.root
                .ele('summary', { type: 'text' })
                .txt(options.summary)
                .up();
        }

        if (options.content) {
            this.root
                .ele('content', { type: options.content.type || 'text' })
                .txt(options.content.value)
                .up();
        }

        this.addExtraAttributes(options.extra);
    }
}

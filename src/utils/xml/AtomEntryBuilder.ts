import { create } from 'xmlbuilder2';
import { EntryOptions, simpleDcTextFields } from '../../versions/v1_2/types';
import { BaseAtomBuilder } from './BaseAtomBuilder';

export class AtomEntryBuilder extends BaseAtomBuilder<EntryOptions> {
    constructor() {
        super('entry');
    }

    protected override initializeRoot(): void {
        this.root = create().ele(this.elementName);
    }

    protected override addCoreMetadata(options: EntryOptions): void {
        this.root.ele('id').txt(options.id).up();
        this.root.ele('title').txt(options.title).up();
        this.root
            .ele('updated')
            .txt(options.updated || new Date().toISOString())
            .up();

        if (options.rights) {
            this.root
                .ele('rights')
                .txt(options.rights || '')
                .up();
        }

        this.addDcMetadata(options);

        this.addAuthorIfPresent(options.author);
    }

    private addDcMetadata(options: EntryOptions): void {
        const dc = options.dcMetadata || {};

        for (const field of simpleDcTextFields) {
            const value = dc[field];
            if (value) {
                this.root.ele(`dc:${field}`).txt(value).up();
            }
        }

        if (dc.identifiers) {
            for (const id of dc.identifiers) {
                this.root.ele('dc:identifier').txt(id).up();
            }
        }

        if (dc.subjects) {
            for (const subject of dc.subjects) {
                this.root.ele('dc:subject').txt(subject).up();
            }
        }

        if (dc.references) {
            for (const ref of dc.references) {
                this.root.ele('dc:references').txt(ref).up();
            }
        }

        if (dc.isReferencedBy) {
            for (const refBy of dc.isReferencedBy) {
                this.root.ele('dc:isReferencedBy').txt(refBy).up();
            }
        }

        if (dc.contributors) {
            for (const contributor of dc.contributors) {
                this.root
                    .ele('dc:contributor')
                    .ele('name')
                    .txt(contributor)
                    .up()
                    .up();
            }
        }
    }

    protected override addExtraContent(options: EntryOptions): void {
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

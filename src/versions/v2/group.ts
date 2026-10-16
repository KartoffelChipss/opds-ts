import { GroupOptions, LanguageMap, SerializationOptions } from './types';
import { BaseCollection } from './collection';
import { Publication } from './publication';
import { cleanJson, parseJsonObject } from '../../utils/json';

/**
 * A group in an OPDS 2.0 feed. A group contains either a navigation
 * collection or a publications collection, never both.
 */
export class Group extends BaseCollection {
    /**
     * Creates a new Group instance.
     * @param options - The options for the group.
     */
    constructor(options: GroupOptions);

    /**
     * Creates a new Group instance with a title.
     * @param title - The title of the group (e.g. `Featured Books`).
     */
    constructor(title: LanguageMap);

    constructor(param: GroupOptions | LanguageMap) {
        if (typeof param === 'object' && 'metadata' in param) {
            const options = param as GroupOptions;
            super(options.metadata, options.links, options.navigation);
        } else if (param !== undefined) {
            super({ title: param as LanguageMap });
        } else {
            throw new Error('Invalid constructor arguments');
        }
    }

    /**
     * Checks the group against the requirements of the OPDS 2.0 specification.
     * @returns A list of problems. An empty list means the group is valid.
     */
    validate(): string[] {
        const errors: string[] = [];
        if (!this.metadata.title)
            errors.push('Group must have a title in its metadata');
        const hasNavigation = this.navigation.length > 0;
        const hasPublications = this.publications.length > 0;
        if (hasNavigation === hasPublications)
            errors.push(
                'Group must contain either a navigation or a publications collection'
            );
        errors.push(...this.validateNavigation(''));
        errors.push(...this.validatePublications(''));
        return errors;
    }

    /**
     * Converts the group to a plain object following the OPDS 2.0 JSON structure.
     * @param options - Serialization options (only `baseUrl` is used).
     * @returns The group as a plain object.
     */
    toObject({ baseUrl }: SerializationOptions = {}): Record<string, any> {
        return cleanJson(
            {
                metadata: this.metadata,
                links: this.links,
                navigation: this.navigation,
                publications: this.publications.map((publication) =>
                    publication.toObject()
                ),
            },
            baseUrl
        );
    }

    /**
     * Used by `JSON.stringify` to serialize the group.
     */
    toJSON() {
        return this.toObject();
    }

    /**
     * Creates a Group instance from OPDS 2.0 JSON.
     * @param json - The JSON string or an already parsed object.
     * @returns A new Group instance.
     */
    static fromJson(json: string | object): Group {
        const { metadata, links, navigation, publications } = parseJsonObject(
            json,
            'OPDS 2.0 group'
        );
        const group = new Group({ metadata, links, navigation });
        if (Array.isArray(publications))
            group.addPublications(publications.map(Publication.fromJson));
        return group;
    }
}

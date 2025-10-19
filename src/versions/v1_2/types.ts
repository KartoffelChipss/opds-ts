export type FeedKind = 'navigation' | 'acquisition';

export type NavigationRel = 'start' | 'previous' | 'next' | 'last' | 'first';

export type AcquisitionRel =
    | 'open-access'
    | 'borrow'
    | 'buy'
    | 'sample'
    | 'preview'
    | 'subscribe';

export interface SerializationOptions {
    /**
     * Base URL to resolve relative links (optional).
     */
    baseUrl?: string;
    /**
     * Whether to pretty print the XML (default: true).
     */
    prettyPrint?: boolean;
}

export interface DCMetadata {
    /**
     * The identifier(s) of the resource. Can include ISBN, DOI, ISSN, etc.
     * @example urn:isbn:978-0-19-852011-5
     * @example https://doi.org/10.1038/s41567-025-12345-6
     */
    identifiers?: string[];

    /**
     * The publisher of the resource.
     * @example Oxford University Press
     */
    publisher?: string;

    /**
     * The date of formal issuance (publication) of the resource.
     * @example 1958-01-01
     * @example 2025-10-15
     */
    issued?: string;

    /**
     * The language of the resource.
     * @example en
     * @example en-US
     */
    language?: string;

    /**
     * The nature or genre of the resource.
     * @example Text
     * @example Journal Article
     * @example Moving Image
     */
    type?: string;

    /**
     * The size or duration of the resource.
     * @example 314 pages
     * @example 18 hours
     * @example pp. 1234-1242
     */
    extent?: string;

    /**
     * The file format, physical medium, or dimensions of the resource.
     * @example application/pdf
     * @example video/mp4
     */
    format?: string;

    /**
     * A related resource in which the described resource is physically or logically included.
     * @example International Series of Monographs on Physics
     * @example Nature Physics, Vol. 21, No. 10
     */
    isPartOf?: string;

    /**
     * A related resource that is a version, edition, or adaptation of the described resource.
     * @example Digital edition
     * @example Second edition
     */
    hasVersion?: string;

    /**
     * A related resource that is supplanted, displaced, or superseded by the described resource.
     * @example Previous editions (1930, 1935, 1947)
     */
    replaces?: string;

    /**
     * A related resource that requires the described resource to support its function, delivery, or coherence.
     * @example Requires Adobe Reader
     * @example High-speed internet connection
     */
    requires?: string;

    /**
     * The topic(s) of the resource. Can be keywords, key phrases, or classification codes.
     * @example Quantum mechanics
     * @example Physics
     */
    subjects?: string[];

    /**
     * Spatial characteristics of the resource.
     * @example Laboratory conditions, T = 10 mK
     * @example New York, NY
     */
    spatial?: string;

    /**
     * Temporal characteristics of the resource.
     * @example Fall 2025 semester
     * @example 2023-2025
     */
    temporal?: string;

    /**
     * A class of entity for whom the resource is intended or useful.
     * @example Graduate students and researchers in physics
     * @example Computer Science students
     */
    audience?: string;

    /**
     * The level of education for which the resource is intended.
     * @example Undergraduate
     * @example Graduate
     * @example K-12
     */
    educationLevel?: string;

    /**
     * Information about rights held in and over the resource.
     * @example https://creativecommons.org/licenses/by/4.0/
     * @example All rights reserved
     */
    license?: string;

    /**
     * Information about who can access the resource or an indication of its security status.
     * @example Institutional subscription required
     * @example Open access
     */
    accessRights?: string;

    /**
     * Date that the resource became or will become available.
     * @example 2025-09-01
     * @example 2025-09-01/2026-08-31
     */
    available?: string;

    /**
     * Date of creation of the resource.
     * @example 2025-08-15
     */
    created?: string;

    /**
     * A bibliographic reference for the resource.
     * @example Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.
     */
    bibliographicCitation?: string;

    /**
     * A related resource that is referenced, cited, or otherwise pointed to by the described resource.
     * @example Previous research papers
     */
    references?: string[];

    /**
     * A related resource that references, cites, or otherwise points to the described resource.
     * @example Subsequent works citing this publication
     */
    isReferencedBy?: string[];

    /**
     * An entity responsible for making contributions to the resource.
     * This is different from atom:contributor and represents funding, institutional support, etc.
     * @example National Science Foundation (Grant #PHY-2012345)
     */
    contributors?: string[];

    /**
     * The physical or digital manifestation of the resource.
     * @example Print
     * @example Digital
     */
    medium?: string;

    /**
     * The instructional method used in educational resources.
     * @example Online lecture series
     * @example Interactive tutorial
     */
    instructionalMethod?: string;
}

export const simpleDcTextFields: Array<keyof DCMetadata> = [
    'publisher',
    'issued',
    'language',
    'type',
    'format',
    'isPartOf',
    'hasVersion',
    'replaces',
    'requires',
    'spatial',
    'temporal',
    'audience',
    'educationLevel',
    'license',
    'accessRights',
    'available',
    'created',
    'bibliographicCitation',
    'medium',
    'extent',
    'instructionalMethod',
];

export interface Link {
    rel: string;
    href: string;
    type?: string;
    title?: string;
    properties?: Record<string, string | number | boolean>;
    attrs?: Record<string, string>;
}

export interface EntryOptions {
    id: string;
    title: string;
    updated?: string;
    author?: string;
    rights?: string;
    summary?: string;
    content?: { type?: string; value: string };
    links?: Link[];
    extra?: Record<string, any>;
    dcMetadata?: DCMetadata;
}

export interface FeedOptions {
    id: string;
    title: string;
    lang?: string;
    updated?: string;
    author?: string;
    kind?: FeedKind;
    links?: Link[];
    extra?: Record<string, any>;
}

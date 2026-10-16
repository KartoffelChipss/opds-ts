/**
 * Media type of an OPDS 2.0 catalog feed.
 */
export const OPDS_FEED_TYPE = 'application/opds+json';

/**
 * Media type of an OPDS 2.0 publication.
 */
export const OPDS_PUBLICATION_TYPE = 'application/opds-publication+json';

/**
 * Image media types of which at least one must be present in an `images` collection.
 */
export const OPDS_IMAGE_TYPES = [
    'image/jpeg',
    'image/avif',
    'image/webp',
    'image/jxl',
    'image/png',
    'image/gif',
];

/**
 * Acquisition relations defined by OPDS 2.0.
 * See https://specs.opds.io/opds-2.0#53-acquisition-links
 */
export type AcquisitionRel =
    'acquisition' | 'borrow' | 'buy' | 'download' | 'preview' | 'subscribe';

/**
 * All link relations that mark a link as an acquisition link,
 * including the OPDS 1.x aliases.
 */
export const ACQUISITION_RELS: string[] = [
    'acquisition',
    'borrow',
    'buy',
    'download',
    'preview',
    'subscribe',
    'http://opds-spec.org/acquisition',
    'http://opds-spec.org/acquisition/buy',
    'http://opds-spec.org/acquisition/open-access',
    'http://opds-spec.org/acquisition/borrow',
    'http://opds-spec.org/acquisition/sample',
    'http://opds-spec.org/acquisition/subscribe',
];

/**
 * Link relations used for pagination.
 */
export type PaginationRel = 'first' | 'previous' | 'next' | 'last';

export interface SerializationOptions {
    /**
     * Base URL to resolve relative links (optional).
     */
    baseUrl?: string;
    /**
     * Whether to pretty print the JSON (default: true).
     */
    prettyPrint?: boolean;
}

/**
 * A string, or a map of BCP 47 language tags to localized strings.
 * @example "Moby-Dick"
 * @example { "en": "The Little Prince", "fr": "Le Petit Prince" }
 */
export type LanguageMap = string | Record<string, string>;

/**
 * The price of an acquisition.
 */
export interface Price {
    /**
     * ISO 4217 currency code.
     * @example USD
     */
    currency: string;
    /**
     * Decimal value of the price.
     * @example 4.99
     */
    value: number;
}

/**
 * Describes the media type that will be obtained after an indirect acquisition.
 */
export interface AcquisitionObject {
    /**
     * Media type of the indirectly acquired resource.
     */
    type: string;
    /**
     * Additional levels of indirection.
     */
    child?: AcquisitionObject[];
}

export interface Availability {
    state: 'available' | 'unavailable' | 'reserved' | 'ready';
    /**
     * Timestamp for the previous state change.
     */
    since?: string;
    /**
     * Timestamp for the next state change.
     */
    until?: string;
}

/**
 * Properties of a Link Object, including the OPDS 2.0 extensions.
 */
export interface LinkProperties {
    /**
     * Hint about the expected number of items returned.
     */
    numberOfItems?: number;
    /**
     * The price of a publication, tied to its acquisition link.
     */
    price?: Price;
    /**
     * Hint for the media type that will be acquired after additional steps.
     */
    indirectAcquisition?: AcquisitionObject[];
    /**
     * Library-specific hold list information.
     */
    holds?: { total?: number; position?: number };
    /**
     * Library-specific information about acquired copies.
     */
    copies?: { total?: number; available?: number };
    /**
     * Availability of the resource.
     */
    availability?: Availability;
    [key: string]: any;
}

/**
 * A Link Object as defined by the Readium Web Publication Manifest.
 */
export interface Link {
    href: string;
    rel?: string | string[];
    type?: string;
    title?: string;
    /**
     * Indicates that `href` is a URI template.
     */
    templated?: boolean;
    properties?: LinkProperties;
    height?: number;
    width?: number;
    size?: number;
    bitrate?: number;
    duration?: number;
    language?: string | string[];
    alternate?: Link[];
    children?: Link[];
}

/**
 * A Link Object in a navigation collection, which must contain a title.
 */
export interface NavigationLink extends Link {
    title: string;
}

export interface ContributorObject {
    name: LanguageMap;
    identifier?: string;
    sortAs?: LanguageMap;
    role?: string | string[];
    /**
     * Position in a series or collection.
     */
    position?: number;
    links?: Link[];
    [key: string]: any;
}

/**
 * A contributor, either as a plain name, an object, or a list of these.
 */
export type Contributor =
    string | ContributorObject | Array<string | ContributorObject>;

export interface SubjectObject {
    name: LanguageMap;
    sortAs?: LanguageMap;
    code?: string;
    scheme?: string;
    links?: Link[];
}

export type Subject = string | SubjectObject | Array<string | SubjectObject>;

/**
 * Contributor roles available in publication metadata.
 */
export type ContributorRole =
    | 'author'
    | 'translator'
    | 'editor'
    | 'artist'
    | 'illustrator'
    | 'letterer'
    | 'penciler'
    | 'colorist'
    | 'inker'
    | 'narrator'
    | 'contributor'
    | 'publisher'
    | 'imprint';

export interface BelongsTo {
    series?: Contributor;
    collection?: Contributor;
    [key: string]: any;
}

/**
 * Metadata of a publication, based on the Readium Web Publication Manifest.
 */
export interface PublicationMetadata {
    title: LanguageMap;
    /**
     * Schema.org type of the publication.
     * @example http://schema.org/Book
     */
    '@type'?: string;
    conformsTo?: string | string[];
    identifier?: string;
    sortAs?: LanguageMap;
    subtitle?: LanguageMap;
    /**
     * Last modification date (ISO 8601).
     */
    modified?: string;
    /**
     * Publication date (ISO 8601).
     */
    published?: string;
    /**
     * BCP 47 language tag(s).
     */
    language?: string | string[];
    author?: Contributor;
    translator?: Contributor;
    editor?: Contributor;
    artist?: Contributor;
    illustrator?: Contributor;
    letterer?: Contributor;
    penciler?: Contributor;
    colorist?: Contributor;
    inker?: Contributor;
    narrator?: Contributor;
    contributor?: Contributor;
    publisher?: Contributor;
    imprint?: Contributor;
    subject?: Subject;
    layout?: 'fixed' | 'reflowable' | 'scrolled';
    readingProgression?: 'rtl' | 'ltr';
    description?: string;
    /**
     * Duration in seconds.
     */
    duration?: number;
    numberOfPages?: number;
    belongsTo?: BelongsTo;
    [key: string]: any;
}

/**
 * Metadata of a feed, group or facet.
 */
export interface FeedMetadata {
    title: LanguageMap;
    '@type'?: string;
    identifier?: string;
    subtitle?: LanguageMap;
    /**
     * Last modification date (ISO 8601).
     */
    modified?: string;
    description?: string;
    /**
     * Total number of items in the collection.
     */
    numberOfItems?: number;
    /**
     * Number of items displayed per page.
     */
    itemsPerPage?: number;
    /**
     * Current page number.
     */
    currentPage?: number;
    [key: string]: any;
}

export interface PublicationOptions {
    metadata: PublicationMetadata;
    links?: Link[];
    images?: Link[];
    extra?: Record<string, any>;
}

export interface FacetOptions {
    metadata: FeedMetadata;
    links?: Link[];
}

export interface GroupOptions {
    metadata: FeedMetadata;
    links?: Link[];
    navigation?: NavigationLink[];
}

export interface FeedOptions {
    metadata: FeedMetadata;
    links?: Link[];
    navigation?: NavigationLink[];
    extra?: Record<string, any>;
}

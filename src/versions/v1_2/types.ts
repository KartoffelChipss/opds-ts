export type FeedKind = 'navigation' | 'acquisition';

export type NavigationRel = 'start' | 'previous' | 'next' | 'last' | 'first';

export type AcquisitionRel =
    | 'open-access'
    | 'borrow'
    | 'buy'
    | 'sample'
    | 'preview'
    | 'subscribe';

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
    summary?: string;
    content?: { type?: string; value: string };
    links?: Link[];
    extra?: Record<string, any>;
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

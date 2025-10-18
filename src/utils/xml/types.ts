import { Link } from '../../versions/v1_2/types';

export interface XmlSerializable {
    id: string;
    title: string;
    updated?: string;
    author?: string;
    links?: Link[];
    extra?: Record<string, any>;
}

export interface AtomElementBuilder<T extends XmlSerializable> {
    setMetadata(options: T): this;
    addLinks(links: Link[], baseUrl?: string): this;
    addLink(link: Link, baseUrl?: string): this;
    build(prettyPrint?: boolean): string;
    getRoot(): any;
}

export interface ParsedXmlElement {
    [key: string]: any;
}

export interface XmlParseOptions {
    ignoreAttributes?: boolean;
    attributeNamePrefix?: string;
    parseAttributeValue?: boolean;
    trimValues?: boolean;
}

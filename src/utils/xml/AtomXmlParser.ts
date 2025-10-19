import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { Link } from '../../versions/v1_2/types';
import { ParsedXmlElement, XmlParseOptions } from './types';

export class AtomXmlParser {
    private parser: XMLParser;

    constructor(options: XmlParseOptions = {}) {
        const defaultOptions = {
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            parseAttributeValue: true,
            trimValues: true,
            ...options,
        };

        this.parser = new XMLParser(defaultOptions);
    }

    /**
     * Parses XML string into a JavaScript object.
     * @param xmlString - The XML string to parse.
     * @returns Parsed XML object.
     * @throws Error if the XML is invalid or empty.
     */
    parse(xmlString: string): ParsedXmlElement {
        if (!xmlString || xmlString.trim() === '') {
            throw new Error('XML string cannot be empty');
        }

        const trimmedXml = xmlString.trim();

        const validationResult = XMLValidator.validate(trimmedXml);
        if (validationResult !== true) {
            throw new Error(
                `Invalid XML: ${validationResult.err.msg} at line ${validationResult.err.line}`
            );
        }

        try {
            return this.parser.parse(trimmedXml);
        } catch (error) {
            throw new Error(
                `Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    /**
     * Extracts text content from an element that might be a string or object.
     * @param element - The element to extract text from.
     * @returns The text content or undefined.
     */
    extractText(element: any): string | undefined {
        if (typeof element === 'string') {
            return element;
        }
        if (typeof element === 'object' && element !== null) {
            return element['#text'] || element.text || undefined;
        }
        return undefined;
    }

    /**
     * Extarcts multiple text from multiple elements. (e.g. multiple dc:identifier)
     * @param element - The element(s) to extract text from.
     * @returns The array of text content or undefined.
     */
    extractMultipleText(element: any): string[] | undefined {
        if (!element) return undefined;

        const elements = Array.isArray(element) ? element : [element];
        const texts: string[] = [];

        for (const el of elements) {
            const text = this.extractText(el);
            if (text) {
                texts.push(text);
            }
        }

        return texts.length > 0 ? texts : undefined;
    }

    /**
     * Extracts attribute value from an element.
     * @param element - The element to extract attribute from.
     * @param attributeName - The name of the attribute.
     * @returns The attribute value or undefined.
     */
    extractAttribute(element: any, attributeName: string): string | undefined {
        if (typeof element === 'object' && element !== null) {
            return element[`@_${attributeName}`] || element[attributeName];
        }
        return undefined;
    }

    /**
     * Converts parsed link elements to Link objects.
     * @param linkElements - Array of parsed link elements or single element.
     * @returns Array of Link objects.
     */
    parseLinks(linkElements: any): Link[] {
        if (!linkElements) return [];

        const elements = this.ensureArray(linkElements);

        return elements
            .filter((link) => link && typeof link === 'object')
            .map((link) => {
                const result: Link = {
                    rel: this.extractAttribute(link, 'rel') || '',
                    href: this.extractAttribute(link, 'href') || '',
                };

                const type = this.extractAttribute(link, 'type');
                if (type) result.type = type;

                const title = this.extractAttribute(link, 'title');
                if (title) result.title = title;

                // Extract any other attributes as properties
                const properties: Record<string, string | number | boolean> =
                    {};
                if (typeof link === 'object') {
                    Object.keys(link).forEach((key) => {
                        if (
                            key.startsWith('@_') &&
                            !['@_rel', '@_href', '@_type', '@_title'].includes(
                                key
                            )
                        ) {
                            const propName = key.substring(2);
                            properties[propName] = link[key];
                        }
                    });
                }

                if (Object.keys(properties).length > 0) {
                    result.properties = properties;
                }

                return result;
            });
    }

    /**
     * Parses author information from parsed XML.
     * @param authorElement - The parsed author element.
     * @returns The author name or undefined.
     */
    parseAuthor(authorElement: any): string | undefined {
        if (!authorElement) return undefined;

        if (typeof authorElement === 'string') {
            return authorElement;
        }

        if (typeof authorElement === 'object') {
            const name = authorElement.name;
            return this.extractText(name);
        }

        return undefined;
    }

    /**
     * Ensures the element is an array.
     * @param element - The element that might be an array or single item.
     * @returns Array of elements.
     */
    ensureArray(element: any): any[] {
        if (!element) return [];
        return Array.isArray(element) ? element : [element];
    }
}

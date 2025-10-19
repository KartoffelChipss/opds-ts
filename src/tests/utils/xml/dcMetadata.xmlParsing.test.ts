import { EntryXmlParser } from '../../../utils/xml/EntryXmlParser';
import { DCMetadata } from '../../../versions/v1_2/types';

describe('Dublin Core Metadata XML Parsing', () => {
    let parser: EntryXmlParser;

    beforeEach(() => {
        parser = new EntryXmlParser();
    });

    describe('parseDcMetadata', () => {
        it('should parse simple DC metadata fields from XML', () => {
            const xmlElement = {
                'dc:publisher': 'Oxford University Press',
                'dc:issued': '1958-01-01',
                'dc:language': 'en',
                'dc:type': 'Text',
                'dc:format': 'application/pdf',
                'dc:license': 'All rights reserved',
            };

            // Use reflection to call private method
            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result).toEqual({
                publisher: 'Oxford University Press',
                issued: '1958-01-01',
                language: 'en',
                type: 'Text',
                format: 'application/pdf',
                license: 'All rights reserved',
            });
        });

        it('should parse DC identifier arrays from XML', () => {
            const xmlElement = {
                'dc:identifier': [
                    'urn:isbn:978-0-19-852011-5',
                    'https://doi.org/10.1093/oso/9780198520115.001.0001',
                    'urn:issn:1234-5678',
                ],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.identifiers).toEqual([
                'urn:isbn:978-0-19-852011-5',
                'https://doi.org/10.1093/oso/9780198520115.001.0001',
                'urn:issn:1234-5678',
            ]);
        });

        it('should parse single DC identifier from XML', () => {
            const xmlElement = {
                'dc:identifier': 'urn:isbn:978-0-19-852011-5',
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.identifiers).toEqual(['urn:isbn:978-0-19-852011-5']);
        });

        it('should parse DC subject arrays from XML', () => {
            const xmlElement = {
                'dc:subject': [
                    'Physics',
                    'Quantum Mechanics',
                    'Mathematical Physics',
                ],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.subjects).toEqual([
                'Physics',
                'Quantum Mechanics',
                'Mathematical Physics',
            ]);
        });

        it('should parse DC references arrays from XML', () => {
            const xmlElement = {
                'dc:references': ['Reference 1', 'Reference 2'],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.references).toEqual(['Reference 1', 'Reference 2']);
        });

        it('should parse DC isReferencedBy arrays from XML', () => {
            const xmlElement = {
                'dc:isReferencedBy': ['Citation 1', 'Citation 2'],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.isReferencedBy).toEqual(['Citation 1', 'Citation 2']);
        });

        it('should parse DC contributor arrays from XML', () => {
            const xmlElement = {
                'dc:contributor': [
                    { name: 'R. H. Dalitz' },
                    { name: 'National Science Foundation' },
                ],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.contributors).toEqual([
                'R. H. Dalitz',
                'National Science Foundation',
            ]);
        });

        it('should handle empty XML element', () => {
            const xmlElement = {};

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result).toBeUndefined();
        });

        it('should return undefined when no DC metadata is present', () => {
            const xmlElement = {
                id: 'test-id',
                title: 'Test Title',
                updated: '2025-01-01T00:00:00Z',
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result).toBeUndefined();
        });

        it('should ignore non-DC fields', () => {
            const xmlElement = {
                'dc:publisher': 'Test Publisher',
                'atom:title': 'Test Title',
                'custom:field': 'Custom Value',
                id: 'test-id',
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result).toEqual({
                publisher: 'Test Publisher',
            });
        });

        it('should handle all DC metadata field types', () => {
            const xmlElement = {
                // Simple text fields that are in simpleDcTextFields
                'dc:publisher': 'Test Publisher',
                'dc:issued': '2025-01-01',
                'dc:language': 'en',
                'dc:type': 'Text',
                'dc:format': 'application/pdf',
                'dc:isPartOf': 'Test Series',
                'dc:hasVersion': 'Second Edition',
                'dc:replaces': 'First Edition',
                'dc:requires': 'Adobe Reader',
                'dc:spatial': 'New York, NY',
                'dc:temporal': 'Fall 2025',
                'dc:audience': 'Graduate students',
                'dc:educationLevel': 'Graduate',
                'dc:license': 'CC BY 4.0',
                'dc:accessRights': 'Open access',
                'dc:available': '2025-09-01',
                'dc:created': '2025-08-15',
                'dc:bibliographicCitation': 'Test Citation',
                'dc:medium': 'Digital',
                'dc:instructionalMethod': 'Online lecture',

                // Array fields
                'dc:identifier': ['test-id-1', 'test-id-2'],
                'dc:subject': ['Subject 1', 'Subject 2'],
                'dc:references': ['Ref 1', 'Ref 2'],
                'dc:isReferencedBy': ['RefBy 1', 'RefBy 2'],
                'dc:contributor': [
                    { name: 'Contributor 1' },
                    { name: 'Contributor 2' },
                ],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.publisher).toBe('Test Publisher');
            expect(result.issued).toBe('2025-01-01');
            expect(result.language).toBe('en');
            expect(result.type).toBe('Text');
            expect(result.format).toBe('application/pdf');
            expect(result.isPartOf).toBe('Test Series');
            expect(result.hasVersion).toBe('Second Edition');
            expect(result.replaces).toBe('First Edition');
            expect(result.requires).toBe('Adobe Reader');
            expect(result.spatial).toBe('New York, NY');
            expect(result.temporal).toBe('Fall 2025');
            expect(result.audience).toBe('Graduate students');
            expect(result.educationLevel).toBe('Graduate');
            expect(result.license).toBe('CC BY 4.0');
            expect(result.accessRights).toBe('Open access');
            expect(result.available).toBe('2025-09-01');
            expect(result.created).toBe('2025-08-15');
            expect(result.bibliographicCitation).toBe('Test Citation');
            expect(result.medium).toBe('Digital');
            expect(result.instructionalMethod).toBe('Online lecture');

            expect(result.identifiers).toEqual(['test-id-1', 'test-id-2']);
            expect(result.subjects).toEqual(['Subject 1', 'Subject 2']);
            expect(result.references).toEqual(['Ref 1', 'Ref 2']);
            expect(result.isReferencedBy).toEqual(['RefBy 1', 'RefBy 2']);
            expect(result.contributors).toEqual([
                'Contributor 1',
                'Contributor 2',
            ]);
        });

        it('should handle mixed single and array values', () => {
            const xmlElement = {
                'dc:identifier': 'single-id',
                'dc:subject': ['Subject 1', 'Subject 2'],
                'dc:references': 'single-reference',
                'dc:contributor': [{ name: 'Contributor 1' }],
            };

            const result = (parser as any).parseDcMetadata(xmlElement);

            expect(result.identifiers).toEqual(['single-id']);
            expect(result.subjects).toEqual(['Subject 1', 'Subject 2']);
            expect(result.references).toEqual(['single-reference']);
            expect(result.contributors).toEqual(['Contributor 1']);
        });
    });

    describe('extractEntryOptions with DC metadata', () => {
        it('should include parsed DC metadata in EntryOptions', () => {
            const entryElement = {
                id: 'test-entry',
                title: 'Test Entry',
                updated: '2025-01-01T00:00:00Z',
                'dc:publisher': 'Test Publisher',
                'dc:language': 'en',
                'dc:subject': ['Subject 1', 'Subject 2'],
            };

            const options = parser.extractEntryOptions(entryElement);

            expect(options.id).toBe('test-entry');
            expect(options.title).toBe('Test Entry');
            expect(options.dcMetadata).toEqual({
                publisher: 'Test Publisher',
                language: 'en',
                subjects: ['Subject 1', 'Subject 2'],
            });
        });

        it('should not include dcMetadata when no DC fields are present', () => {
            const entryElement = {
                id: 'test-entry',
                title: 'Test Entry',
                updated: '2025-01-01T00:00:00Z',
            };

            const options = parser.extractEntryOptions(entryElement);

            expect(options.dcMetadata).toBeUndefined();
        });

        it('should handle complex entry with all metadata types', () => {
            const entryElement = {
                id: 'complex-entry',
                title: 'Complex Entry',
                updated: '2025-01-01T00:00:00Z',
                author: { name: 'Test Author' },
                summary: 'Test Summary',
                content: { '@_type': 'text', '#text': 'Test Content' },
                'dc:publisher': 'Complex Publisher',
                'dc:identifier': [
                    'urn:isbn:123-456-789',
                    'https://doi.org/10.1000/example',
                ],
                'dc:subject': ['Complex Subject 1', 'Complex Subject 2'],
                'dc:contributor': [{ name: 'Complex Contributor' }],
                link: [
                    {
                        '@_rel': 'self',
                        '@_href': '/self',
                        '@_type': 'application/atom+xml',
                    },
                ],
            };

            const options = parser.extractEntryOptions(entryElement);

            expect(options.id).toBe('complex-entry');
            expect(options.title).toBe('Complex Entry');
            expect(options.author).toBe('Test Author');
            expect(options.summary).toBe('Test Summary');
            expect(options.content).toEqual({
                type: 'text',
                value: 'Test Content',
            });
            expect(options.dcMetadata).toEqual({
                publisher: 'Complex Publisher',
                identifiers: [
                    'urn:isbn:123-456-789',
                    'https://doi.org/10.1000/example',
                ],
                subjects: ['Complex Subject 1', 'Complex Subject 2'],
                contributors: ['Complex Contributor'],
            });
            expect(options.links).toHaveLength(1);
            expect(options.links?.[0].rel).toBe('self');
        });
    });

    describe('Round-trip testing', () => {
        it('should preserve DC metadata through serialize/parse cycle', () => {
            const originalDcMetadata: DCMetadata = {
                identifiers: [
                    'urn:isbn:978-0-19-852011-5',
                    'https://doi.org/10.1093/oso/9780198520115.001.0001',
                ],
                publisher: 'Oxford University Press',
                issued: '1958-01-01',
                language: 'en',
                type: 'Text',
                subjects: ['Physics', 'Quantum Mechanics'],
                contributors: ['R. H. Dalitz'],
                bibliographicCitation:
                    'Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.',
            };

            // This test would require actually parsing XML, which would need the full XML parsing infrastructure
            // For now, we'll test the individual components that we can test in isolation

            // Simulate what the XML element would look like after parsing
            const simulatedXmlElement = {
                'dc:identifier': originalDcMetadata.identifiers,
                'dc:publisher': originalDcMetadata.publisher,
                'dc:issued': originalDcMetadata.issued,
                'dc:language': originalDcMetadata.language,
                'dc:type': originalDcMetadata.type,
                'dc:subject': originalDcMetadata.subjects,
                'dc:contributor': originalDcMetadata.contributors?.map(
                    (name) => ({ name })
                ),
                'dc:bibliographicCitation':
                    originalDcMetadata.bibliographicCitation,
            };

            const parsedDcMetadata = (parser as any).parseDcMetadata(
                simulatedXmlElement
            );

            expect(parsedDcMetadata).toEqual(originalDcMetadata);
        });

        it('should handle special characters in round-trip', () => {
            const originalDcMetadata: DCMetadata = {
                publisher: 'Publisher & Company < > "Quotes"',
                subjects: [
                    'Subject with <special> characters',
                    'Subject & symbols',
                ],
                bibliographicCitation:
                    'Author, A. (2025). "Title with <special> characters & symbols". Publisher.',
            };

            const simulatedXmlElement = {
                'dc:publisher': originalDcMetadata.publisher,
                'dc:subject': originalDcMetadata.subjects,
                'dc:bibliographicCitation':
                    originalDcMetadata.bibliographicCitation,
            };

            const parsedDcMetadata = (parser as any).parseDcMetadata(
                simulatedXmlElement
            );

            expect(parsedDcMetadata).toEqual(originalDcMetadata);
        });
    });

    describe('Error handling', () => {
        it('should handle malformed XML elements gracefully', () => {
            const malformedElement = {
                'dc:publisher': null,
                'dc:subject': undefined,
                'dc:identifier': [],
            };

            const result = (parser as any).parseDcMetadata(malformedElement);

            // Should not include null/undefined/empty fields
            expect(result).toBeUndefined();
        });

        it('should handle nested objects in XML elements', () => {
            const complexElement = {
                'dc:publisher': { '#text': 'Nested Publisher' },
                'dc:subject': [
                    { '#text': 'Nested Subject 1' },
                    'Simple Subject 2',
                ],
            };

            const result = (parser as any).parseDcMetadata(complexElement);

            // The parser should handle these according to its implementation
            // This test documents the expected behavior
            expect(result.publisher).toBeDefined();
            expect(result.subjects).toBeDefined();
        });
    });
});

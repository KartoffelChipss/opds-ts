import { Entry } from '../../versions/v1_2/entry';
import { DCMetadata } from '../../versions/v1_2/types';

describe('Dublin Core Metadata', () => {
    let entry: Entry;

    beforeEach(() => {
        entry = new Entry('test-id', 'Test Entry');
    });

    describe('setDcMetadata', () => {
        it('should set complete DC metadata object', () => {
            const dcMetadata: DCMetadata = {
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

            entry.setDcMetadata(dcMetadata);
            const result = entry.getDcMetadata();

            expect(result).toEqual(dcMetadata);
        });

        it('should override existing DC metadata', () => {
            entry.setDcMetadata({ publisher: 'First Publisher' });
            entry.setDcMetadata({
                publisher: 'Second Publisher',
                language: 'de',
            });

            const result = entry.getDcMetadata();
            expect(result.publisher).toBe('Second Publisher');
            expect(result.language).toBe('de');
            // Previous fields should not exist
            expect(Object.keys(result)).toHaveLength(2);
        });

        it('should allow chaining', () => {
            const result = entry.setDcMetadata({ publisher: 'Test Publisher' });
            expect(result).toBe(entry);
        });
    });

    describe('setDcMetadataField', () => {
        it('should set individual string fields', () => {
            entry.setDcMetadataField('publisher', 'MIT Press');
            entry.setDcMetadataField('language', 'en-US');
            entry.setDcMetadataField('issued', '2025-01-01');

            const result = entry.getDcMetadata();
            expect(result.publisher).toBe('MIT Press');
            expect(result.language).toBe('en-US');
            expect(result.issued).toBe('2025-01-01');
        });

        it('should set array fields', () => {
            entry.setDcMetadataField('identifiers', [
                'urn:isbn:123-456-789',
                'urn:doi:10.1000/xyz123',
            ]);
            entry.setDcMetadataField('subjects', [
                'Computer Science',
                'Algorithms',
            ]);
            entry.setDcMetadataField('contributors', [
                'Alice Smith',
                'Bob Johnson',
            ]);
            entry.setDcMetadataField('references', [
                'Previous Paper 1',
                'Previous Paper 2',
            ]);

            const result = entry.getDcMetadata();
            expect(result.identifiers).toEqual([
                'urn:isbn:123-456-789',
                'urn:doi:10.1000/xyz123',
            ]);
            expect(result.subjects).toEqual(['Computer Science', 'Algorithms']);
            expect(result.contributors).toEqual(['Alice Smith', 'Bob Johnson']);
            expect(result.references).toEqual([
                'Previous Paper 1',
                'Previous Paper 2',
            ]);
        });

        it('should initialize dcMetadata object if it does not exist', () => {
            expect(entry.getDcMetadata()).toEqual({});

            entry.setDcMetadataField('publisher', 'Test Publisher');

            const result = entry.getDcMetadata();
            expect(result.publisher).toBe('Test Publisher');
        });

        it('should preserve existing fields when adding new ones', () => {
            entry.setDcMetadataField('publisher', 'Test Publisher');
            entry.setDcMetadataField('language', 'en');
            entry.setDcMetadataField('subjects', ['Science']);

            const result = entry.getDcMetadata();
            expect(result.publisher).toBe('Test Publisher');
            expect(result.language).toBe('en');
            expect(result.subjects).toEqual(['Science']);
        });

        it('should allow chaining', () => {
            const result = entry.setDcMetadataField(
                'publisher',
                'Test Publisher'
            );
            expect(result).toBe(entry);
        });

        it('should handle all DC metadata field types', () => {
            // Test string fields that are in simpleDcTextFields
            entry.setDcMetadataField('publisher', 'Test Publisher');
            entry.setDcMetadataField('issued', '2025-01-01');
            entry.setDcMetadataField('language', 'en');
            entry.setDcMetadataField('type', 'Text');
            entry.setDcMetadataField('format', 'application/pdf');
            entry.setDcMetadataField('isPartOf', 'Test Series');
            entry.setDcMetadataField('hasVersion', 'Second Edition');
            entry.setDcMetadataField('replaces', 'First Edition');
            entry.setDcMetadataField('requires', 'Adobe Reader');
            entry.setDcMetadataField('spatial', 'New York, NY');
            entry.setDcMetadataField('temporal', 'Fall 2025');
            entry.setDcMetadataField('audience', 'Graduate students');
            entry.setDcMetadataField('educationLevel', 'Graduate');
            entry.setDcMetadataField('license', 'CC BY 4.0');
            entry.setDcMetadataField('accessRights', 'Open access');
            entry.setDcMetadataField('available', '2025-09-01');
            entry.setDcMetadataField('created', '2025-08-15');
            entry.setDcMetadataField('bibliographicCitation', 'Test Citation');
            entry.setDcMetadataField('medium', 'Digital');
            entry.setDcMetadataField('instructionalMethod', 'Online lecture');

            // Test array fields
            entry.setDcMetadataField('identifiers', ['test-id-1', 'test-id-2']);
            entry.setDcMetadataField('subjects', ['Subject 1', 'Subject 2']);
            entry.setDcMetadataField('references', ['Ref 1', 'Ref 2']);
            entry.setDcMetadataField('isReferencedBy', ['RefBy 1', 'RefBy 2']);
            entry.setDcMetadataField('contributors', [
                'Contributor 1',
                'Contributor 2',
            ]);

            const result = entry.getDcMetadata();
            expect(result.publisher).toBe('Test Publisher');
            expect(result.identifiers).toEqual(['test-id-1', 'test-id-2']);
            expect(result.subjects).toEqual(['Subject 1', 'Subject 2']);
            expect(result.contributors).toEqual([
                'Contributor 1',
                'Contributor 2',
            ]);
        });
    });

    describe('getDcMetadata', () => {
        it('should return empty object when no DC metadata is set', () => {
            const result = entry.getDcMetadata();
            expect(result).toEqual({});
        });

        it('should return the complete DC metadata object', () => {
            const dcMetadata: DCMetadata = {
                publisher: 'Test Publisher',
                language: 'en',
                subjects: ['Test Subject'],
            };

            entry.setDcMetadata(dcMetadata);
            const result = entry.getDcMetadata();

            expect(result).toEqual(dcMetadata);
        });
    });

    describe('Constructor with dcMetadata', () => {
        it('should set DC metadata through EntryOptions constructor', () => {
            const dcMetadata: DCMetadata = {
                publisher: 'Constructor Publisher',
                language: 'fr',
                subjects: ['Constructor Subject'],
            };

            const entryWithDc = new Entry({
                id: 'test-id',
                title: 'Test Title',
                dcMetadata,
            });

            const result = entryWithDc.getDcMetadata();
            expect(result).toEqual(dcMetadata);
        });

        it('should initialize empty dcMetadata object when not provided in constructor', () => {
            const entryWithoutDc = new Entry({
                id: 'test-id',
                title: 'Test Title',
            });

            const result = entryWithoutDc.getDcMetadata();
            expect(result).toEqual({});
        });
    });

    describe('XML Serialization', () => {
        it('should serialize simple DC metadata fields to XML', () => {
            entry.setDcMetadata({
                publisher: 'Oxford University Press',
                issued: '1958-01-01',
                language: 'en',
                type: 'Text',
                format: 'application/pdf',
            });

            const xml = entry.toXml();

            expect(xml).toContain(
                '<dc:publisher>Oxford University Press</dc:publisher>'
            );
            expect(xml).toContain('<dc:issued>1958-01-01</dc:issued>');
            expect(xml).toContain('<dc:language>en</dc:language>');
            expect(xml).toContain('<dc:type>Text</dc:type>');
            expect(xml).toContain('<dc:format>application/pdf</dc:format>');
        });

        it('should serialize identifier arrays to multiple XML elements', () => {
            entry.setDcMetadata({
                identifiers: [
                    'urn:isbn:978-0-19-852011-5',
                    'https://doi.org/10.1093/oso/9780198520115.001.0001',
                    'urn:issn:1234-5678',
                ],
            });

            const xml = entry.toXml();

            expect(xml).toContain(
                '<dc:identifier>urn:isbn:978-0-19-852011-5</dc:identifier>'
            );
            expect(xml).toContain(
                '<dc:identifier>https://doi.org/10.1093/oso/9780198520115.001.0001</dc:identifier>'
            );
            expect(xml).toContain(
                '<dc:identifier>urn:issn:1234-5678</dc:identifier>'
            );
        });

        it('should serialize subject arrays to multiple XML elements', () => {
            entry.setDcMetadata({
                subjects: [
                    'Physics',
                    'Quantum Mechanics',
                    'Mathematical Physics',
                ],
            });

            const xml = entry.toXml();

            expect(xml).toContain('<dc:subject>Physics</dc:subject>');
            expect(xml).toContain('<dc:subject>Quantum Mechanics</dc:subject>');
            expect(xml).toContain(
                '<dc:subject>Mathematical Physics</dc:subject>'
            );
        });

        it('should serialize references arrays to multiple XML elements', () => {
            entry.setDcMetadata({
                references: ['Reference 1', 'Reference 2'],
            });

            const xml = entry.toXml();

            expect(xml).toContain('<dc:references>Reference 1</dc:references>');
            expect(xml).toContain('<dc:references>Reference 2</dc:references>');
        });

        it('should serialize isReferencedBy arrays to multiple XML elements', () => {
            entry.setDcMetadata({
                isReferencedBy: ['Citation 1', 'Citation 2'],
            });

            const xml = entry.toXml();

            expect(xml).toContain(
                '<dc:isReferencedBy>Citation 1</dc:isReferencedBy>'
            );
            expect(xml).toContain(
                '<dc:isReferencedBy>Citation 2</dc:isReferencedBy>'
            );
        });

        it('should serialize contributors with complex structure', () => {
            entry.setDcMetadata({
                contributors: [
                    'R. H. Dalitz',
                    'National Science Foundation (Grant #PHY-2012345)',
                ],
            });

            const xml = entry.toXml();

            expect(xml).toContain('<dc:contributor>');
            expect(xml).toContain('<name>R. H. Dalitz</name>');
            expect(xml).toContain(
                '<name>National Science Foundation (Grant #PHY-2012345)</name>'
            );
        });

        it('should not include empty or undefined DC metadata fields in XML', () => {
            entry.setDcMetadata({
                publisher: 'Test Publisher',
                language: undefined,
                subjects: [],
                identifiers: ['test-id'],
            });

            const xml = entry.toXml();

            expect(xml).toContain(
                '<dc:publisher>Test Publisher</dc:publisher>'
            );
            expect(xml).toContain('<dc:identifier>test-id</dc:identifier>');
            expect(xml).not.toContain('<dc:language>');
            expect(xml).not.toContain('<dc:subject>');
        });

        it('should handle special characters in DC metadata values', () => {
            entry.setDcMetadata({
                publisher: 'Publisher & Company < > "Quotes"',
                bibliographicCitation:
                    'Author, A. (2025). "Title with <special> characters & symbols". Publisher.',
            });

            const xml = entry.toXml();

            expect(xml).toContain('Publisher &amp; Company &lt; &gt; "Quotes"');
            expect(xml).toContain(
                '"Title with &lt;special&gt; characters &amp; symbols"'
            );
        });

        it('should serialize complete DC metadata example', () => {
            entry.setDcMetadata({
                identifiers: [
                    'urn:isbn:978-0-19-852011-5',
                    'https://doi.org/10.1093/oso/9780198520115.001.0001',
                ],
                publisher: 'Oxford University Press',
                issued: '1958-01-01',
                language: 'en',
                type: 'Text',
                format: 'application/pdf',
                subjects: ['Physics', 'Quantum Mechanics'],
                contributors: ['R. H. Dalitz'],
                bibliographicCitation:
                    'Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.',
                license: 'All rights reserved',
            });

            const xml = entry.toXml();

            // Check that all fields are present
            expect(xml).toContain(
                '<dc:identifier>urn:isbn:978-0-19-852011-5</dc:identifier>'
            );
            expect(xml).toContain(
                '<dc:identifier>https://doi.org/10.1093/oso/9780198520115.001.0001</dc:identifier>'
            );
            expect(xml).toContain(
                '<dc:publisher>Oxford University Press</dc:publisher>'
            );
            expect(xml).toContain('<dc:issued>1958-01-01</dc:issued>');
            expect(xml).toContain('<dc:language>en</dc:language>');
            expect(xml).toContain('<dc:type>Text</dc:type>');
            expect(xml).toContain('<dc:format>application/pdf</dc:format>');
            expect(xml).toContain('<dc:subject>Physics</dc:subject>');
            expect(xml).toContain('<dc:subject>Quantum Mechanics</dc:subject>');
            expect(xml).toContain('<dc:contributor>');
            expect(xml).toContain('<name>R. H. Dalitz</name>');
            expect(xml).toContain(
                '<dc:license>All rights reserved</dc:license>'
            );
        });
    });

    describe('Integration with other Entry features', () => {
        it('should work with method chaining', () => {
            const result = entry
                .setAuthor('Test Author')
                .setSummary('Test Summary')
                .setDcMetadata({ publisher: 'Test Publisher' })
                .setDcMetadataField('language', 'en')
                .addLink({ rel: 'self', href: '/test' });

            expect(result).toBe(entry);
            expect(entry.getAuthor()).toBe('Test Author');
            expect(entry.getSummary()).toBe('Test Summary');
            expect(entry.getDcMetadata().publisher).toBe('Test Publisher');
            expect(entry.getDcMetadata().language).toBe('en');
        });

        it('should be included in getOptions() output', () => {
            const dcMetadata: DCMetadata = {
                publisher: 'Test Publisher',
                subjects: ['Test Subject'],
            };

            entry.setDcMetadata(dcMetadata);
            const options = entry.getOptions();

            expect(options.dcMetadata).toEqual(dcMetadata);
        });

        it('should work with Entry constructor options', () => {
            const entryWithAllOptions = new Entry({
                id: 'full-entry',
                title: 'Full Entry',
                author: 'Test Author',
                summary: 'Test Summary',
                dcMetadata: {
                    publisher: 'Test Publisher',
                    language: 'en',
                    subjects: ['Test Subject'],
                },
                links: [{ rel: 'self', href: '/test' }],
            });

            const options = entryWithAllOptions.getOptions();
            expect(options.dcMetadata?.publisher).toBe('Test Publisher');
            expect(options.dcMetadata?.language).toBe('en');
            expect(options.dcMetadata?.subjects).toEqual(['Test Subject']);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty arrays', () => {
            entry.setDcMetadata({
                identifiers: [],
                subjects: [],
                contributors: [],
            });

            const xml = entry.toXml();
            expect(xml).not.toContain('<dc:identifier>');
            expect(xml).not.toContain('<dc:subject>');
            expect(xml).not.toContain('<dc:contributor>');
        });

        it('should handle null and undefined values', () => {
            entry.setDcMetadata({
                publisher: undefined,
                language: null as any,
                type: '',
            });

            const xml = entry.toXml();
            expect(xml).not.toContain('<dc:publisher>');
            expect(xml).not.toContain('<dc:language>');
            expect(xml).not.toContain('<dc:type>');
        });

        it('should handle arrays with empty strings', () => {
            entry.setDcMetadata({
                subjects: ['Valid Subject', '', 'Another Valid Subject'],
                identifiers: ['', 'valid-id', ''],
            });

            const xml = entry.toXml();
            expect(xml).toContain('<dc:subject>Valid Subject</dc:subject>');
            expect(xml).toContain(
                '<dc:subject>Another Valid Subject</dc:subject>'
            );
            expect(xml).toContain('<dc:identifier>valid-id</dc:identifier>');
            // Should not contain empty elements
            expect(xml).not.toMatch(/<dc:subject>\s*<\/dc:subject>/);
            expect(xml).not.toMatch(/<dc:identifier>\s*<\/dc:identifier>/);
        });

        it('should handle very long text values', () => {
            const longText = 'A'.repeat(10000);
            entry.setDcMetadata({
                bibliographicCitation: longText,
            });

            const xml = entry.toXml();
            expect(xml).toContain(
                `<dc:bibliographicCitation>${longText}</dc:bibliographicCitation>`
            );
        });

        it('should handle Unicode characters', () => {
            entry.setDcMetadata({
                publisher: 'Éditions Gallimard',
                language: 'français',
                subjects: ['Littérature', '文学', 'Литература'],
            });

            const xml = entry.toXml();
            expect(xml).toContain(
                '<dc:publisher>Éditions Gallimard</dc:publisher>'
            );
            expect(xml).toContain('<dc:language>français</dc:language>');
            expect(xml).toContain('<dc:subject>Littérature</dc:subject>');
            expect(xml).toContain('<dc:subject>文学</dc:subject>');
            expect(xml).toContain('<dc:subject>Литература</dc:subject>');
        });
    });
});

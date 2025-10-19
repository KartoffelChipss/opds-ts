import { AtomEntryBuilder } from '../../../utils/xml/AtomEntryBuilder';
import { EntryOptions, DCMetadata } from '../../../versions/v1_2/types';

describe('AtomEntryBuilder DC Metadata', () => {
    let builder: AtomEntryBuilder;

    beforeEach(() => {
        builder = new AtomEntryBuilder();
    });

    describe('DC Metadata Serialization', () => {
        it('should serialize simple DC text fields', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    publisher: 'Oxford University Press',
                    issued: '1958-01-01',
                    language: 'en',
                    type: 'Text',
                    format: 'application/pdf',
                    isPartOf: 'International Series of Monographs on Physics',
                    hasVersion: 'Fourth Edition',
                    replaces: 'Third Edition',
                    requires: 'Basic knowledge of quantum mechanics',
                    spatial: 'Laboratory conditions',
                    temporal: 'Fall 2025 semester',
                    audience: 'Graduate students and researchers',
                    educationLevel: 'Graduate',
                    license: 'All rights reserved',
                    accessRights: 'Institutional access required',
                    available: '2025-09-01',
                    created: '2025-08-15',
                    bibliographicCitation:
                        'Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.',
                    medium: 'Digital',
                    instructionalMethod: 'Online lecture series',
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:publisher>Oxford University Press</dc:publisher>'
            );
            expect(xml).toContain('<dc:issued>1958-01-01</dc:issued>');
            expect(xml).toContain('<dc:language>en</dc:language>');
            expect(xml).toContain('<dc:type>Text</dc:type>');
            expect(xml).toContain('<dc:format>application/pdf</dc:format>');
            expect(xml).toContain(
                '<dc:isPartOf>International Series of Monographs on Physics</dc:isPartOf>'
            );
            expect(xml).toContain(
                '<dc:hasVersion>Fourth Edition</dc:hasVersion>'
            );
            expect(xml).toContain('<dc:replaces>Third Edition</dc:replaces>');
            expect(xml).toContain(
                '<dc:requires>Basic knowledge of quantum mechanics</dc:requires>'
            );
            expect(xml).toContain(
                '<dc:spatial>Laboratory conditions</dc:spatial>'
            );
            expect(xml).toContain(
                '<dc:temporal>Fall 2025 semester</dc:temporal>'
            );
            expect(xml).toContain(
                '<dc:audience>Graduate students and researchers</dc:audience>'
            );
            expect(xml).toContain(
                '<dc:educationLevel>Graduate</dc:educationLevel>'
            );
            expect(xml).toContain(
                '<dc:license>All rights reserved</dc:license>'
            );
            expect(xml).toContain(
                '<dc:accessRights>Institutional access required</dc:accessRights>'
            );
            expect(xml).toContain('<dc:available>2025-09-01</dc:available>');
            expect(xml).toContain('<dc:created>2025-08-15</dc:created>');
            expect(xml).toContain(
                '<dc:bibliographicCitation>Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.</dc:bibliographicCitation>'
            );
            expect(xml).toContain('<dc:medium>Digital</dc:medium>');
            expect(xml).toContain(
                '<dc:instructionalMethod>Online lecture series</dc:instructionalMethod>'
            );
        });

        it('should serialize DC identifier arrays as multiple elements', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    identifiers: [
                        'urn:isbn:978-0-19-852011-5',
                        'https://doi.org/10.1093/oso/9780198520115.001.0001',
                        'urn:issn:1234-5678',
                    ],
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:identifier>urn:isbn:978-0-19-852011-5</dc:identifier>'
            );
            expect(xml).toContain(
                '<dc:identifier>https://doi.org/10.1093/oso/9780198520115.001.0001</dc:identifier>'
            );
            expect(xml).toContain(
                '<dc:identifier>urn:issn:1234-5678</dc:identifier>'
            );

            // Count occurrences to ensure all identifiers are included
            const identifierMatches = xml.match(/<dc:identifier>/g);
            expect(identifierMatches).toHaveLength(3);
        });

        it('should serialize DC subject arrays as multiple elements', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    subjects: [
                        'Physics',
                        'Quantum Mechanics',
                        'Mathematical Physics',
                        'Theoretical Physics',
                    ],
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain('<dc:subject>Physics</dc:subject>');
            expect(xml).toContain('<dc:subject>Quantum Mechanics</dc:subject>');
            expect(xml).toContain(
                '<dc:subject>Mathematical Physics</dc:subject>'
            );
            expect(xml).toContain(
                '<dc:subject>Theoretical Physics</dc:subject>'
            );

            const subjectMatches = xml.match(/<dc:subject>/g);
            expect(subjectMatches).toHaveLength(4);
        });

        it('should serialize DC references arrays as multiple elements', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    references: [
                        'Heisenberg, W. (1927). Über den anschaulichen Inhalt der quantentheoretischen Kinematik und Mechanik.',
                        'Schrödinger, E. (1926). An Undulatory Theory of the Mechanics of Atoms and Molecules.',
                    ],
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:references>Heisenberg, W. (1927). Über den anschaulichen Inhalt der quantentheoretischen Kinematik und Mechanik.</dc:references>'
            );
            expect(xml).toContain(
                '<dc:references>Schrödinger, E. (1926). An Undulatory Theory of the Mechanics of Atoms and Molecules.</dc:references>'
            );

            const referencesMatches = xml.match(/<dc:references>/g);
            expect(referencesMatches).toHaveLength(2);
        });

        it('should serialize DC isReferencedBy arrays as multiple elements', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    isReferencedBy: [
                        'Modern Quantum Theory (2020)',
                        'Advanced Physics Textbook (2021)',
                    ],
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:isReferencedBy>Modern Quantum Theory (2020)</dc:isReferencedBy>'
            );
            expect(xml).toContain(
                '<dc:isReferencedBy>Advanced Physics Textbook (2021)</dc:isReferencedBy>'
            );

            const isReferencedByMatches = xml.match(/<dc:isReferencedBy>/g);
            expect(isReferencedByMatches).toHaveLength(2);
        });

        it('should serialize DC contributors with complex structure', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    contributors: [
                        'R. H. Dalitz',
                        'National Science Foundation (Grant #PHY-2012345)',
                        'University Research Board',
                    ],
                },
            };

            const xml = builder.setMetadata(options).build();

            // Contributors should be wrapped in contributor elements with name sub-elements
            expect(xml).toContain('<dc:contributor>');
            expect(xml).toContain('<name>R. H. Dalitz</name>');
            expect(xml).toContain(
                '<name>National Science Foundation (Grant #PHY-2012345)</name>'
            );
            expect(xml).toContain('<name>University Research Board</name>');

            const contributorMatches = xml.match(/<dc:contributor>/g);
            expect(contributorMatches).toHaveLength(3);
        });

        it('should escape special characters in DC metadata values', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    publisher: 'Publisher & Company < > "Quotes"',
                    subjects: [
                        'Subject with <special> characters',
                        'Subject & symbols',
                    ],
                    bibliographicCitation:
                        'Author, A. (2025). "Title with <special> characters & symbols". Publisher.',
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:publisher>Publisher &amp; Company &lt; &gt; "Quotes"</dc:publisher>'
            );
            expect(xml).toContain(
                '<dc:subject>Subject with &lt;special&gt; characters</dc:subject>'
            );
            expect(xml).toContain(
                '<dc:subject>Subject &amp; symbols</dc:subject>'
            );
            expect(xml).toContain(
                '<dc:bibliographicCitation>Author, A. (2025). "Title with &lt;special&gt; characters &amp; symbols". Publisher.</dc:bibliographicCitation>'
            );
        });

        it('should not include empty or undefined DC metadata fields', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    publisher: 'Valid Publisher',
                    language: undefined,
                    type: '',
                    subjects: [],
                    identifiers: ['valid-id'],
                    contributors: [],
                    format: null as any,
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:publisher>Valid Publisher</dc:publisher>'
            );
            expect(xml).toContain('<dc:identifier>valid-id</dc:identifier>');

            // Should not contain empty/undefined fields
            expect(xml).not.toContain('<dc:language>');
            expect(xml).not.toContain('<dc:type>');
            expect(xml).not.toContain('<dc:subject>');
            expect(xml).not.toContain('<dc:contributor>');
            expect(xml).not.toContain('<dc:format>');
        });

        it('should include empty strings in arrays (no filtering)', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    subjects: ['Valid Subject', '', 'Another Valid Subject'],
                    identifiers: ['', 'valid-id', ''],
                    contributors: [
                        'Valid Contributor',
                        '',
                        'Another Valid Contributor',
                    ],
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain('<dc:subject>Valid Subject</dc:subject>');
            expect(xml).toContain(
                '<dc:subject>Another Valid Subject</dc:subject>'
            );
            expect(xml).toContain('<dc:identifier>valid-id</dc:identifier>');
            expect(xml).toContain('<name>Valid Contributor</name>');
            expect(xml).toContain('<name>Another Valid Contributor</name>');

            // Should include empty elements (no filtering)
            expect(xml).toContain('<dc:subject/>');
            expect(xml).toContain('<dc:identifier/>');
            expect(xml).toContain('<name/>');

            // Count all elements including empty ones
            const subjectMatches = xml.match(/<dc:subject[^>]*>/g);
            expect(subjectMatches).toHaveLength(3);

            const identifierMatches = xml.match(/<dc:identifier[^>]*>/g);
            expect(identifierMatches).toHaveLength(3);

            const contributorMatches = xml.match(/<dc:contributor[^>]*>/g);
            expect(contributorMatches).toHaveLength(3);
        });

        it('should handle Unicode characters correctly', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    publisher: 'Éditions Gallimard',
                    language: 'français',
                    subjects: ['Littérature', '文学', 'Литература'],
                    bibliographicCitation:
                        'Müller, H. (2025). Über die Quantenmechanik. Verlag für Wissenschaft.',
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                '<dc:publisher>Éditions Gallimard</dc:publisher>'
            );
            expect(xml).toContain('<dc:language>français</dc:language>');
            expect(xml).toContain('<dc:subject>Littérature</dc:subject>');
            expect(xml).toContain('<dc:subject>文学</dc:subject>');
            expect(xml).toContain('<dc:subject>Литература</dc:subject>');
            expect(xml).toContain(
                '<dc:bibliographicCitation>Müller, H. (2025). Über die Quantenmechanik. Verlag für Wissenschaft.</dc:bibliographicCitation>'
            );
        });

        it('should work without DC metadata', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                author: 'Test Author',
                summary: 'Test Summary',
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain('<id>test-entry</id>');
            expect(xml).toContain('<title>Test Entry</title>');
            expect(xml).toContain('<name>Test Author</name>');
            expect(xml).toContain(
                '<summary type="text">Test Summary</summary>'
            );

            // Should not contain any dc: elements
            expect(xml).not.toMatch(/<dc:/);
        });

        it('should handle empty DC metadata object', () => {
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {},
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain('<id>test-entry</id>');
            expect(xml).toContain('<title>Test Entry</title>');
            expect(xml).not.toMatch(/<dc:/);
        });

        it('should handle very long text values', () => {
            const longText = 'A'.repeat(1000);
            const options: EntryOptions = {
                id: 'test-entry',
                title: 'Test Entry',
                dcMetadata: {
                    bibliographicCitation: longText,
                    publisher: longText,
                },
            };

            const xml = builder.setMetadata(options).build();

            expect(xml).toContain(
                `<dc:bibliographicCitation>${longText}</dc:bibliographicCitation>`
            );
            expect(xml).toContain(`<dc:publisher>${longText}</dc:publisher>`);
        });

        it('should serialize complex real-world example', () => {
            const options: EntryOptions = {
                id: 'dirac-quantum-mechanics',
                title: 'The Principles of Quantum Mechanics',
                author: 'P. A. M. Dirac',
                summary:
                    'A foundational text in quantum mechanics by one of its pioneers.',
                dcMetadata: {
                    identifiers: [
                        'urn:isbn:978-0-19-852011-5',
                        'https://doi.org/10.1093/oso/9780198520115.001.0001',
                    ],
                    publisher: 'Oxford University Press',
                    issued: '1958-01-01',
                    language: 'en',
                    type: 'Text',
                    format: 'application/pdf',
                    isPartOf: 'International Series of Monographs on Physics',
                    hasVersion: 'Fourth Edition',
                    subjects: [
                        'Physics',
                        'Quantum Mechanics',
                        'Mathematical Physics',
                        'Theoretical Physics',
                    ],
                    contributors: [
                        'R. H. Dalitz',
                        'Oxford University Press Editorial Board',
                    ],
                    bibliographicCitation:
                        'Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.',
                    license: 'All rights reserved',
                    audience: 'Graduate students and researchers in physics',
                    educationLevel: 'Graduate',
                },
            };

            const xml = builder.setMetadata(options).build();

            // Check basic entry elements
            expect(xml).toContain('<id>dirac-quantum-mechanics</id>');
            expect(xml).toContain(
                '<title>The Principles of Quantum Mechanics</title>'
            );
            expect(xml).toContain('<name>P. A. M. Dirac</name>');
            expect(xml).toContain(
                '<summary type="text">A foundational text in quantum mechanics by one of its pioneers.</summary>'
            );

            // Check DC metadata
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
            expect(xml).toContain(
                '<dc:isPartOf>International Series of Monographs on Physics</dc:isPartOf>'
            );
            expect(xml).toContain(
                '<dc:hasVersion>Fourth Edition</dc:hasVersion>'
            );
            expect(xml).toContain('<dc:subject>Physics</dc:subject>');
            expect(xml).toContain('<dc:subject>Quantum Mechanics</dc:subject>');
            expect(xml).toContain(
                '<dc:subject>Mathematical Physics</dc:subject>'
            );
            expect(xml).toContain(
                '<dc:subject>Theoretical Physics</dc:subject>'
            );
            expect(xml).toContain('<name>R. H. Dalitz</name>');
            expect(xml).toContain(
                '<name>Oxford University Press Editorial Board</name>'
            );
            expect(xml).toContain(
                '<dc:bibliographicCitation>Dirac, P. A. M. (1958). The Principles of Quantum Mechanics (4th ed.). Oxford University Press.</dc:bibliographicCitation>'
            );
            expect(xml).toContain(
                '<dc:license>All rights reserved</dc:license>'
            );
            expect(xml).toContain(
                '<dc:audience>Graduate students and researchers in physics</dc:audience>'
            );
            expect(xml).toContain(
                '<dc:educationLevel>Graduate</dc:educationLevel>'
            );
        });
    });
});

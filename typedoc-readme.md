[![npm](https://img.shields.io/npm/v/opds-ts?label=Version&color=%23366fb4)](https://www.npmjs.com/package/opds-ts) [![npm](https://img.shields.io/npm/dt/opds-ts?label=Downloads)](https://www.npmjs.com/package/opds-ts) [![Discord](https://discord.com/api/guilds/990295419005333554/widget.png)](https://strassburger.org/discord)

A TypeScript library for generating and parsing **OPDS feeds** ([v1.2](https://specs.opds.io/opds-1.2) and [v2.0](https://specs.opds.io/opds-2.0)) with a fluent API.

## Features

- Fully TypeScript typed.
- Fluent API for constructing `Feed` and `Entry` objects.
- Relative URL resolution to absolute URLs.
- Support for extra metadata / vendor-specific attributes.
- Output as pretty or compact XML (v1.2) or JSON (v2).
- Parse from XML (v1.2) or JSON (v2).
- Validation against the OPDS 2.0 requirements.
- Helpers for common OPDS links like navigation or acquisition.

## Installation

```bash
npm install opds-ts
```

## Importing

When importing make sure to use the right version. E.g.:

```ts
import { Feed, Entry } from 'opds-ts/v1.2';
```

or

```ts
import { Feed, Publication } from 'opds-ts/v2';
```

## Basic usage

This is an example on how to create a simple v1.2 feed:

```ts
import { Feed, Entry } from 'opds-ts/v1.2';

const baseUrl = 'https://example.com';

const feed = new Feed('books', 'All Books')
    .setLang('en')
    .setAuthor('The Library of Babel')
    .setKind('navigation')
    .addNavigationLink('start', '/opds');

const entry = new Entry('book:1', 'The Lord of the Rings')
    .setAuthor('J. R. R. Tolkien')
    .setSummary(
        'A ring with mysterious powers lands in the hands of a young hobbit, Frodo. Under the guidance of Gandalf, a wizard, he and his three friends set out on a journey and land in the Elvish kingdom.'
    )
    .addAcquisition(
        '/entry/1/acquisition',
        'application/epub+zip',
        'open-access'
    )
    .addImage('/data/covers/1.jpg');

feed.addEntry(entry);

const xml = feed.toXml({ baseUrl, prettyPrint: true });
console.log(xml);
```

This is an example on how to parse a v1.2 feed:

```ts
import { Feed } from 'opds-ts/v1.2';

const xmlString = '...';
const feed = Feed.fromXml(xmlString);
console.log(feed.getEntries());
```

## OPDS 2.0

OPDS 2.0 feeds are JSON documents. This is an example on how to create a simple v2 feed:

```ts
import { Feed, Publication, Facet, Group } from 'opds-ts/v2';

const baseUrl = 'https://example.com';

const publication = new Publication('urn:isbn:9780261102385', 'The Lord of the Rings')
    .setType('http://schema.org/Book')
    .addAuthor('J. R. R. Tolkien')
    .setLanguage('en')
    .setDescription('A ring with mysterious powers lands in the hands of a young hobbit, Frodo.')
    .setSeries('The Lord of the Rings', 1)
    .addSelfLink('/publications/1.json')
    .addAcquisition('/publications/1.epub', 'application/epub+zip', 'download')
    .addAcquisition('/publications/1/buy', 'text/html', 'buy', {
        price: { currency: 'USD', value: 4.99 },
        indirectAcquisition: [{ type: 'application/epub+zip' }],
    })
    .addImage('/covers/1.jpg', 'image/jpeg', { width: 800, height: 1200 });

const feed = new Feed('All Books')
    .addSelfLink('/opds/books')
    .addSearchLink('/opds/search{?query}')
    .setPagination({ numberOfItems: 120, itemsPerPage: 50, currentPage: 1 })
    .addPaginationLinks({ next: '/opds/books?page=2', last: '/opds/books?page=3' })
    .addNavigation('/opds/new', 'New Publications')
    .addFacet(
        new Facet('Language')
            .addFacet('/opds/books?lang=en', 'English', { numberOfItems: 100, active: true })
            .addFacet('/opds/books?lang=de', 'German', { numberOfItems: 20 })
    )
    .addPublication(publication);

console.log(feed.validate()); // [] if the feed follows the OPDS 2.0 requirements
const json = feed.toJson({ baseUrl, prettyPrint: true });
```

Use `Group` to put several navigation or publications collections in one feed:

```ts
feed.addGroup(
    new Group('Featured').addSelfLink('/opds/featured').addPublication(publication)
);
```

This is an example on how to parse a v2 feed:

```ts
import { Feed } from 'opds-ts/v2';

const feed = Feed.fromJson(jsonString); // also accepts an already parsed object
console.log(feed.getPublications());
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/KartoffelChipss/opds-ts/blob/main/LICENSE) file for details.

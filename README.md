# opds-ts

[![npm](https://img.shields.io/npm/v/opds-ts?label=Version&color=%23366fb4)](https://www.npmjs.com/package/opds-ts) [![npm](https://img.shields.io/npm/dt/opds-ts?label=Downloads)](https://www.npmjs.com/package/opds-ts) [![Discord](https://discord.com/api/guilds/990295419005333554/widget.png)](https://strassburger.org/discord)

A TypeScript library for generating **OPDS feeds** (v1.2) with a fluent API. Designed to be extendable for future OPDS v2 support.

## Features

- Fully TypeScript typed.
- Fluent API for constructing `Feed` and `Entry` objects.
- Relative URL resolution to absolute URLs.
- Support for extra metadata / vendor-specific attributes.
- Output as pretty or compact XML.
- Helpers for common OPDS links (`self`, `start`).

## Installation

```bash
npm install opds-ts
```

## Basic usage

This is an example on how to create a simple feed:

```ts
import { Feed } from 'opds-ts';
import { Entry } from 'opds-ts';

const baseUrl = 'https://example.com';

const feed = new Feed('books', 'All Books')
    .setLang('en')
    .setAuthor('The Library of Babel')
    .setKind('navigation')
    .addSelfLink('/opds', 'navigation')
    .addStartLink('/opds');

const entry = new Entry('book:1', 'The Lord of the Rings')
    .setAuthor('J. R. R. Tolkien')
    .setSummary(
        'A ring with mysterious powers lands in the hands of a young hobbit, Frodo. Under the guidance of Gandalf, a wizard, he and his three friends set out on a journey and land in the Elvish kingdom.'
    )
    .addAcquisition('/entry/1/acquisition', 'application/epub+zip')
    .addImage('/data/covers/1.jpg');

feed.addEntry(entry);

const xml = feed.toXml({ baseUrl, prettyPrint: true });
console.log(xml);
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/KartoffelChipss/Typerinth/blob/main/LICENSE) file for details.

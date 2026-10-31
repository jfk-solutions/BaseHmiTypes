# Shared WinCC Unified format definition

`unified/catalog.xml` is the authoritative wire schema for C# and TypeScript, independent of Siemens major versions. Defaults are stable values of our format; native adapters supply actual source values. The catalog contains no captured project values or API inventory.

`unified/manifest.json` records the type-contract ID and the whole-file SHA-256. The C# assembly embeds `unified/catalog.xml.gz`; `HmiUnifiedXmlCatalog.Open()` and `Read()` decompress it. The TypeScript build verifies the manifest, generates a schema literal for synchronous export, and copies the compressed asset to `dist/catalogs/unified/catalog.xml.gz`. `HmiUnifiedXmlCatalog.load()` returns the bundled definition; `loadFromUrl(url)` and `read(bytes)` load its gzip representation.

Both browser import and export use native DOMParser/XMLSerializer. Node consumers must provide a DOM implementation. Compression uses built-in APIs. No original screen XML is embedded in the generated contract module.

Superseded catalog IDs and version-specific loader APIs are removed. Regenerate exports with the current producer. Native TIA project-version compatibility is separate and remains in the source adapters.

See [the format description](../docs/WINCC-UNIFIED-XML.md) and [coverage](../docs/UNIFIED-XML-COVERAGE.md).

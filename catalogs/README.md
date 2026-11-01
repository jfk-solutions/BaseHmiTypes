# Shared WinCC Unified format definition

`unified/catalog.xml` is the authoritative wire schema for C# and TypeScript, independent of Siemens major versions. Defaults are stable values of our format; native adapters supply actual source values. The catalog contains no captured project values or API inventory. Contract identifiers are readable semantic names; ambiguous value types use names such as `FaceplateInterface.Int64` and `MappingTableEntryRange.Color`. XML selectors are omitted for tags with a single contract. The multilingual Text property uses the `html-fragment` representation: language entries contain direct mixed formatting content, with a canonical empty formatted paragraph as the omitted-payload default.

Exported screen and device documents contain no catalog ID or fingerprint. Readers always use the bundled schema, or the explicit schema supplied by the host.

`unified/manifest.json` records the internal type-contract checksum and the whole-file SHA-256 for package integrity. The C# assembly embeds `unified/catalog.xml.gz`; `HmiUnifiedXmlCatalog.Open()` and `Read()` decompress it. The TypeScript build verifies the manifest, generates a schema literal for synchronous export, and copies the compressed asset to `dist/catalogs/unified/catalog.xml.gz`. `HmiUnifiedXmlCatalog.load()` returns the bundled definition; `loadFromUrl(url)` and `read(bytes)` load its gzip representation.

Both browser import and export use native DOMParser/XMLSerializer. Node consumers must provide a DOM implementation. Compression uses built-in APIs. No original screen XML is embedded in the generated contract module.

Superseded catalog IDs and version-specific loader APIs are removed. Regenerate exports with the current producer. Native TIA project-version compatibility is separate and remains in the source adapters.

See [the format description](../docs/WINCC-UNIFIED-XML.md) and [coverage](../docs/UNIFIED-XML-COVERAGE.md).


The Unified catalog builder reads installed public SDK metadata offline:

```powershell
dotnet run --project tools/UnifiedCatalogBuilder -- "C:/Program Files/Siemens/Automation/Portal V21/PublicAPI/V21/net48" .
```

Review the generated contract changes, rebuild both model packages and synchronize the catalog and generated ID with S7Mcp before packaging the add-in. The builder retains stable format defaults and does not inspect project values. Enum numeric metadata also drives native-reader conversion. Anonymous owned collection slots are declared explicitly; SDK inventory alone is not a completeness certificate.

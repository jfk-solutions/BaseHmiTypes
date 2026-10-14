# WinCC Unified format catalogs

The screen writer and reader use a fixed WinCC Unified V21 catalog extracted
via TIA Portal Openness. The full XML is retained losslessly as gzip in
`unified-v21/`.
Decompression restores its original bytes exactly.

- Extraction interface: TIA Portal Openness
- Engineering API profile: `21.0.0.0`
- Catalog ID: `89ce7b2e33155ea0da70a8cfd76f09798b9a9f9d68c08155a7afb646a76bdd1a`
- Raw file SHA-256: `4102951f75ea86b9c907bdc1fa6a236db9e3142183e70c7ceed38d13f94acf26`

## Origin and generation

The catalog was extracted via TIA Portal V21 Openness and validated against
engineering objects. It contains:

- A 539-entry API inventory with type names, properties, enum values and
  selected creation/import/export signatures.
- The 18 encoding contracts for 13 semantic types describe object layouts
  validated against a captured screen graph, including attributes, owned parts,
  scripts, multilingual text and creation information. XML aliases, promoted
  parts, value encodings and omission baselines are rules of this interchange
  format. Recorded baselines are not proof of Siemens factory defaults.

A catalog authoring tool can use Openness self-description and object reads.
The relevant API methods include
`GetAttributeInfos()`, `GetCompositionInfos()` and `GetCreationInfos()`;
see [Siemens' self-description documentation](https://docs.tia.siemens.cloud/r/en-us/v20/tia-portal-openness-api-for-automation-of-engineering-workflows/tia-portal-openness-api/general-functions/self-description-support-for-attributes-navigators-actions-and-services).
Representative engineering objects are needed to discover and validate runtime
attribute/member shapes and values. An API inventory alone does not establish
all encoding contracts or their defaults. Openness does not return this custom
catalog XML directly: an authoring tool must apply the format rules, validate
the supported states and publish an immutable release.

## Identifier and filename

The long filename is the catalog ID: a lowercase hexadecimal SHA-256 digest of
its normalized `types` subtree, followed by `.xml.gz`. Normalization clones that
subtree, removes namespace-declaration attributes, serializes it using .NET
LINQ to XML `SaveOptions.DisableFormatting`, and hashes the UTF-8 bytes without
a BOM. Contract order and exact default text are preserved. The API inventory
and root metadata are excluded from this digest.

This lets an export identify exactly which decoding contracts and defaults it
requires, including when multiple catalogs target the same engineering API
version. The catalog ID differs from the SHA-256 of the whole XML file bytes
recorded above. The directory `unified-v21` supplies the readable version label.

## Distribution

The catalog compresses from 607,318 bytes to 26,529 bytes (about 96% smaller).
Compression does not change the catalog ID or the uncompressed file hash.

The C# assembly embeds this file as
`BaseHmiTypes.Converters.UnifiedXml.Catalogs.<catalog-id>.xml.gz`.
`HmiUnifiedXmlCatalog.OpenV21()` returns a decompressed XML stream;
`ReadV21()` returns the XML string. Both use the built-in .NET `GZipStream`
and work with all of the library's target frameworks. No extra package is needed.

The TypeScript build copies the same file to `dist/catalogs/unified-v21/`;
the npm package exposes it at
`@jfk-solutions/base-hmi-types/catalogs/unified-v21/<catalog-id>.xml.gz`.
The npm build verifies the decompressed XML hash before copying it.

The TypeScript loader uses browser APIs (`fetch`, `DecompressionStream`,
`Response`, `TextDecoder`) and has no Node.js or third-party runtime dependency.
It requires a browser with `DecompressionStream("gzip")` support. Node.js is
used only for package build tooling and automated tests.

```csharp
using var xmlStream = HmiUnifiedXmlCatalog.OpenV21();
var catalog = System.Xml.Linq.XDocument.Load(xmlStream);
```

```typescript
const xml = await HmiUnifiedXmlCatalog.loadV21();
const catalog = new DOMParser().parseFromString(xml, "application/xml");
```

Hosts must deploy the gzip asset alongside the built modules or pass its hosted
URL to `loadV21(url)`. Bundlers may require explicit asset copying. Serve this
file as binary gzip data (e.g. `Content-Type: application/gzip`), without
`Content-Encoding: gzip`: the loader performs decompression itself. For bytes
already fetched by the host, use `await HmiUnifiedXmlCatalog.readV21(bytes)`.

Keep released catalogs immutable. Future catalog releases should add a new
ID/file and preserve historical versions. Copying this catalog does not expand
the current writer's semantic mappings or change its incomplete-export status.

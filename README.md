# BaseHmiTypes

BaseHmiTypes is a neutral HMI model assembly for Siemens visualization project readers and converters.
It intentionally does not use Siemens namespaces and contains only shared container types with minimal behavior.

The goal is that readers for systems such as WinCC Advanced, WinCC Professional, ProTool, WinCC flexible, TIA Portal exports, or future importers can all return the same object structure. Conversion code can then work against this common model instead of against every source format directly.

## Installation

Install [BaseHmiTypes from NuGet](https://www.nuget.org/packages/BaseHmiTypes):

```powershell
dotnet add package BaseHmiTypes
```

Or add a package reference directly to your project:

```xml
<PackageReference Include="BaseHmiTypes" Version="2026.8.5.1" />
```

## Projects

- `src/BaseHmiTypes`: C# class library targeting .NET Standard 2.0, .NET Standard 2.1, and .NET 8.
- `src/BaseHmiTypes/Projects`: project base, lazy project interface, descriptors, and source metadata types.
- `src/BaseHmiTypes/Screens`: UI and screen-related C# model types.
- `typescript/base-hmi-types`: mirrored TypeScript package.
- `typescript/base-hmi-types/src/projects.ts`: mirrored project API barrel.
- `typescript/base-hmi-types/src/screens`: UI and screen-related TypeScript model types.

## Development Rule

The C# model and TypeScript model are kept in sync manually for now. When a class, base class, interface, or public container property changes in `src/BaseHmiTypes`, make the matching change in `typescript/base-hmi-types/src`.

Property abstraction is intentionally left for a later step, because many HMI properties can later become static, dynamic, scripted, localized, or connected to tags.

Project implementations should implement `IHmiProject`. The project API is intentionally lazy: it exposes lightweight screen descriptors first and loads a full `HmiScreen` only when requested.

## Build

```powershell
dotnet build BaseHmiTypes.slnx
cd typescript/base-hmi-types
npm install
npm run build
```

## Current Scope

The first model slice covers screen-related objects:

- project root and project info metadata
- base screen model/container types
- screen-owned layers as non-visual item containers
- screens and screen windows
- shape objects
- widget objects
- common HMI controls
- screen window layout
- monitor metadata

## Multi-device projects

`HmiProjectDevice` is a folder with `FolderType.Device` and `HmiDeviceInfo`
metadata (`Id`, `Name`, `DeviceType`, `StartScreenId`, `Author`, and `Comment`).
Place each device's Screens, Tags, Alarms, Connections, and other owned folders
under that node; keep shared resources at project level.

`IHmiProject.Devices` / `devices` exposes these typed nodes. `HmiProjectBase`
derives this list from its root folders and recursively enumerates screens
through devices. Readers without device metadata can keep their existing flat
folders and receive an empty device list. Classes implementing `IHmiProject`
directly must now supply the device-list property (an empty list is valid).

Item descriptors must use IDs unique within the project. Resolve them through
the project provider, including descriptors found below device nodes. A reader
may qualify device-local table IDs while retaining globally unique screen IDs.
The TypeScript model mirrors these types and uses camel-case properties.

## Alarm control collections

`HmiAlarmControl.ColumnSets` (`columnSets` in TypeScript) preserves named column
layouts. `ActiveColumnSet` selects the preview layout; `ColumnDefinitions` remains
the fallback for callers using a single layout. Columns carry localized captions,
alignment, visibility, order, width, and automatic sizing. HTML also previews
configured toolbar buttons and status panels with localized tooltips and text.
Toolbar buttons are disabled preview elements; their configured enabled state is
retained as metadata. Native source names remain available when semantic action
or icon mappings are unknown.

## WinCC Unified XML screen writer

`HmiScreenToUnifiedXmlConverter` writes an XML v2 inspection archive using the
fixed V21 catalog extracted via TIA Portal Openness.
The contract mapping targets specification revision 2.1; later catalog changes
require a deliberate mapping review.
The full [catalog and extraction details](catalogs/README.md) are checked in,
embedded in the C# assembly and included in the npm package.
It is stored as `.xml.gz`; `HmiUnifiedXmlCatalog.OpenV21()` in C# and
`await HmiUnifiedXmlCatalog.loadV21(url)` in the browser decompress it using
built-in runtime APIs, without an additional compression dependency.
The C# and TypeScript APIs return XML plus a separate diagnostics list.

```csharp
using BaseHmiTypes.Converters.UnifiedXml;

var result = new HmiScreenToUnifiedXmlConverter().Convert(screen, "Panel", defaultCultureLcid: 1031);
File.WriteAllText("Main.screen.xml", result.Xml, new System.Text.UTF8Encoding(false));
// Inspect result.Diagnostics for unsupported source data.
```

```typescript
import { HmiScreenToUnifiedXmlConverter } from "@jfk-solutions/base-hmi-types";
const result = new HmiScreenToUnifiedXmlConverter().convert(screen, "Panel", 1031);
// result.xml, result.complete, result.diagnostics
```

This first writer maps ordinary screens, buttons, text boxes and graphic views;
it writes static geometry, visibility/enabled state, supported colors, numeric
appearance properties, font/padding parts and localized text. Formatted text takes
precedence for the same language and is preserved as an escaped string. Default
language text requires the explicit LCID argument; TypeScript diagnoses LCIDs
outside its supported mapping. Layers flatten in collection order with a diagnostic;
shared item instances use object references. Unsupported screen kinds fail.
Unsupported controls, events, bindings, source payloads and other populated fields
produce diagnostics. Dynamic properties never export their static fallback as a
replacement for a missing dynamization contract. Fractional/out-of-range integers,
lossy Single conversions and XML-illegal inline strings are diagnosed and omitted.
Font-family mappings currently cover Arial and SiemensSans.

**Every result has `Complete == false` / `complete === false` and XML
`complete="false"`.** The neutral model lacks the version-specific engineering
coverage needed to certify a complete archive. The writer never uses catalog
defaults to invent unread source fields. Output is for inspection and is rejected
for full engineering restoration. A restorable writer still needs a full
V21 source semantic mapping, including all required fields, scripts and bindings;
no live TIA import has been verified. The destination must have the matching
immutable catalog (`89ce7b2e…a76bdd1a`) and any referenced graphics or other dependencies.

## WinCC Unified XML screen reader

`HmiUnifiedXmlToScreenConverter` reads XML v2 screen archives using the bundled
V21 catalog and returns `Screen`, `SourceComplete` and `Diagnostics` (camel case
in TypeScript). It accepts complete archives and incomplete inspection exports.
`SourceComplete` reports the input flag; it does not certify that every source
field maps to the neutral model. Review diagnostics independently.

```csharp
using BaseHmiTypes.Converters.UnifiedXml;

var result = new HmiUnifiedXmlToScreenConverter().Convert(File.ReadAllText("Main.screen.xml"));
var screen = result.Screen;
```

```typescript
import { HmiUnifiedXmlCatalog, HmiUnifiedXmlToScreenConverter } from "@jfk-solutions/base-hmi-types";

// Pass the exact bundled catalog XML when the asset is hosted at a custom URL.
const catalogXml = await HmiUnifiedXmlCatalog.loadV21(catalogUrl);
const result = await new HmiUnifiedXmlToScreenConverter(catalogXml).convert(screenXml);
const screen = result.screen;
```

The browser reader uses native `DOMParser` and `XMLSerializer`; it has no
third-party runtime dependency. Without the optional constructor argument, it
loads the packaged catalog through `HmiUnifiedXmlCatalog.loadV21()`.
The DOM library used by automated Node.js tests is a development dependency only.

The reader restores screens, buttons, text boxes and graphic views, including
catalog defaults, promoted or explicit font/padding parts, localized text,
colors and static appearance. Flattened screen items become one neutral layer.
Direct items and `screen-items` wrappers retain order; forward object references
reuse the same item instance. Explicit empty text overrides catalog templates.
JavaScript event bodies become inert text-script actions. Script dynamizations
on mapped properties retain their static values and explicit tag triggers.
Scripts are never executed. Other trigger modes, script settings and globals
remain in the original source XML with diagnostics.

The exact input XML is retained as UTF-8 `Screen.SourceData` / `screen.sourceData`;
each mapped item's source XML and effective scalar `SourceProperties` are also
retained. Unsupported controls, members, attributes and fields are diagnosed;
their original representations remain in source data. This reader does not
make those fields writable by the screen exporter or apply changes to TIA.
Unknown catalogs, unsupported archive profiles, malformed XML, DTDs, duplicate
IDs, dangling references, incompatible selectors and invalid mapped scalar
values fail explicitly. This is a model reader, not a full engineering archive
validator. XML input is limited to 16,777,216 characters; unusually deep or
oversized documents should be handled by hosts.

## Recipe HTML export

`HmiRecipeToHtmlConverter` renders an `HmiRecipe` as a standalone HTML document.
Fields also carry optional source element IDs, lexical defaults, decimal precision,
maximum length, tag array count, and required/unique/indexed flags. Stored records
carry an optional source number. The export displays these values without applying
defaults to missing records or treating unspecified flags as false.
Recipes and fields carry multilingual DisplayName and InfoText; records carry
DisplayName. `Convert(recipe, cultureLcid)` / `convert(recipe, cultureLcid)` selects
plain localized labels for HTML while retaining engineering names and record keys.
The one-argument export remains available. Formatted text payloads remain in the
model; this export displays plain text and does not apply their formatting.
It shows field metadata and stored records, retaining unmatched record keys and
distinguishing missing values, null values, and empty strings. Values are HTML
encoded and their persisted text is preserved. This export does not simulate
runtime recipe transfer or populate records that are absent from the model.

```csharp
var html = new BaseHmiTypes.Converters.Html.HmiRecipeToHtmlConverter().Convert(recipe);
```

```typescript
import { HmiRecipeToHtmlConverter } from "@jfk-solutions/base-hmi-types";
const html = new HmiRecipeToHtmlConverter().convert(recipe);
```

## Function trend preview

Function-trend controls use the shared trend HTML renderer in C# and TypeScript.
The XYPlot preview retains shared window, toolbar, status-bar, and appearance
settings. It displays configured numeric ranges, identifies missing ranges/data,
and omits generated time curves and time labels. Full function-trend data-source and scaling mapping
is still needed before the preview can display configured XY data.

Trend windows also carry an optional fractional SizeFactor and BackgroundColor in C# (sizeFactor and backgroundColor in TypeScript). Positive size factors determine relative area heights in HTML; classic integer SpacePortion remains the fallback. Each visible area applies its own configured background.

HmiTrendControlBase.XValueAxes (xValueAxes in TypeScript) carries independent numeric X axes for XY plots. The preview renders configured top/bottom axes with area ownership, visibility, color, range, divisions, precision and linear/logarithmic scaling. Automatic or missing ranges, unsupported scaling, and invalid logarithmic bounds are identified in the preview. Curve bindings and runtime data remain separate work.

Named Y axes retain DivisionCount and AutoScale in their HTML configuration.
The runtime uses configured divisions for linear, logarithmic and negative
logarithmic labels. Automatic or missing ranges, equal bounds, unsupported scaling
and invalid logarithmic bounds receive explicit messages. Associated per-pen axis
settings use ValueAxisDivisionCount and ValueAxisAutoScale; TypeScript mirrors
these properties in camel case.

Stored recipe arrays can be supplied through `HmiRecipeDataSet.SourceArrayValues` / `sourceArrayValues`: exact source keys mapped to ordered nullable member strings. Recipe HTML renders these independently of scalar values, preserving empty arrays and null/empty members. List positions represent storage order; PLC bounds and dimensions require separate source evidence.

Alarm, parameter and system-diagnostic columns expose independent `HeaderTextTrimming` / `headerTextTrimming` and `ContentTextTrimming` / `contentTextTrimming`. Screen HTML previews header modes 0 (no trimming) and 1 (character ellipsis); unknown modes preserve metadata and existing preview behavior. Body modes are retained while records are unloaded. Hidden columns/headings and inactive alarm views keep their configuration in metadata templates.


## Live alarm web components

The HTML converter emits static `<hmi-alarm-control>` and
`<hmi-alarm-line-control>` layouts, including configured columns, header visibility,
row height, colors and toolbar settings. It does not receive live alarm data.
The bundled web components accept detached `HmiAlarmDisplayData` snapshots through
`element.alarmData = data` or `element.setAlarmData(data)`. An empty row collection
clears the display. Message strings use text nodes, including when supplied by a PLC.

The host owns alarm state and transport. The component emits `hmi-alarm-select`
with `detail.keys` and `hmi-alarm-action` with `detail.action` and `detail.keys`;
it never reads tags or acknowledges a PLC itself. `refresh()` reapplies the last
snapshot after the host updates static layout or bound appearance properties.
The shared HTML component implementation is included in both C# and TypeScript output.

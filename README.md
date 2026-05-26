# BaseHmiTypes

BaseHmiTypes is a neutral HMI model assembly for Siemens visualization project readers and converters.
It intentionally does not use Siemens namespaces and contains only shared container types with minimal behavior.

The goal is that readers for systems such as WinCC Advanced, WinCC Professional, ProTool, WinCC flexible, TIA Portal exports, or future importers can all return the same object structure. Conversion code can then work against this common model instead of against every source format directly.

## Projects

- `src/BaseHmiTypes`: C# class library targeting `net8.0`.
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

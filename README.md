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

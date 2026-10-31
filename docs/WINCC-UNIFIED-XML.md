# WinCC Unified XML engineering interchange

BaseHmiTypes is the canonical home of this format. The [wire specification](WINCC-UNIFIED-XML.html) defines the shared schema, defaults, types, values, identities, ownership and verification. The namespace is `urn:s7mcp:wincc-unified:2`; its name does not restrict the format to S7Mcp.

## Required producer equivalence

Exporting the same saved screen through the TIA add-in and through a native TIA project reader must describe the same engineering semantics. Formatting, namespace prefixes, object IDs and omission of values equal to catalog defaults may differ. Controls, properties, ordered ownership, localized text, event bodies, shared globals, asynchronous execution, triggers, dynamizations, creation parameters and references must not differ. Unsaved TIA changes must be saved before comparing with an offline project reader.

BaseHmiTypes must represent those semantics in its object model. Both C# and TypeScript importers and exporters must operate on that model. Retaining the original XML for source inspection is useful, but returning that original XML is not an implementation of model export. Model edits must be reflected in exported XML.

Screen scope includes the screen and every owned control/part/event/dynamization. Project images, global tags, global script modules, connections and library definitions remain dependencies in the containing project. A standalone preview can show a named missing-resource placeholder; supplying that project can resolve the resource. A screen export is not a project backup.

## Export and completeness

Export returns XML and a separate list of warnings describing missing mappings. Unsupported but valid screen content must not prevent producing an inspection export. Malformed names, invalid XML characters or structurally invalid model input still require validation. A partial export must enumerate omissions and retain `complete="false"`; a complete exporter accounts for every semantic field in its declared scope. Changing this flag without implementing the missing data violates the format.

The target is complete export for all supported Unified screen/control types in both languages. Missing mappings are implementation defects, not a permanent reduced-model design. Native-source adapters must supply version-aware engineering values rather than inferring missing settings from rendered HTML. Preview coverage and engineering export coverage are independent.

## Conformance checks

1. Capture representative screens through the add-in and load the same saved project through the native reader.
2. Convert both through the full BaseHmiTypes model and export with the shared format definition.
3. Compare semantic graphs after resolving defaults and object references. Check every field and ordered collection; image names must agree even when bytes are project dependencies.
4. Import the native-reader export into an isolated TIA destination with the dependencies available. Re-export and compare the graph, including scripts, globals, async flags, triggers and dynamics.
5. Edit individual model fields before export to prove output is generated from the model. Cover nested groups, IO controls, faceplates, screen windows, shapes and language variants.
6. Report unsupported/provider-private fields explicitly. A successful parse, preview or import call alone does not establish completeness.

Implementation gaps and observed coverage are tracked separately in [the coverage assessment](UNIFIED-XML-COVERAGE.md).

## Script model

`HmiTextScriptAction.SourceCode/sourceCode` and `HmiScriptProperty.Script/script` hold the editable body when a callable signature is supplied. `FunctionName/functionName`, `ParameterNames/parameterNames`, `Async/async` and `GlobalDefinitionAreaScriptCode/globalDefinitionAreaScriptCode` retain independent engineering settings. A consumer assembles an executable function; the XML writer writes the body and shared definitions separately. Existing actions containing a complete executable source remain supported when these optional signature/definition fields are absent. Generated function names are host metadata, not additional script statements in the XML body.

`HmiScriptTrigger` retains Disabled, automatic tags, explicit tags, every fixed cycle and CustomCycle with its project cycle name in `CustomDuration/customDuration` and ordered tag names. Despite the SDK field name, `CustomDuration` is a project cycle name, not a duration literal. The SDK exposes an empty tag entry for modes other than explicit tags; automatic tag discovery belongs to the runtime and must not rewrite that engineering setting. Preserving these settings must not depend on whether a preview runtime currently executes that scheduling mode.


## Editable tag and resource bindings

`HmiUnifiedTagDynamization` is attached to the dynamic property alongside its preview fallback. `PropertyName`, `TagName`, `Address`, `DataType`, `PlcTag`, `ReadOnly` and `UseIndirectAddressing` describe the engineering link; `ResourceList` selects a resource-list binding. `ValueConverter.MappingTable` retains the condition type and ordered typed range/bitmask entries, including alternate/flashing values. UInt64 masks use `ulong` in C# and `bigint` in TypeScript; do not serialize them through imprecise JavaScript numbers. Owned input-behavior, font and padding bindings use the same model.

To export with a released selected catalog, construct `HmiScreenToUnifiedXmlConverter(catalogXml)` in either language and call `Convert/convert` with the edited screen and device name. Catalog XML is the immutable encoding contract, never the original screen export. The no-argument constructor uses the shared schema. See [implementation coverage](UNIFIED-XML-COVERAGE.md) for mapped controls, diagnostics and remaining native-source work.


## Compact model export

Scalar values are attributes: geometry, colors, flags, references, authorization names and property-event selectors. When a catalog declares an `attribute-map`, unshared scalar-only font, padding and content parts are promoted to prefixed attributes on their owner, for example `font-family="Arial"`, `font-size="14"` and `padding-left="4"`. A part with a binding, owned content or a shared identity remains an element. Ordered collections, localized text and multiline script bodies remain child elements; they are semantic data, not generic property/value wrappers.

Writers omit scalar values equal to the selected immutable catalog defaults and multilingual singleton parts equal to their complete catalog template. They omit IDs with no references and type selectors when the tag has one contract. Shared-object references and ambiguous typed contracts retain their selectors. This compaction must reproduce the same full engineering graph when expanded; a small document must not discard settings. Catalog IDs identify shared format defaults, not source-screen XML. Catalog definitions are never embedded in a screen export.

[This generated screen example](examples/compact-model.screen.xml) shows the actual writer output. Its geometry and appearance are attributes, its localized caption contains language/text attributes, and its event script is plain element text. Empty script globals can be necessary to override a nonempty catalog default. The archive's completeness flag describes implementation coverage, independently of compactness.

## Property events and PLC references

`HmiEventBinding.PropertyName/propertyName` distinguishes a property event from an ordinary control event. `EventName/eventName` holds `Change` or `QualityCodeChange`; the property name is a separate engineering path. The wire form is:

```xml
<property-event-handlers>
  <property-event-handler event-type="Change" property-name="Visible">
    <script>
      <global-definition-area-script-code />
      <script-code>Tags("Changed").Write(true);</script-code>
    </script>
  </property-event-handler>
</property-event-handlers>
```

Property event handlers are part of the shared schema. No separate catalog is selected when a screen has property events. C# and TypeScript accept optional explicit schema XML for controlled authoring tools and tests.

Native property-change and quality-change expandos are joined to the property's persisted dynamic key. Quality-code events apply to tag dynamizations. Script bodies, globals, async settings and qualified references use the same editable script model as ordinary events.

External PLC references come from the HMI tag's scoped soft link. The resolver matches the handle and owning consumer, retains the exact stored symbolic path (including arrays), and expands inherited structure-member paths. A disconnected target can still retain its saved path. A missing or ambiguous handle match is diagnosed instead of borrowing another consumer's path or inventing one from a GUID. These references are engineering metadata; exporting them does not read or write a PLC.


## TIA versions and shared contracts

There is one XML v2 wire format and one semantic model, not a separate XML language for each TIA release. Distinguish these version scopes:

| Scope | Meaning |
| --- | --- |
| Native project version | Chooses the saved-database reader. An original V17 database still needs its native reader. |
| Engineering API version | Identifies the API used by the producer/import adapter and its available features. |
| Configured HMI/Runtime version | Constrains device capabilities; it is separate from the project file version. |
| XML format version | Chooses our wire grammar; currently v2. |
| Catalog ID | Identifies immutable encoding rules and omitted-value defaults. It is not inherently tied to one TIA major version. |

The single definition is [`catalogs/unified/catalog.xml`](../catalogs/unified/catalog.xml). C#, TypeScript, the add-in and S7Mcp use the same descriptor. There are no per-TIA-major catalogs or loaders for superseded exported files. Old IDs are rejected; regenerate exports with the current producer. Native project-version adapters remain necessary and are independent of XML compatibility.

Omitted scalar values use **our stable format defaults**, never the destination TIA defaults or values from a sample project. False, zero and empty strings are the ordinary defaults; Visible/Enabled are true and Opacity is one. Enum defaults are declared explicitly. Text starts with an empty language collection, without captured project cultures. Native adapters must materialize actual Siemens values before export, including inherited/style/default values, so different Siemens defaults cannot silently alter the result.

`apiVersion` is optional producer provenance. A known value is retained; unknown native provenance is omitted. It does not choose the schema or prove that a native/import adapter exists for that release. Target adapters check actual capabilities: absent optional empty collections and absent optional read-only null metadata carry no feature to restore. A nonempty unsupported feature or a differing read-only value must be reported.

## Wire rules

- Root: `unified-export`, `version="2"`, current `catalog`, `scope="screen"` or `scope="device"`, device/name metadata, `coverage` and `complete`. Screen exports contain one `screen`; device authoring contains `software` with owned screen groups/screens/tag tables.
- Scalars are attributes with readable kebab-case names. Parts such as font and padding use prefixed owner attributes when they have no nested behavior or shared identity. Parts with dynamics remain children.
- Booleans are True/False. Numeric values use invariant culture and the declared type range. Colors are #RRGGBB or #RRGGBBAA. Enum values use declared symbolic names. Strings preserve whitespace and XML escaping.
- Multilingual text uses `text`/`display-name`/`tool-tip-text` with `multilingual-text-item lang="en-GB" text="..."`. Formatted caption markup is escaped text; an omitted text payload means the declared empty-string default. An explicit empty collection stays empty.
- Ordered compositions use child elements. `u:id` is needed only for a referenced object; `u:ref ref="..."` preserves sharing. `u:type` is needed only when a tag has multiple declared typed shapes, such as mapping-table values. Selectors use readable semantic names, such as `MappingTableEntryRange.Color`, `MappingTableEntryBitmask.Boolean` and `FaceplateInterface.String`; opaque numeric aliases such as `t5` are not used. Prefix `u` denotes `urn:s7mcp:wincc-unified:2:contract`.
- Script bodies and global definitions are child strings. Async state, event/property selectors and trigger settings are editable model values. XML-illegal script code units use an explicit typed UTF-16LE base64 payload; ordinary strings never silently replace illegal code units.
- Duplicate identities, dangling references, ambiguous selectors, invalid ranges and malformed XML are errors. Unknown semantic fields produce diagnostics; they are not a source-XML export fallback.
- The catalog contains type roles, typed property encodings, stable defaults, owned members, promoted-attribute maps and creation keys. Its ID is the SHA-256 of the normalized `types` subtree (namespace declarations removed, LINQ-to-XML DisableFormatting, UTF-8 without BOM). The manifest separately checks the whole XML bytes. This is a format fingerprint, not a Siemens version.

## Readable type selectors

The element name identifies an ordinary object, so a script needs no type attribute:

```xml
<script>
  <script-code>Tags("Start").Write(true);</script-code>
</script>
```

A faceplate interface can contain different value types even when their serialized text is identical. Here `u` is the contract namespace declared above:

```xml
<faceplate-interface u:type="FaceplateInterface.Int64" property-name="Count" value="42"/>
<faceplate-interface u:type="FaceplateInterface.String" property-name="Caption" value="42"/>
```

The first value is an integer and the second is a string. Their readable selectors preserve that distinction. C# and TypeScript emit no selector for a tag with one declared contract; a selector is required for a tag with multiple variants. Readers reject a missing, unknown or incompatible selector on an ambiguous tag. Declared contract IDs and internal part references use the same semantic names. A schema change updates the catalog fingerprint; superseded numeric aliases are not retained.

See the [generated compact example](examples/compact-model.screen.xml). The descriptor is the authoritative field-level reference; [coverage](UNIFIED-XML-COVERAGE.md) records implementation limits independently.

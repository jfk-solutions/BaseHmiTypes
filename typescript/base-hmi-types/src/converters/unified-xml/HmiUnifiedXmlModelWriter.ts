import { writeUnifiedText } from "./HmiUnifiedXmlText.js";
import { HmiMediaControl } from "../../screens/controls/HmiMediaControl.js";
import { HmiLayoutContainerBase } from "../../screens/base/HmiLayoutContainerBase.js";
import { HmiContainerBase } from "../../screens/base/HmiContainerBase.js";
import { HmiCustomWidgetContainer } from "../../screens/base/HmiCustomWidgetContainer.js";
import { HmiIOField } from "../../screens/widgets/HmiIOField.js";
import { HmiButtonType } from "../../screens/widgets/HmiButtonType.js";
import { unifiedCultureName } from "./HmiScreenToUnifiedXmlConverter.js";
import { HmiFont } from "../../screens/base/HmiFont.js";
import type { HmiUnifiedXmlExportResult, HmiUnifiedXmlDiagnostic } from "./HmiScreenToUnifiedXmlConverter.js";
import { HmiPropertyKind, HmiScriptLanguage } from "../../screens/base/HmiProperty.js";
import type { HmiUnifiedTagDynamization, HmiUnifiedMappingEntry } from "../../screens/base/HmiUnifiedTagDynamization.js";
import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiTextBox } from "../../screens/widgets/HmiTextBox.js";
import { HmiFaceplateContainer } from "../../screens/base/HmiFaceplateContainer.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiUnifiedEngineeringObject, HmiUnifiedEngineeringValue } from '../../screens/base/HmiUnifiedEngineeringObject.js';
import { HmiScreenModelBase } from '../../screens/base/HmiScreenModelBase.js';
const n = "urn:s7mcp:wincc-unified:2", u = n + ":contract";
const children = (e: Element) => Array.from(e.childNodes).filter((x): x is Element => x.nodeType === 1);
const entries = (e: Element, name: string) => children(e).filter(x => x.namespaceURI === u && x.localName === name);
const attr = (e: Element, name: string) => e.hasAttribute(name) ? e.getAttribute(name)! : undefined;
const rec = (v: object) => v as Record<string, unknown>;
const lower = (v: string) => v[0]!.toLowerCase() + v.slice(1);
const aliases: Record<string, string> = { ScreenNumber: "number", Left: "x", Top: "y", SelectionBackColor: "selectionBackgroundColor", SelectionForeColor: "selectionForegroundColor", BackColor: "backgroundColor", AlternateBackColor: "alternateBackgroundColor", ForeColor: "foregroundColor", AlternateForeColor: "alternateForegroundColor", BackFillPattern: "fillPattern", HorizontalTextAlignment: "horizontalAlignment", VerticalTextAlignment: "verticalAlignment", BackGraphicStretchMode: "graphicStretchMode", Screen: "screenName", StrikeOut: "strikethrough", Graphic: "image", AlternateGraphic: "alternateImage", BackGraphic: "backgroundImage", ScriptCode: "sourceCode", Tags: "tagNames", IOFieldType: "ioFieldType" };
const nativeName = (v: string) => Object.entries(aliases).find(([k, value]) => value === v)?.[0] ?? v[0]!.toUpperCase() + v.slice(1);
/** Writes editable model values against a selected immutable engineering contract. */
export class HmiUnifiedXmlModelWriter {
    private readonly catalog: Element;
    private readonly contracts: Element[];
    private readonly diagnostics: HmiUnifiedXmlDiagnostic[] = [];
    private readonly identities = new Map<object, string>();
    constructor(catalogXml: string, private readonly culture?: number) {
        if (catalogXml.length > 16 * 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(catalogXml))
            throw new Error("Invalid Unified catalog.");
        const doc = new DOMParser().parseFromString(catalogXml, "application/xml");
        this.catalog = doc.documentElement;
        if (this.catalog.namespaceURI !== u || this.catalog.localName !== "catalog" || !attr(this.catalog, "id") || doc.getElementsByTagName("parsererror").length)
            throw new Error("Invalid Unified catalog.");
        this.contracts = children(entries(this.catalog, "types")[0]!);
    }
    private report(path: string, message: string) { this.diagnostics.push({ path, message }); }
    convert(screen: HmiScreenBase, device: string): HmiUnifiedXmlExportResult {
        this.report("screen", "Engineering model export is not yet certified complete.");
        if(screen.kind !== "Screen") this.report("screen.kind", "Screen kind has no Unified XML mapping.");
        const doc = this.catalog.ownerDocument!.implementation.createDocument(n, "unified-export", null), root = doc.documentElement;
        root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:u", u);
        for (const [key, value] of Object.entries({ version: "2", ...(screen.engineeringApiVersion === undefined ? {} : {apiVersion: screen.engineeringApiVersion}), coverage: "exposed-openness-graph" }))
            root.setAttribute(key, value);
        if (screen.unifiedExportWarnings.length) {
            const warnings=doc.createElementNS(u, 'u:Warnings');
            for (const message of screen.unifiedExportWarnings) {
                const warning=doc.createElementNS(u, 'u:Warning');warning.textContent=message;warnings.appendChild(warning);this.report('screen',message);
            }
            root.appendChild(warnings);
        }
        const node = this.write(doc, screen, "screen", "screen");
        if (node)
            root.appendChild(node);
        const elements = Array.from(root.getElementsByTagName('*'));
        const referenced = new Set(elements.filter(e => e.namespaceURI === u && e.localName === 'ref').map(e => attr(e, 'ref')));
        for (const owner of elements.filter(e => e.hasAttributeNS(u, 'type'))) {
            const contract = this.contracts.find(c => attr(c, 'id') === owner.getAttributeNS(u, 'type'))!;
            for (const member of entries(contract, 'member').filter(m => entries(m, 'default-element').length)) {
                const child = children(owner).find(e => e.namespaceURI === n && e.localName === attr(member, 'xml'));
                const baseline = children(entries(member, 'default-element')[0]!)[0];
                if (!child || !baseline || [child, ...Array.from(child.getElementsByTagName('*'))].some(e => e.namespaceURI === u && e.localName === 'ref' || referenced.has(e.getAttributeNS(u, 'id') ?? undefined))) continue;
                const childContract = this.contracts.find(c => attr(c, 'id') === child.getAttributeNS(u, 'type'));
                if (!childContract || attr(childContract, 'name') !== 'Siemens.Engineering.MultilingualText') continue;
                const textShape = (e: Element): unknown => [e.namespaceURI, e.localName, Array.from(e.attributes).filter(a => a.namespaceURI !== 'http://www.w3.org/2000/xmlns/' && !(a.namespaceURI === u && ['id', 'type'].includes(a.localName))).map(a => [a.namespaceURI ?? '', a.localName, a.value]).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))), children(e).map(textShape)];
                if (JSON.stringify(textShape(child)) === JSON.stringify(textShape(baseline))) owner.removeChild(child);
            }
            for (const member of entries(contract, 'member').filter(m => attr(m, 'attribute-map') !== undefined)) {
                const child = children(owner).find(e => e.namespaceURI === n && e.localName === attr(member, 'xml'));
                if (!child || children(child).length || referenced.has(child.getAttributeNS(u, 'id') ?? undefined)) continue;
                const mappings = new Map(attr(member, 'attribute-map')!.split(' ').map(pair => pair.split('=') as [string, string]));
                const attributes = Array.from(child.attributes).filter(a => !a.namespaceURI);
                if (attributes.some(a => !mappings.has(a.localName))) continue;
                for (const attribute of attributes) owner.setAttribute(mappings.get(attribute.localName)!, attribute.value);
                owner.removeChild(child);
            }
        }
        for (const element of elements) {
            const id = element.getAttributeNS(u, 'id');
            if (id && !referenced.has(id)) element.removeAttributeNS(u, 'id');
            if (this.contracts.filter(c => attr(c, 'tag') === element.localName).length === 1) element.removeAttributeNS(u, 'type');
        }
        return { xml: '<?xml version="1.0" encoding="utf-8"?>\n' + prettyXml(root), complete: false, diagnostics: this.diagnostics };
    }
    private select(model: object, tag: string, path: string): Element | undefined {
        const identity = model instanceof HmiUnifiedEngineeringObject ? model : model instanceof HmiScreenModelBase ? model.unifiedEngineering : undefined;
        const candidates = this.contracts.filter(c => attr(c, "tag") === tag && (!identity || attr(c, 'name') === identity.typeName));
        const matching = candidates.filter(c => entries(c, "property").every(p => this.compatible(this.unwrap(get(model, attr(p, "name")!), path, false), entries(p, "value")[0]!)));
        if (matching.length === 1)
            return matching[0];
        if (matching.length > 1) {
            const shape = (source: Element) => { const clone = source.cloneNode(true) as Element; clone.removeAttribute('id'); for (const d of Array.from(clone.getElementsByTagNameNS(u, 'default')))
                d.parentNode!.removeChild(d); return new XMLSerializer().serializeToString(clone); };
            const first = shape(matching[0]!);
            if (matching.every(c => shape(c) === first) && matching.flatMap(c => entries(c, 'property')).filter(p => entries(p, 'default').length).every(p => this.unwrap(get(model, attr(p, 'name')!), path, false) !== undefined))
                return matching[0];
        }
        if (candidates.length === 1)
            return candidates[0];
        this.report(path, candidates.length === 0 ? `No selected catalog contract for ${tag}.` : `Ambiguous typed contract for ${tag}.`);
        return undefined;
    }
    private compatible(value: unknown, template: Element): boolean {
        if (value === undefined || value === null)
            return true;
        if (attr(template, "kind") === "null")
            return false;
        switch (attr(template, "type")) {
            case "System.Boolean": return typeof value === 'boolean';
            case "System.Drawing.Color": return !!value && typeof value === 'object' && 'red' in value;
            case "System.String": return typeof value === 'string';
            default: return true;
        }
    }
    private write(doc: Document, model: object, tag: string, path: string, schema?: Element): Element | undefined {
        schema ??= this.select(model, tag, path);
        if (!schema)
            return undefined;
        const previous = this.identities.get(model);
        if (previous) {
            const ref = doc.createElementNS(u, "u:ref");
            ref.setAttribute("ref", previous);
            return ref;
        }
        const id = `o${this.identities.size + 1}`;
        this.identities.set(model, id);
        const node = doc.createElementNS(n, tag);
        node.setAttributeNS(u, "u:id", id);
        node.setAttributeNS(u, "u:type", attr(schema, "id")!);
        for (const p of entries(schema, "property")) {
            const name = attr(p, "name")!, alias = attr(p, "xml")!, value = this.unwrap(get(model, name), `${path}.${name}`), template = entries(p, "value")[0]!;
            const supplied = model instanceof HmiUnifiedEngineeringObject ? model : model instanceof HmiScreenModelBase ? model.unifiedEngineering : undefined;
            if (value == null && supplied?.values[name] === null && (attr(template,'nullable') === 'true' || ['null','variant'].includes(attr(template,'kind')!))) {
                const child=doc.createElementNS(n,alias);child.appendChild(this.literal(doc,null));node.appendChild(child);continue;
            }
            if (value === undefined || value === null) {
                if (attr(p, "optional") !== "true" && !entries(p, "default").length && attr(template, "kind") !== "null")
                    this.report(`${path}.${name}`, "Required engineering value is absent.");
                continue;
            }
            try {
                if (attr(template, 'kind') === 'variant' || value instanceof HmiUnifiedEngineeringValue) {
                    const child = doc.createElementNS(n, alias); child.appendChild(this.literal(doc, value)); node.appendChild(child); continue;
                }
                const list = entries(p, 'items')[0];
                if (list && Array.isArray(value)) {
                    const target = attr(list, 'flattened') === 'true' ? node : doc.createElementNS(n, alias);
                    for (const name of value) {
                        const child = doc.createElementNS(n, attr(list, 'tag') ?? 'tag');
                        child.setAttribute('name', String(name));
                        target.appendChild(child);
                    }
                    if (target !== node)
                        node.appendChild(target);
                    continue;
                }
                const scalarType = attr(template, 'type');
                if ((scalarType?.endsWith('.HmiFontFamily') || scalarType?.endsWith('.HmiFontName')) && typeof value === 'string' && !['Arial', 'Siemens Sans', 'SiemensSans', 'Times New Roman', 'TimesNewRoman', 'SimSun'].includes(value))
                    this.report(path + '.' + name, 'The selected SDK font contract projects this native family to Arial; the model retains the native name.');
                let lexical = this.scalar(value, template);
                if(name === "ScriptCode" || name === "GlobalDefinitionAreaScriptCode")lexical=lexical.replace(/\r\n|\r/g,"\n");
                if(tag === "multilingual-text-item" && name === "Text") { writeUnifiedText(node, lexical); continue; }
                if (name !== "ScriptCode" && (name !== "Name" || !(model instanceof HmiScreenBase) && !(model instanceof HmiScreenItemBase)) && entries(p, "default")[0]?.textContent === lexical) continue;
                if (attr(p, "inline") === "true")
                    node.setAttribute(alias, lexical);
                else {
                    const child = doc.createElementNS(n, alias);
                    if(name === "ScriptCode" || name === "GlobalDefinitionAreaScriptCode")child.setAttributeNS("http://www.w3.org/XML/1998/namespace","xml:space","preserve");
                    child.textContent = lexical;
                    node.appendChild(child);
                }
            }
            catch (error) {
                this.report(`${path}.${name}`, String(error instanceof Error ? error.message : error));
            }
        }
        for (const m of entries(schema, "member")) {
            const name = attr(m, "name")!, alias = attr(m, "xml")!, nodes: Element[] = [];
            const engineering = model instanceof HmiUnifiedEngineeringObject ? model : model instanceof HmiScreenModelBase ? model.unifiedEngineering : undefined;
            if (attr(m, 'nullable') === 'true' && engineering && Object.hasOwn(engineering.values, name) && engineering.values[name] === null && get(model, name) == null) {
                const part = doc.createElementNS(n, alias); part.setAttributeNS(u, 'u:null', 'true'); node.appendChild(part); continue;
            }
            let values: object[];
            try {
                values = this.members(model, name, path);
            }
            catch (error) {
                this.report(`${path}.${name}`, String(error instanceof Error ? error.message : error));
                continue;
            }
            for (const value of values) {
                const part = attr(m, "attribute-type") ?? attr(m, "default-type");
                const declared = value instanceof HmiScreenItemBase || value instanceof HmiUnifiedEngineeringObject || name === 'Dynamizations' || name === 'Entries' ? undefined : attr(m, 'declared-type');
                const roleTag = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                const declaredCandidates = declared ? this.contracts.filter(c => attr(c, 'name') === declared && (attr(m, 'collection') === 'true' || attr(c, 'tag') === roleTag)) : [];
                const partSchema = part ? this.contracts.find(c => attr(c, "id") === part) : declaredCandidates.length === 1 ? declaredCandidates[0] : undefined;
                const child = this.write(doc, value, partSchema ? attr(partSchema, 'tag')! : this.tag(value, name), `${path}.${name}`, partSchema);
                if (child) {
                    if (attr(m, 'collection') === 'false' && child.namespaceURI === u && child.localName === 'ref') {
                        const owned = doc.createElementNS(n, alias); owned.setAttributeNS(u, 'u:owned-ref', 'true'); owned.setAttributeNS(u, 'u:ref', attr(child, 'ref')!); nodes.push(owned);
                    } else nodes.push(child);
                }
            }
            if (name === "ScreenItems" || attr(m, "item-tags") !== undefined || attr(m, "flattened") === "true" || attr(m, "attribute-type") !== undefined)
                for (const child of nodes)
                    node.appendChild(child);
            else if (nodes.length || name === "Items" || name === "Entries") {
                const wrapper = doc.createElementNS(n, alias);
                for (const child of nodes)
                    wrapper.appendChild(child);
                node.appendChild(wrapper);
            }
        }
        const mapped = new Set([...entries(schema, 'property'), ...entries(schema, 'member')].map(e => attr(e, 'name')!));
        const ignored = new Set(['id', 'hmiObjectType', 'sourceData', 'sourceProperties', 'sourceFormat', 'storageBusinessObject', 'handlerTag', 'kind', 'engineeringApiVersion', 'unifiedEngineering', 'unifiedExportWarnings']);
        if (mapped.has('ScreenItems'))
            ignored.add('layers');
        if ((mapped.has('EventHandlers') || mapped.has('PropertyEventHandlers')))
            ignored.add('events');
        if (mapped.has('ContainedType'))
            for (const field of ['faceplateName', 'faceplateVersion'])
                ignored.add(field);
        if (mapped.has('Content'))
            for (const field of ['mode', 'contentSpacing', 'contentSplitRatio', 'contentTextPosition', 'graphicStretchMode', 'horizontalAlignment', 'verticalAlignment', 'textTrimming'])
                ignored.add(field);
        if (mapped.has('Url') && model instanceof HmiMediaControl) ignored.add('source');
        if (mapped.has('Graphic')) {
            ignored.add('image');
            ignored.add('source');
        }
        if (mapped.has('AlternateGraphic'))
            ignored.add('alternateImage');
        if (mapped.has('BackGraphic'))
            ignored.add('backgroundImage');
        if (model instanceof HmiFont && model.localizedFonts.size <= 1) ignored.add('localizedFonts');
        if (mapped.has('Weight'))
            ignored.add('bold');
        if (mapped.has('Items') && model instanceof HmiMultilingualText) {
            for (const field of ['texts', 'formattedTexts', 'categoryTypeId', 'categorySubtype', 'sourceDefaultLanguageId'])
                ignored.add(field);
        }
        if (rec(model).kind === 'TextScript')
            for (const field of ['language', 'functionName', 'parameterNames'])
                ignored.add(field);
        const mappedFields = new Set([...mapped].flatMap(name => [lower(name),aliases[name] ?? lower(name)]));
        const engineeringData = model instanceof HmiUnifiedEngineeringObject ? model : model instanceof HmiScreenModelBase ? model.unifiedEngineering : undefined;
        for (const field of engineeringData?.unmappedProperties ?? []) this.report(`${path}.${field}`, 'Native engineering value has no supported conversion.');
        if (model instanceof HmiScreenModelBase && model.unifiedEngineering) return node;
        for (const [field, value] of Object.entries(model instanceof HmiUnifiedEngineeringObject ? model.values : model)) {
            if (value === undefined || value === null || Array.isArray(value) && value.length === 0 || value instanceof Map && value.size === 0 || ignored.has(field) || mappedFields.has(model instanceof HmiUnifiedEngineeringObject ? lower(field) : field))
                continue;
            this.report(`${path}.${field}`, 'Populated model field has no selected catalog mapping.');
        }
        return node;
    }
    private members(model: object, name: string, path: string): object[] {
        if (model instanceof HmiUnifiedEngineeringObject) { const value = model.values[name]; return value == null ? [] : Array.isArray(value) ? value : [value as object]; }
        if (name === 'ScreenItems' && model instanceof HmiScreenBase)
            return model.layers.flatMap(l => l.items);
        if (name === 'Dynamizations') {
            const bindings: object[] = [];
            for (const [field, raw] of Object.entries(model)) {
                if (model instanceof HmiIOField && field === 'text' && model.processValue !== undefined)
                    continue;
                if (!raw || typeof raw !== 'object')
                    continue;
                const value = rec(raw), settings = value.unifiedTagDynamization as HmiUnifiedTagDynamization | undefined;
                if (settings)
                    bindings.push({ propertyName: settings.propertyName ?? (model instanceof HmiMediaControl && field === "source" ? "Url" : nativeName(field)), dynamizationType: settings.resourceList !== undefined ? 'ResourceList' : 'Tag', tag: value.tagName ?? settings.tagName, resourceList: settings.resourceList, address: settings.address, dataType: settings.dataType, plcTag: settings.plcTag, readOnly: settings.readOnly, useIndirectAddressing: settings.useIndirectAddressing, valueConverter: settings.valueConverter });
                else if (value.kind === HmiPropertyKind.Script && value.language === HmiScriptLanguage.JavaScript)
                    bindings.push({ propertyName: model instanceof HmiMediaControl && field === 'source' ? 'Url' : nativeName(field), dynamizationType: 'Script', scriptCode: value.script, async: value.async, globalDefinitionAreaScriptCode: value.globalDefinitionAreaScriptCode, trigger: Array.isArray(value.triggers) && value.triggers.length === 1 ? value.triggers[0] : undefined });
            }
            return bindings;
        }
        if ((name === 'EventHandlers' || name === 'PropertyEventHandlers') && Array.isArray(rec(model).events))
            return (rec(model).events as Array<{
                eventName: string; propertyName?: string;
                action?: {
                    language?: HmiScriptLanguage;
                };
            }>).filter(e => (e.propertyName !== undefined) === (name === 'PropertyEventHandlers')).filter(e => e.action?.language === HmiScriptLanguage.JavaScript).map(e => ({ eventType: e.eventName, propertyName: e.propertyName, script: e.action, handlerTag: e.propertyName !== undefined ? 'property-event-handler' : model instanceof HmiScreenBase ? 'screen-event-handler' : this.eventTag(model) }));
        if (model instanceof HmiMultilingualText && name === 'Items')
            return [...new Set([...model.texts.keys(), ...model.formattedTexts.keys()])].filter(k => k !== 127).map(k => {
                const lcid = k <= 0 ? this.culture : k;
                if (!lcid)
                    throw new Error("Default language requires an explicit LCID.");
                const locale = unifiedCultureName(lcid);
                if (!locale)
                    throw new Error(`Unsupported language LCID ${lcid}.`);
                return { language: locale, text: model.formattedTexts.get(k) ?? model.texts.get(k) };
            });
        if (name === 'Content') {
            const source = model instanceof HmiScreenModelBase ? model.unifiedEngineering?.values.Content : undefined;
            const result = source instanceof HmiUnifiedEngineeringObject
                ? new HmiUnifiedEngineeringObject(source.typeName, source.tag)
                : new HmiUnifiedEngineeringObject('Siemens.Engineering.HmiUnified.UI.Parts.HmiContentPart', 'content');
            if (source instanceof HmiUnifiedEngineeringObject) Object.assign(result.values, source.values);
            for (const [field, property] of Object.entries({ ContentMode: 'Mode', GraphicStretchMode: 'GraphicStretchMode', HorizontalTextAlignment: 'HorizontalAlignment', VerticalTextAlignment: 'VerticalAlignment', TextTrimming: 'TextTrimming', Spacing: 'ContentSpacing', SplitRatio: 'ContentSplitRatio', TextPosition: 'ContentTextPosition' })) {
                const value = get(model, property); if (value != null) result.values[field] = value;
            }
            return [result];
        }
        const graph = model instanceof HmiScreenModelBase ? model.unifiedEngineering : undefined;
        const ownedValue = graph && !['Font','Padding','InputBehavior','Text','AlternateText','ToolTipText','DisplayName'].includes(name) && Object.hasOwn(graph.values,name) ? graph.values[name] : get(model,name);
        const value = this.unwrap(ownedValue, `${path}.${name}`);
        return value === undefined || value === null ? [] : Array.isArray(value) ? value : [value as object];
    }
    private tag(value: object, role: string): string {
        if (value instanceof HmiUnifiedEngineeringObject) return value.tag;
        if (value instanceof HmiScreenModelBase && value.unifiedEngineering) return value.unifiedEngineering.tag;
        if (value instanceof HmiScreenItemBase) {
            if (value instanceof HmiText || value instanceof HmiTextBox)
                return 'text-box';
            const className=value instanceof HmiCustomWidgetContainer?'HmiCustomWebControlContainer':value.constructor.name==='HmiToggleSwitch'?'HmiSwitch':value.constructor.name;
            const tags=[...new Set(this.contracts.filter(c=>attr(c,'name')?.endsWith('.'+className)).map(c=>attr(c,'tag')!))];
            if(tags.length===1)return tags[0]!;
            return value.constructor.name.slice(3).replace(/(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])/g, '-$1').toLowerCase().replace('io-field', 'iofield');
        }
        if (role === 'Entries')
            return (value as HmiUnifiedMappingEntry).rangeType !== undefined ? 'mapping-table-entry-range' : 'mapping-table-entry-bitmask';
        if (role === 'Dynamizations')
            return get(value, 'ResourceList') !== undefined ? 'resource-list-dynamization' : get(value, 'DynamizationType') === 'Script' ? 'script-dynamization' : 'tag-dynamization';
        if (role === 'EventHandlers' || role === 'PropertyEventHandlers')
            return get(value, 'HandlerTag') as string ?? 'button-event-handler';
        if (role === 'Items')
            return 'multilingual-text-item';
        return role.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase();
    }
    private eventTag(model: object): string {
        const nativeName = model instanceof HmiText || model instanceof HmiTextBox ? 'HmiText' : model.constructor.name;
        return this.contracts.filter(c => attr(c, 'name')?.endsWith('.' + nativeName + 'EventHandler')).map(c => attr(c, 'tag')!)[0] ?? 'button-event-handler';
    }
    private unwrap(value: unknown, path: string, report = true): unknown {
        if (value && typeof value === 'object' && 'tagNames' in value)
            return value;
        if (!value || typeof value !== 'object' || !('kind' in value) || !Object.values(HmiPropertyKind).includes(rec(value).kind as HmiPropertyKind))
            return value;
        const p = rec(value);
        if (p.kind === HmiPropertyKind.Default && p.styleValues && typeof p.profileName === 'string') {
            const resolved = rec(p.styleValues as object)[p.profileName];
            if(resolved === undefined && report) this.report(path, 'Style property has no resolved engineering value.');
            return resolved;
        }
        if (p.kind !== HmiPropertyKind.Static && p.kind !== HmiPropertyKind.Default && p.kind !== HmiPropertyKind.Script && !p.unifiedTagDynamization && report)
            this.report(path, 'Dynamic binding lacks engineering settings.');
        return p.staticValue;
    }
    private scalar(value: unknown, template: Element): string {
        if(typeof value === "string" && /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]|[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/u.test(value)) throw new Error("Invalid XML character.");
        const type = attr(template, 'type');
        if (type === 'System.Drawing.Color' && value && typeof value === 'object' && 'red' in value) {
            const c = value as {
                red: number;
                green: number;
                blue: number;
                alpha: number;
            };
            return '#' + [c.red, c.green, c.blue, ...(c.alpha === 255 ? [] : [c.alpha])].map(n => n.toString(16).padStart(2, '0').toUpperCase()).join('');
        }
        if (type === 'System.Boolean' && typeof value === 'boolean')
            return value ? 'True' : 'False';
        if (attr(template, 'kind') === 'enum') {
            if (type?.endsWith('.HmiContentMode') && typeof value === 'number')
                return HmiButtonType[value] ?? String(value);
            if ((type?.endsWith('.HmiFontFamily') || type?.endsWith('.HmiFontName')))
                return ({ 'Siemens Sans': 'SiemensSans', 'Times New Roman': 'TimesNewRoman' } as Record<string, string>)[String(value)] ?? (['Arial', 'SiemensSans', 'TimesNewRoman', 'SimSun'].includes(String(value)) ? String(value) : 'Arial');
            if (type?.endsWith('.HmiFontWeight') && typeof value === 'number') {
                const weight = ({ 0: 'None', 300: 'Light', 400: 'Normal', 600: 'SemiBold', 700: 'Bold' } as Record<number, string>)[value];
                if (!weight)
                    throw new Error('Unknown font weight.');
                return weight;
            }
            if (type?.endsWith('.HmiGraphicStretchMode') && typeof value === 'number' && value >= 0 && value <= 4)
                return ['None', 'Fill', 'Uniform', 'UniformToFill', 'Tiled'][value]!;
            if (type?.endsWith('.HmiTextWrapping') && typeof value === 'number' && value >= 0 && value <= 1)
                return value === 0 ? 'NoWrap' : 'WordWrap';
            if (type?.endsWith('.HmiTextTrimming') && typeof value === 'number' && value >= 0 && value <= 1)
                return value === 0 ? 'None' : 'CharacterEllipsis';
            return String(value);
        }
        if (!this.compatible(value, template))
            throw new Error('Value is incompatible with the selected typed contract.');
        if (type && ['System.Byte', 'System.Int16', 'System.UInt16', 'System.Int32', 'System.UInt32', 'System.UInt64'].includes(type)) {
            if (typeof value !== 'number' && typeof value !== 'bigint' || typeof value === 'number' && !Number.isSafeInteger(value))
                throw new Error('Fractional or imprecise engineering integer.');
            const limits: Record<string, [
                bigint,
                bigint
            ]> = { 'System.Byte': [0n, 255n], 'System.Int16': [-32768n, 32767n], 'System.UInt16': [0n, 65535n], 'System.Int32': [-2147483648n, 2147483647n], 'System.UInt32': [0n, 4294967295n], 'System.UInt64': [0n, 18446744073709551615n] };
            const [min, max] = limits[type]!, number = BigInt(value as number | bigint);
            if (number < min || number > max)
                throw new Error('Engineering integer is out of range.');
        }
        return String(value);
    }
    private literal(doc: Document, raw: unknown): Element {
        const exact = raw instanceof HmiUnifiedEngineeringValue ? raw : undefined, value = exact ? exact.value : raw;
        const kind = exact?.kind ?? (value == null ? 'null' : Array.isArray(value) ? 'array' : 'scalar');
        const node = doc.createElementNS(u, 'u:Value'); node.setAttribute('kind', kind);
        if (kind === 'null') return node;
        const type = exact?.typeName ?? (Array.isArray(value) ? 'System.Object[]' : typeof value === 'boolean' ? 'System.Boolean' : typeof value === 'bigint' ? 'System.Int64' : typeof value === 'number' ? 'System.Double' : typeof value === 'string' ? 'System.String' : undefined);
        if (!type) throw new Error('No lossless engineering value codec.');
        node.setAttribute('type', type);
        if (kind === 'array' || kind === 'string-list') { for (const entry of value as unknown[]) node.appendChild(this.literal(doc, entry)); return node; }
        if (type === 'System.String') { node.setAttribute('encoding', exact?.encoding ?? 'text'); node.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve'); }
        const template = doc.createElement('value'); template.setAttribute('type', type); template.setAttribute('kind', kind);
        node.textContent = this.scalar(value, template); return node;
    }
}
function get(model: object, name: string): unknown {
    if (model instanceof HmiUnifiedEngineeringObject) return model.values[name];
    if(name==='Url'&&model instanceof HmiMediaControl)return model.source;
    if(name==='ScreenItems'&&(model instanceof HmiContainerBase||model instanceof HmiLayoutContainerBase))return model.items;
    if(rec(model).kind==='Tag'&&'tagNames'in model&&name==='Type')return'Tags';
    if(rec(model).kind==='Tag'&&'tagNames'in model&&name==='CustomDuration')return'';
    if (name === 'Weight' && model instanceof HmiFont && model.weight === undefined && model.bold !== undefined)
        return model.bold.staticValue ? 700 : 400;
    if (name === 'ContainedType' && model instanceof HmiFaceplateContainer) {
        if (!model.faceplateName && model.faceplateVersion === undefined && model.unifiedEngineering && Object.hasOwn(model.unifiedEngineering.values,name)) return model.unifiedEngineering.values[name];
        return model.faceplateVersion === undefined ? model.faceplateName : `V${model.faceplateVersion}\\${model.faceplateName}`;
    }
    if (['Graphic', 'AlternateGraphic', 'BackGraphic'].includes(name)) {
        const raw = get(model, name === 'Graphic' ? 'Image' : name === 'AlternateGraphic' ? 'AlternateImage' : 'BackgroundImage') as {
            staticValue?: {
                imageName?: string;
            };
            imageName?: string;
        } | undefined;
        return raw?.staticValue?.imageName ?? raw?.imageName ?? (model instanceof HmiScreenModelBase && model.unifiedEngineering && Object.hasOwn(model.unifiedEngineering.values,name) ? model.unifiedEngineering.values[name] : name === 'Graphic' ? get(model, 'Source') : undefined);
    }
    const key = aliases[name] ?? lower(name);
    return rec(model)[lower(name)] ?? rec(model)[key] ?? rec(model)[name] ?? (model instanceof HmiScreenModelBase ? model.unifiedEngineering?.values[name] : undefined);
}

/** Indent structural XML without adding whitespace to text, script, or mixed content. */
function prettyXml(root: Element): string {
    const copy = root.cloneNode(true) as Element;
    function indent(node: Element, depth: number, preserve = false): void {
        const space = node.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'space');
        preserve = space === 'preserve' || preserve && space !== 'default';
        const nodes = Array.from(node.childNodes);
        const elements = nodes.filter((child): child is Element => child.nodeType === 1);
        if (node.namespaceURI === n && node.localName === 'multilingual-text-item' || preserve || !elements.length || nodes.some(child => child.nodeType !== 1)) return;
        for (const child of elements) {
            indent(child, depth + 1, preserve);
            node.insertBefore(node.ownerDocument!.createTextNode('\n' + '  '.repeat(depth + 1)), child);
        }
        node.appendChild(node.ownerDocument!.createTextNode('\n' + '  '.repeat(depth)));
    }
    indent(copy, 0);
    const xml = new XMLSerializer().serializeToString(copy);
    // Attribute line breaks require entities; text line feeds remain readable.
    let inTag = false, quote = '', result = '';
    for (const ch of xml) {
        if (inTag && quote) {
            result += ch === '\r' ? '&#xD;' : ch === '\n' ? '&#xA;' : ch === '\t' ? '&#x9;' : ch;
            if (ch === quote) quote = '';
        } else {
            result += ch === '\r' ? '&#xD;' : ch;
            if (ch === '<') inTag = true;
            else if (inTag && (ch === '"' || ch === "'")) quote = ch;
            else if (ch === '>') inTag = false;
        }
    }
    return result;
}

import { readUnifiedText, isFormattedTextAttribute } from "./HmiUnifiedXmlText.js";
import { HmiMediaControl } from "../../screens/controls/HmiMediaControl.js";
import { HmiLayoutContainerBase } from "../../screens/base/HmiLayoutContainerBase.js";
import { HmiContainerBase } from "../../screens/base/HmiContainerBase.js";
import type { HmiUnifiedTagDynamization, HmiUnifiedMappingTable, HmiUnifiedMappingEntry } from "../../screens/base/HmiUnifiedTagDynamization.js";
import { tagProperty } from "../../screens/base/HmiProperty.js";
import { unifiedControlConstructor } from "./HmiUnifiedControlConstructors.js";
import { HmiInputBehavior } from "../../screens/base/HmiUnifiedTagDynamization.js";
import { HmiScriptTriggerType, type HmiScriptTrigger } from "../../screens/base/HmiProperty.js";
import { HmiUnifiedXmlCatalog } from "./HmiUnifiedXmlCatalog.js";
import { HmiScreenToUnifiedXmlConverter, type HmiUnifiedXmlDiagnostic } from "./HmiScreenToUnifiedXmlConverter.js";
import { HmiScreen } from "../../screens/screen/HmiScreen.js";
import { HmiLayer } from "../../screens/base/HmiLayer.js";
import { HmiFont } from "../../screens/base/HmiFont.js";
import { HmiThickness } from "../../screens/base/HmiThickness.js";
import { HmiButton } from "../../screens/widgets/HmiButton.js";
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiGraphicView } from "../../screens/shapes/HmiGraphicView.js";
import { HmiRectangle } from "../../screens/shapes/HmiRectangle.js";
import { HmiFaceplateContainer } from "../../screens/base/HmiFaceplateContainer.js";
import { HmiScreenWindow } from "../../screens/screen/HmiScreenWindow.js";
import type { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { staticProperty } from "../../screens/base/HmiProperty.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiEventBinding } from "../../scripts/HmiEventBinding.js";
import { HmiTextScriptAction } from "../../scripts/HmiAction.js";
import { HmiScriptLanguage, scriptProperty, HmiTriggerKind, HmiTagTriggerMode } from "../../screens/base/HmiProperty.js";
import { HmiButtonType } from "../../screens/widgets/HmiButtonType.js";
import { HmiGradientDirection } from "../../screens/base/HmiGradientDirection.js";
import { HmiImageSourceKind } from "../../screens/base/HmiImageSource.js";
import { HmiFillPattern } from "../../screens/base/HmiFillPattern.js";
import { HmiUnifiedEngineeringObject, HmiUnifiedEngineeringValue } from '../../screens/base/HmiUnifiedEngineeringObject.js';

export interface HmiUnifiedXmlImportResult {
  readonly screen: HmiScreen;
  /** False when source engineering completeness is not independently certified; not an XML import gate. */
  readonly sourceComplete: boolean;
  readonly diagnostics: readonly HmiUnifiedXmlDiagnostic[];
}
const n = HmiScreenToUnifiedXmlConverter.namespace;
const u = HmiScreenToUnifiedXmlConverter.contractNamespace;
const children = (node: Element): Element[] => Array.from(node.childNodes).filter((e): e is Element => e.nodeType === 1);
const elements = (node: Element, ns: string, name: string): Element[] => children(node).filter(e => e.namespaceURI === ns && e.localName === name);
const attr = (node: Element, name: string): string | undefined => node?.hasAttribute(name) ? node.getAttribute(name)! : undefined;
const text = (node?: Element): string | undefined => node?.textContent ?? undefined;
const key = (node: Element, name: string): string | undefined => node.hasAttributeNS(u, name) ? node.getAttributeNS(u, name)! : undefined;
const record = (obj: object): Record<string, unknown> => obj as Record<string, unknown>;
const names: Record<string, string> = {
  "AcceptOnDeactivated": "acceptOnDeactivated", "AllowColumnReorder": "allowColumnReorder", "AllowColumnResize": "allowColumnResize", "AllowFilter": "allowFilter", "AllowSort": "allowSort", "AlternateLineColor": "alternateLineColor", "AutoPlay": "autoPlay", "AutoRange": "autoRange", "BeginValue": "beginValue", "CaptionColor": "captionColor", "ClearOnActivate": "clearOnActivate", "Color": "color", "DialLabelColor": "dialLabelColor", "DivisionCount": "divisionCount", "EndValue": "endValue", "Filter": "filter", "FlashingColor": "flashingColor", "GridLineColor": "gridLineColor", "HiddenInput": "hiddenInput", "HideDetails": "hideDetails", "HomeUrl": "homeUrl", "InteractiveZooming": "interactiveZooming", "IsAlternateState": "isAlternateState", "IsFlashingRequired": "isFlashingRequired", "Italic": "italic", "LabelColor": "labelColor", "LineColor": "lineColor", "MarkerColor": "markerColor", "MaximumWidth": "maximumWidth", "MinimumWidth": "minimumWidth", "OriginValue": "originValue", "ScreenName": "screenName", "SelectFullRow": "selectFullRow", "SelectionBorderColor": "selectionBorderColor", "ShowDate": "showDate", "ShowHours": "showHours", "ShowMinutes": "showMinutes", "ShowSeconds": "showSeconds", "ShowValue": "showValue", "Source": "source", "SubDivisionCount": "subDivisionCount", "SuppressFlashing": "suppressFlashing", "TabIntoWindow": "tabIntoWindow", "TickColor": "tickColor", "UncertainColor": "uncertainColor", "Underline": "underline", "Url": "url", "UseAlarmColors": "useAlarmColors", "Value": "value",
  Authorization: "authorization", RequireExplicitUnlock: "requireExplicitUnlock", CurrentQuality: "currentQuality",
  RotationCenterPlacement: "rotationCenterPlacement", ShowFocusVisual: "showFocusVisual", StyleItemClass: "styleItemClass",
  VisualizeQuality: "visualizeQuality", BackgroundFillMode: "backgroundFillMode",
  FillDirection: "fillDirection", FillLevel: "fillLevel", ShowFillLevel: "showFillLevel",
  HorizontalAlignment: "horizontalAlignment", VerticalAlignment: "verticalAlignment",
  ToolTipText: "toolTipText", AlternateText: "alternateText", AlternateForeColor: "alternateForegroundColor",
  ProcessValue: "processValue", IOFieldType: "ioFieldType", OutputFormat: "outputFormat", ResourceList: "resourceList", SelectedIndex: "selectedIndex",
  SelectionBackColor: "selectionBackgroundColor", SelectionForeColor: "selectionForegroundColor",
  Name: "name", Width: "width", Height: "height", ScreenNumber: "number", Left: "x", Top: "y", Enabled: "enabled", Visible: "visible",
  BackColor: "backgroundColor", AlternateBackColor: "alternateBackgroundColor", ForeColor: "foregroundColor", BorderColor: "borderColor",
  AlternateBorderColor: "alternateBorderColor", BorderWidth: "borderWidth", Opacity: "opacity", RotationAngle: "rotationAngle",
  RotationCenterX: "rotationCenterX", RotationCenterY: "rotationCenterY", TabIndex: "tabIndex", ReadOnly: "readOnly", Graphic: "source",
  HorizontalTextAlignment: "horizontalAlignment", VerticalTextAlignment: "verticalAlignment", BackFillPattern: "fillPattern", Screen: "screenName",
};
const scalarFields = new Set(["name", "number", "displayName"]);
function parse(xml: string): Element {
  if (xml.length > 16 * 1024 * 1024 || /<!DOCTYPE/i.test(xml)) throw new Error("Oversized XML and DTD declarations are unsupported.");
  if (typeof DOMParser === "undefined") throw new Error("Unified XML reading requires the browser DOMParser API.");
  const doc = new DOMParser().parseFromString(xml.replace(/^\uFEFF/, ""), "application/xml");
  if (!doc.documentElement || doc.getElementsByTagNameNS("*", "parsererror").length) throw new Error("Malformed XML.");
  return doc.documentElement;
}

/** Reads XML v2 screen archives with native browser XML and compression APIs. */
export class HmiUnifiedXmlToScreenConverter {
  private catalog?: Element;
  /** Supply catalog XML to avoid fetching the packaged gzip asset. */
  constructor(private readonly catalogXml?: string) {}

  /** Read individual exports or all screens in a software authoring document. Scripts stay inert. */
  async convertScreens(xml: string): Promise<readonly HmiUnifiedXmlImportResult[]> {
    const root = parse(xml);
    if (children(root).filter(e => e.namespaceURI === n).length === 1 && elements(root,n,"screen").length === 1) return [await this.convert(xml)];
    if (root.namespaceURI !== n || root.localName !== "unified-export" || attr(root, "version") !== "2"
      || children(root).length !== 1 || children(root)[0].localName !== "software" || children(root)[0].namespaceURI !== n)
      throw new Error("Expected a Unified XML v2 screen or software document.");
    const screens = Array.from(root.getElementsByTagNameNS(n, "screen"));
    if (!screens.length) throw new Error("The Unified XML document contains no screens.");
    const results: HmiUnifiedXmlImportResult[] = [];
    for (const screen of screens) {
      const envelope = root.cloneNode(false) as Element;
      const selected = screen.cloneNode(true) as Element;
      let ancestor: Element | null = screen;
      while (ancestor && !key(ancestor, "operation")) ancestor = ancestor.parentNode?.nodeType === 1 ? ancestor.parentNode as Element : null;
      const operation = ancestor ? key(ancestor, "operation") : undefined;
      if (operation) selected.setAttributeNS(u, "u:operation", operation);
      for (const warning of elements(root,u,"Warnings")) envelope.appendChild(warning.cloneNode(true));
      envelope.appendChild(selected);
      const result = await this.convert(new XMLSerializer().serializeToString(envelope));
      result.screen.sourceData = new TextEncoder().encode(xml);
      results.push(result);
    }
    return results;
  }

  async convert(xml: string): Promise<HmiUnifiedXmlImportResult> {
    const root = parse(xml);
    if (root.namespaceURI !== n || root.localName !== "unified-export" || attr(root, "version") !== "2" ||
      (attr(root,"apiVersion") !== undefined && !/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(attr(root,"apiVersion")!)))
      throw new Error("Expected a screen-scope Unified XML v2 archive with a valid engineering API version.");
    const roots = children(root).filter(e => e.namespaceURI !== u || e.localName !== "Warnings");
    if (roots.length !== 1 || roots[0].namespaceURI !== n || roots[0].localName !== "screen") throw new Error("Exactly one screen root is required.");
    const source = roots[0];
    if (!attr(source, "name")?.trim()) throw new Error("Screen name is required.");
    const ids = new Map<string, Element>();
    const all = Array.from(root.getElementsByTagName("*"));
    for (const node of all) {
      const id = key(node, "id");
      if (id !== undefined) { if (!id || ids.has(id)) throw new Error("Duplicate or empty object ID."); ids.set(id, node); }
    }
    for (const ref of all.filter(e => e.namespaceURI === u && e.localName === "ref"))
      if (!ids.has(attr(ref, "ref") ?? "")) throw new Error("Dangling object reference.");
    const catalog = this.catalog ?? parse(this.catalogXml ?? await HmiUnifiedXmlCatalog.load());
    if (catalog.namespaceURI !== u || catalog.localName !== "catalog") throw new Error("Invalid Unified catalog.");
    this.catalog = catalog;
    const context = new Context(catalog);
    const screen = new HmiScreen(); const apiVersion=attr(root,"apiVersion"); if(apiVersion!==undefined)screen.engineeringApiVersion=apiVersion; screen.sourceFormat = "WinCCUnifiedXmlV2"; screen.sourceData = new TextEncoder().encode(xml);
    screen.unifiedExportWarnings.push(...elements(root,u,"Warnings").flatMap(w => elements(w,u,"Warning").map(w => w.textContent ?? "")));
    for (const warning of screen.unifiedExportWarnings) context.report("screen",warning);
    context.map(source, screen, "screen");
    const layer = new HmiLayer(); layer.name = "Unified screen items"; screen.layers.push(layer);
    const nodes = children(source).flatMap(e => e.namespaceURI === n && e.localName === "screen-items" ? children(e) : [e])
      .filter(e => e.namespaceURI === u && e.localName === "ref" || context.controlType(e) !== undefined);
    const items = new Map<Element, HmiScreenItemBase>();
    for (const node of Array.from(source.getElementsByTagName("*")).filter(e => context.controlType(e) !== undefined)) {
      const ctor=context.controlType(node),item=ctor?new ctor():undefined;
      if (!item) { context.report("screen." + node.localName, "Unsupported control retained in screen sourceData."); continue; }
      items.set(node, item); item.sourceFormat = "WinCCUnifiedXmlV2";
      item.sourceData = new TextEncoder().encode(new XMLSerializer().serializeToString(node));
      context.map(node, item, "screen." + node.localName);
    }
    for (const [owner, model] of items) {
      if (!(model instanceof HmiContainerBase) && !(model instanceof HmiLayoutContainerBase)) continue;
      const nested = children(owner).flatMap(e => e.namespaceURI === n && e.localName === 'screen-items' ? children(e) : [e]).filter(e => e.namespaceURI === u && e.localName === 'ref' || context.controlType(e) !== undefined);
      for (const node of nested) {
        const target = node.namespaceURI === u && node.localName === 'ref' ? ids.get(attr(node, 'ref')!)! : node;
        const child = items.get(target);
        if (child) model.items.push(child); else context.report('screen.screen-items', 'Container child has no typed model.');
      }
    }
    for (const node of nodes) {
      const target = node.namespaceURI === u && node.localName === "ref" ? ids.get(attr(node, "ref")!)! : node;
      const item = items.get(target);
      if (item) layer.items.push(item); else context.report("screen.screen-items", "Reference or control cannot be represented; retained in screen sourceData.");
    }
    if (attr(root, "coverage") === "authored-objects") context.report("screen", "Authoring preview uses catalog defaults; existing target values and external project resources are unavailable.");
    return { screen, sourceComplete: false, diagnostics: context.diagnostics };
  }
}

class Context {
  private readonly engineering = new Map<Element, HmiUnifiedEngineeringObject>();
  readonly diagnostics: HmiUnifiedXmlDiagnostic[] = [];
  private readonly contracts: Map<string, Element>;
  constructor(catalog: Element) {
    const types = elements(catalog, u, "types");
    if (types.length !== 1) throw new Error("Missing catalog contracts.");
    this.contracts = new Map(children(types[0]).map(e => [attr(e, "id")!, e]));
  }
  report(path: string, message: string): void { this.diagnostics.push({ path, message }); }
  controlType(node:Element): (new()=>HmiScreenItemBase)|undefined {
    for(let parent=node.parentNode;parent;parent=parent.parentNode)
      if(parent.nodeType===1&&(parent as Element).namespaceURI===n&&(parent as Element).localName==='multilingual-text-item')return undefined;
    if(node.namespaceURI!==n||!this.hasContract(node))return undefined;
    const name=attr(this.contract(node),"name")?.split('.').at(-1);
    if(name==='HmiTextBox')return HmiText;
    return name?unifiedControlConstructor(name):undefined;
  }
  hasContract(node: Element): boolean {
    return key(node, "type") !== undefined || [...this.contracts.values()].filter(e => attr(e, "tag") === node.localName).length === 1;
  }
  private contract(node: Element): Element {
    if (node.namespaceURI !== n) throw new Error("Invalid object namespace.");
    const marker = key(node, "type");
    if (marker !== undefined) {
      const type = this.contracts.get(marker);
      if (!type || attr(type, "tag") !== node.localName) throw new Error("Unknown or incompatible contract selector.");
      return type;
    }
    const candidates = [...this.contracts.values()].filter(e => attr(e, "tag") === node.localName);
    if (candidates.length !== 1) throw new Error("Missing or ambiguous contract selector for " + node.localName);
    return candidates[0];
  }
  map(node: Element, model: HmiScreen | HmiScreenItemBase, path: string): void {
    model.unifiedEngineering = this.readEngineering(node);
    const contract = this.contract(node); model.id = key(node, "id");
    const operation = key(node, "operation");
    if (operation && !["create", "update", "upsert"].includes(operation)) throw new Error("Invalid authoring operation.");
    if (operation === "update" || operation === "upsert") this.report(path, "Partial authoring object: omitted values use preview defaults; the existing target is unavailable.");
    const allowed = new Set<string>();
    for (const property of elements(contract, u, "property")) {
      const name = attr(property, "name")!, alias = attr(property, "xml")!; allowed.add(alias);
      if(attr(node,alias)===undefined&&attr(elements(property,u,"default")[0],"kind")==="null")continue;
      const lexical = attr(node, alias) ?? text(elements(property, u, "default")[0]);
      if (lexical === undefined) {
        if (attr(property, "optional") !== "true" && attr(elements(property, u, "value")[0], "kind") !== "null") this.report(`${path}.${name}`, "Required value is absent and has no catalog default.");
        continue;
      }
      model.sourceProperties[name] = lexical;
      const value = decode(lexical, elements(property, u, "value")[0]);
      if (name === "ContainedType" && model instanceof HmiFaceplateContainer) {
        const match = /^V([^\\]+)\\(.+)$/.exec(lexical);
        model.faceplateName = match?.[2] ?? lexical; model.faceplateVersion = match?.[1];
        this.report(path, "Faceplate library definition requires an external project resource.");
        continue;
      }
      this.visual(model, name, value, `${path}.${name}`) || assign(model, names[name] ?? name[0]!.toLowerCase() + name.slice(1), value);
    }
    for (const member of elements(contract, u, "member")) {
      const name = attr(member, "name")!, alias = attr(member, "xml")!, mappings = attr(member, "attribute-map");
      if (elements(node, n, alias).some(e => key(e, 'null') === 'true')) continue;
      if (mappings !== undefined) {
        const childContract = this.contracts.get(attr(member, "attribute-type")!)!;
        const explicit = elements(node, n, alias).map(e => this.resolveOwned(e));
        if (explicit.length > 1) throw new Error("Duplicate singleton part.");
        const part = explicit[0] ?? node.ownerDocument!.createElementNS(n, alias);
        for (const pair of mappings.split(" ")) {
          const [child, owner] = pair.split("="); allowed.add(owner);
          const value = attr(node, owner);
          if (value !== undefined) { if (explicit.length) throw new Error("Conflicting promoted and explicit part."); part.setAttribute(child, value); }
        }
        this.part(part, childContract, model, name, path);
      } else if (["Font", "Padding", "Content", "InputBehavior"].includes(name) && elements(node, n, alias).length) {
        const part = this.resolveOwned(elements(node, n, alias)[0]!); this.part(part, this.contract(part), model, name, path);
      } else if (["Text", "AlternateText", "ToolTipText", "DisplayName"].includes(name)) {
        const explicit = elements(node, n, alias).map(e => this.resolveOwned(e));
        if (explicit.length > 1) throw new Error("Duplicate text singleton.");
        const defaults = elements(member, u, "default-element")[0];
        const textNode = explicit[0] ?? (defaults ? children(defaults)[0] : attr(member,"default-type") ? node.ownerDocument!.createElementNS(n,alias) : undefined);
        const target = name[0].toLowerCase() + name.slice(1);
        if (textNode && !assign(model, target, this.readText(textNode, `${path}.${name}`))) this.report(`${path}.${name}`, "Text has no neutral-model property.");
      }
    }
    if (model instanceof HmiFaceplateContainer) {
      const supplied = new Set<string>();
      for (const wrapper of elements(node, n, "interface")) for (const entry of elements(wrapper, n, "faceplate-interface")) {
        const contract = this.contract(entry), name = attr(entry, "property-name");
        if (!name?.trim() || supplied.has(name)) throw new Error("Missing or duplicate faceplate interface property name.");
        supplied.add(name);
        const property = elements(contract, u, "property").find(property => attr(property, "name") === "Value");
        if (!property) throw new Error("Missing faceplate interface value contract.");
        const lexical = attr(entry, "value") ?? text(elements(property, u, "default")[0]);
        if (lexical === undefined) throw new Error("Missing faceplate interface value.");
        model.interfaceValues.push({ name, value: decode(lexical, elements(property, u, "value")[0]) });
      }
    }
    for (const attribute of Array.from(node.attributes))
      if (attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/" && !(attribute.namespaceURI === u && ["id", "type", "operation"].includes(attribute.localName)) &&
        (attribute.namespaceURI || !allowed.has(attribute.localName))) this.report(`${path}.@${attribute.name}`, "Unknown attribute retained in sourceData.");
    for (const wrapper of [...elements(node, n, "event-handlers"), ...elements(node, n, "property-event-handlers")]) for (const handler of children(wrapper)) {
      if (handler.namespaceURI !== n || !handler.localName.endsWith("event-handler")) { this.report(`${path}.events`, "Unsupported event retained in sourceData."); continue; }
      this.contract(handler);
      const script = elements(handler, n, "script")[0], eventName = attr(handler, "event-type");
      const code = script ? elements(script, n, "script-code")[0] : undefined;
      if (!code || eventName === undefined) { this.report(`${path}.events`, "Event has no readable script or event type."); continue; }
      this.contract(script);
      const event = new HmiEventBinding(), action = new HmiTextScriptAction();
      event.eventName = eventName; const propertyName = attr(handler, "property-name"); if(propertyName !== undefined) event.propertyName = propertyName; action.language = HmiScriptLanguage.JavaScript; action.sourceCode = readCode(code); event.action = action;
      const scriptContract = this.contract(script!);
      const scriptProperties = elements(scriptContract, u, "property");
      const globals = elements(script!, n, "global-definition-area-script-code")[0];
      const globalDefault = scriptProperties.find(p => attr(p, "name") === "GlobalDefinitionAreaScriptCode");
      action.globalDefinitionAreaScriptCode = globals ? readCode(globals) : text(globalDefault ? elements(globalDefault, u, "default")[0] : undefined);
      const asyncDefault = scriptProperties.find(p => attr(p, "name") === "Async");
      const asyncValue = attr(script!, "async") ?? text(asyncDefault ? elements(asyncDefault, u, "default")[0] : undefined);
      if (asyncValue !== undefined) action.async = decodeBoolean(asyncValue);
      model.events.push(event);
    }
    const dynamized = new Set<string>();
    for (const wrapper of elements(node, n, "dynamizations")) for (const dynamic of children(wrapper)) {
      if(dynamic.namespaceURI===n&&['tag-dynamization','resource-list-dynamization'].includes(dynamic.localName)){
        this.readTagDynamization(dynamic,model,path);continue;
      }
      if (dynamic.namespaceURI !== n || dynamic.localName !== "script-dynamization") { this.report(`${path}.dynamizations`, "Unsupported dynamization retained in sourceData."); continue; }
      this.contract(dynamic);
      const name = attr(dynamic, "property-name");
      if (name === undefined || dynamized.has(name)) throw new Error("Missing or duplicate dynamized property name.");
      dynamized.add(name);
      const target = name === "Url" && model instanceof HmiMediaControl ? "source" : name === "Text" ? "text" : names[name], code = elements(dynamic, n, "script-code")[0];
      if (!target || !(target in model) || scalarFields.has(target) || !code) { this.report(`${path}.dynamizations.${name}`, "Unmapped script dynamization retained in sourceData."); continue; }
      const previous = record(model)[target] as { staticValue?: unknown } | undefined;
      const property = scriptProperty(readCode(code), HmiScriptLanguage.JavaScript, previous?.staticValue);
      const scriptContract = this.contract(dynamic);
      const settings = elements(scriptContract, u, "property");
      const globals = elements(dynamic, n, "global-definition-area-script-code")[0];
      const defaultGlobal = settings.find(p => attr(p, "name") === "GlobalDefinitionAreaScriptCode");
      property.globalDefinitionAreaScriptCode = globals ? readCode(globals) : text(defaultGlobal ? elements(defaultGlobal, u, "default")[0] : undefined);
      const defaultAsync = settings.find(p => attr(p, "name") === "Async");
      const asyncValue = attr(dynamic, "async") ?? text(defaultAsync ? elements(defaultAsync, u, "default")[0] : undefined);
      if (asyncValue !== undefined) property.async = decodeBoolean(asyncValue);
      const trigger = elements(dynamic, n, "trigger")[0];
      if (trigger) this.contract(trigger);
      if (trigger) {
        const type = attr(trigger, "type");
        if (!Object.values(HmiScriptTriggerType).includes(type as HmiScriptTriggerType)) throw new Error("Invalid script trigger type.");
        property.triggers.push({ kind: HmiTriggerKind.Script, type: type as HmiScriptTriggerType,
          customDuration: attr(trigger, "custom-duration") ?? "",
          tagNames: elements(trigger, n, "tag").map(e => { const name = attr(e, "name"); if (name === undefined) throw new Error("Missing trigger tag name."); return name; }),
        } as HmiScriptTrigger);
      }
      record(model)[target] = property;
      this.report(`${path}.dynamizations.${name}`, "Script and tag triggers mapped; other engineering settings remain in sourceData.");
    }
    const handled = new Set(["font", "padding", "content", "input-behavior", "display-name", "text", "alternate-text", "tool-tip-text", "event-handlers", "property-event-handlers", "dynamizations"]);
    if (model instanceof HmiScreen) handled.add("screen-items");
    for (const child of children(node))
      if (!(child.namespaceURI === u && child.localName === "ref") && (child.namespaceURI !== n || !handled.has(child.localName)&&this.controlType(child)===undefined))
        this.report(`${path}.${child.localName}`, "Unsupported member retained in sourceData.");
  }
  private readEngineering(input: Element): HmiUnifiedEngineeringObject {
    const node = this.resolveOwned(input);
    const previous = this.engineering.get(node); if (previous) return previous;
    const contract = this.contract(node), result = new HmiUnifiedEngineeringObject(attr(contract, 'name')!, attr(contract, 'tag')!);
    this.engineering.set(node, result);
    for (const property of elements(contract, u, 'property')) {
      const name = attr(property, 'name')!, alias = attr(property, 'xml')!, template = elements(property, u, 'value')[0]!;
      const part = elements(node, n, alias)[0], literal = part ? elements(part, u, 'Value')[0] : undefined;
      if (literal) { result.values[name] = this.readLiteral(literal); continue; }
      const list = elements(property, u, 'items')[0];
      if (list) {
        const entries = attr(list, 'flattened') === 'true' ? elements(node, n, attr(list, 'tag')!) : part ? elements(part, n, attr(list, 'tag')!) : [];
        result.values[name] = entries.map(e => attr(e, 'name') ?? text(e) ?? ''); continue;
      }
      const baseline = elements(property, u, 'default')[0];
      if (node.localName === 'multilingual-text-item' && name === 'Text') { result.values[name] = readUnifiedText(node); continue; }
      const lexical = attr(node, alias) ?? (part ? text(part) : text(baseline));
      if (attr(baseline, 'kind') === 'null' && attr(node, alias) === undefined && !part) result.values[name] = null;
      else if (lexical !== undefined && attr(template, 'kind') !== 'variant') {
        try { result.values[name] = attr(template, 'kind') === 'language' ? lexical : decode(lexical, template); }
        catch (error) { throw new Error('Invalid engineering property ' + result.typeName + '.' + name, {cause:error}); }
      }
    }
    for (const member of elements(contract, u, 'member')) {
      const name = attr(member, 'name')!, alias = attr(member, 'xml')!;
      const direct = elements(node, n, alias);
      if (direct.some(e => key(e, 'null') === 'true')) { result.values[name] = null; continue; }
      let owned = name === 'ScreenItems' ? children(node).filter(e => e.namespaceURI === u && e.localName === 'ref' || this.controlType(e) !== undefined)
        : attr(member, 'item-tags') ? children(node).filter(e => e.namespaceURI === n && attr(member, 'item-tags')!.split(' ').includes(e.localName))
        : attr(member, 'flattened') === 'true' ? direct : direct.flatMap(children);
      if (!owned.length && attr(member, 'attribute-type')) {
        const schema = this.contracts.get(attr(member, 'attribute-type')!)!;
        const part = node.ownerDocument!.createElementNS(n, attr(schema, 'tag')!); part.setAttributeNS(u, 'u:type', attr(schema, 'id')!);
        for (const pair of (attr(member, 'attribute-map') ?? '').split(' ').filter(Boolean)) { const [field, owner] = pair.split('='); const value = attr(node, owner!); if (value !== undefined) part.setAttribute(field!, value); }
        owned = [part];
      }
      if (!owned.length && attr(member, 'default-type')) {
        const schema = this.contracts.get(attr(member, 'default-type')!)!, part = node.ownerDocument!.createElementNS(n, attr(schema, 'tag')!);
        part.setAttributeNS(u, 'u:type', attr(schema, 'id')!); owned = [part];
      }
      if (!owned.length) { const defaults = elements(member, u, 'default-element')[0]; if (defaults) owned = children(defaults).map(e => e.cloneNode(true) as Element); }
      const values = owned.map(child => this.readEngineering(child));
      if (attr(member, 'collection') === 'true') result.values[name] = values;
      else if (values.length === 1) result.values[name] = values[0];
    }
    return result;
  }
  private resolveOwned(input: Element): Element {
    const root = input.ownerDocument!.documentElement;
    return input.namespaceURI === u && input.localName === 'ref' || key(input, 'owned-ref') === 'true'
      ? [root, ...Array.from(root.getElementsByTagName('*'))].find(e => key(e, 'id') === (attr(input, 'ref') ?? key(input, 'ref'))) ?? (() => { throw new Error('Dangling engineering reference.'); })() : input;
  }
  private readLiteral(node: Element): HmiUnifiedEngineeringValue {
    const kind = attr(node, 'kind')!, type = attr(node, 'type');
    const value = kind === 'null' ? null : kind === 'array' || kind === 'string-list' ? elements(node, u, 'Value').map(e => this.readLiteral(e))
      : attr(node, 'encoding') === 'utf16le-base64' ? text(node) : decode(text(node) ?? '', node);
    return new HmiUnifiedEngineeringValue(kind, type, value, attr(node, 'encoding'));
  }
  private readTagDynamization(node:Element,model:object,path:string):void {
    this.contract(node);
    const name=attr(node,'property-name');if(name===undefined)throw new Error('Missing dynamized property name.');
    const target=name==="Url"&&model instanceof HmiMediaControl?"source":names[name]??name[0]!.toLowerCase()+name.slice(1);
    if(!(target in model)||scalarFields.has(target)){this.report(`${path}.dynamizations.${name}`,'No typed model target for dynamization.');return;}
    const settings:HmiUnifiedTagDynamization={propertyName:name};
    const readProperties=(source:Element,destination:object)=>{
      for(const p of elements(this.contract(source),u,'property')){
        if(attr(source,attr(p,'xml')!)===undefined&&attr(elements(p,u,'default')[0],'kind')==='null')continue;
        const field=attr(p,'name')!,lexical=attr(source,attr(p,'xml')!)??text(elements(p,u,'default')[0]);
        if(lexical===undefined)continue;
        if(destination===settings&&field==='Tag')settings.tagName=lexical;
        else if(!['PropertyName','DynamizationType'].includes(field))record(destination)[field[0]!.toLowerCase()+field.slice(1)]=decode(lexical,elements(p,u,'value')[0]);
      }
    };
    readProperties(node,settings);
    if(node.localName==='resource-list-dynamization')settings.resourceList??='';
    const converter=elements(node,n,'value-converter')[0];
    if(converter){
      this.contract(converter);settings.valueConverter={};
      const table=elements(converter,n,'mapping-table')[0];
      if(table){
        const mapping:HmiUnifiedMappingTable={entries:[]};settings.valueConverter.mappingTable=mapping;readProperties(table,mapping);
        for(const wrapper of elements(table,n,'entries'))for(const entry of children(wrapper)){
          if(entry.namespaceURI!==n||!['mapping-table-entry-range','mapping-table-entry-bitmask'].includes(entry.localName))throw new Error('Invalid mapping-table entry.');
          const value:HmiUnifiedMappingEntry={};readProperties(entry,value);mapping.entries.push(value);
        }
      }
    }
    const previous=record(model)[target] as {staticValue?:unknown}|undefined;
    const property=tagProperty(settings.tagName??'',previous?.staticValue);property.unifiedTagDynamization=settings;record(model)[target]=property;
  }
  private visual(model: HmiScreen | HmiScreenItemBase, name: string, value: unknown, path: string): boolean {
    if (name === "Url" && model instanceof HmiMediaControl) return assign(model, "source", value);
    if (name === "BackFillPattern") return assign(model, "fillPattern", value);
    if (name === "BackGraphic" && model instanceof HmiScreen) {
      if (String(value)) model.backgroundImage = { kind: HmiImageSourceKind.Uri, imageName: String(value) };
      return true;
    }
    if ((name === "Graphic" || name === "AlternateGraphic") && (model instanceof HmiButton || model instanceof HmiGraphicView)) {
      const reference = String(value);
      if (reference) {
        const target = name === "Graphic" ? "image" : "alternateImage";
        record(model)[target] = staticProperty({ kind: HmiImageSourceKind.Uri, imageName: reference });
        this.report(path, "Graphic reference mapped; image data is external and must be supplied by the project.");
      }
      if (name === "Graphic" && model instanceof HmiGraphicView) model.source = staticProperty(reference);
      return true;
    }
    if (model instanceof HmiButton && ["Spacing", "SplitRatio", "TextPosition"].includes(name))
      return assign(model, "content" + name, value);
    if (name === "ContentMode" && model instanceof HmiButton && typeof value === "string" && value in HmiButtonType) {
      model.mode = staticProperty(HmiButtonType[value as keyof typeof HmiButtonType]); return true;
    }
    if ((name === "GraphicStretchMode" || name === "BackGraphicStretchMode") && (model instanceof HmiScreen || model instanceof HmiButton || model instanceof HmiGraphicView)) {
      const modes: Record<string, number> = { None: 0, Fill: 1, Uniform: 2, UniformToFill: 3, Tiled: 4 };
      if (typeof value === "string" && Object.hasOwn(modes, value)) { model.graphicStretchMode = staticProperty(modes[value]); return true; }
    }
    if (name === "TextWrapping" || name === "TextTrimming") {
      const modes: Record<string, number> = name === "TextWrapping" ? { NoWrap: 0, WordWrap: 1 } : { None: 0, CharacterEllipsis: 1 };
      if (typeof value === "string" && Object.hasOwn(modes, value)) return assign(model, name === "TextWrapping" ? "textWrapping" : "textTrimming", modes[value]);
    }
    if (name === "HorizontalTextAlignment" || name === "VerticalTextAlignment") return assign(model, names[name], value);
    return false;
  }
  private part(node: Element, contract: Element, owner: HmiScreen | HmiScreenItemBase, role: string, path: string): void {
    if (key(node, "type") !== undefined && key(node, "type") !== attr(contract, "id")) throw new Error("Incompatible part contract selector.");
    const part = role === "Font" ? new HmiFont() : role === "Padding" ? new HmiThickness() : role === "InputBehavior" ? new HmiInputBehavior() : undefined;
    const allowed = new Set(elements(contract, u, "property").map(p => attr(p, "xml")!));
    for (const property of elements(contract, u, "property")) {
      const name = attr(property, "name")!, lexical = attr(node, attr(property, "xml")!) ?? text(elements(property, u, "default")[0]);
      if (lexical === undefined) { this.report(`${path}.${role}.${name}`, "Required part value is absent and has no catalog default."); continue; }
      owner.sourceProperties[`${role}.${name}`] = lexical;
      let value = decode(lexical, elements(property, u, "value")[0]);
      let target = name === "StrikeOut" ? "strikethrough" : name[0].toLowerCase() + name.slice(1);
      if (role === "Font" && name === "Weight") {
        if (lexical === "Bold" || lexical === "Normal") { target = "bold"; value = lexical === "Bold"; }
        else if (["Light", "SemiBold", "None"].includes(lexical)) { target = "weight"; value = lexical === "Light" ? 300 : lexical === "SemiBold" ? 600 : 0; }
      }
      if (!(role === "Content" && this.visual(owner, name, value, `${path}.${role}.${name}`)) && (!part || !assign(part, target, value, false))) this.report(`${path}.${role}.${name}`, "Part field retained in sourceProperties.");
    }
    const target = role[0].toLowerCase() + role.slice(1);
    if (part && target in owner) record(owner)[target] = part;
    for(const wrapper of elements(node,n,'dynamizations'))for(const dynamic of children(wrapper))
      if(dynamic.namespaceURI===n&&['tag-dynamization','resource-list-dynamization'].includes(dynamic.localName))this.readTagDynamization(dynamic,part??owner,`${path}.${role}`);
    for (const attribute of Array.from(node.attributes))
      if (attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/" && !(attribute.namespaceURI === u && ["id", "type", "operation"].includes(attribute.localName)) &&
        (attribute.namespaceURI || !allowed.has(attribute.localName))) this.report(`${path}.${role}.@${attribute.name}`, "Unknown part attribute retained in sourceData.");
    for (const child of children(node).filter(child=>child.namespaceURI!==n||child.localName!=="dynamizations")) this.report(`${path}.${role}.${child.localName}`, "Part member retained in sourceData.");
  }
  private readText(node: Element, path: string): HmiMultilingualText {
    this.contract(node);
    const result = new HmiMultilingualText();
    for (const child of children(node)) {
      if (child.namespaceURI !== n || child.localName !== "multilingual-text-item") { this.report(path, "Unsupported text member retained in sourceData."); continue; }
      this.contract(child);
      for (const attribute of Array.from(child.attributes))
        if (attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/" && !(attribute.namespaceURI === u && ["id", "type", "operation"].includes(attribute.localName)) &&
          (attribute.namespaceURI || !["lang", "text"].includes(attribute.localName)) && !isFormattedTextAttribute(attribute)) this.report(`${path}.@${attribute.name}`, "Unknown localized-text attribute retained in sourceData.");
      const language = attr(child, "lang"), value = readUnifiedText(child);
      if (language === undefined) throw new Error("Missing text language.");
      const lcid = cultureId(language);
      if (lcid === undefined) { this.report(path, `Unsupported language ${language}; retained in sourceData.`); continue; }
      if (result.texts.has(lcid)) throw new Error("Duplicate text language.");
      result.texts.set(lcid, value); if (value.startsWith("<body")) result.formattedTexts.set(lcid, value);
    }
    return result;
  }
}
function readCode(node: Element): string {
  if (!children(node).length) return (text(node) ?? "").replace(/\r\n|\r/g,"\n").replaceAll("\n","\r\n");
  const value = elements(node, u, "Value")[0];
  if (children(node).length !== 1 || !value || children(value).length || attr(value, "kind") !== "scalar" || attr(value, "type") !== "System.String") throw new Error("Unsupported script payload.");
  if (attr(value, "encoding") === "text") return (text(value) ?? "").replace(/\r\n|\r/g,"\n").replaceAll("\n","\r\n");
  if (attr(value, "encoding") !== "utf16le-base64") throw new Error("Unsupported script string encoding.");
  const bytes = atob(text(value) ?? "");
  if (bytes.length % 2) throw new Error("Invalid UTF-16 script payload.");
  const units: string[] = [];
  for (let i = 0; i < bytes.length; i += 2) units.push(String.fromCharCode(bytes.charCodeAt(i) | bytes.charCodeAt(i + 1) << 8));
  return units.join("");
}
function assign(model: object, target: string, value: unknown, scalar = true): boolean {
  if (!(target in model)) return false;
  if (["horizontalAlignment", "verticalAlignment", "fillPattern"].includes(target) && typeof value === "string") {
    const allowed = target === "horizontalAlignment" ? ["Left", "Center", "Right", "Stretch"] : target === "verticalAlignment" ? ["Top", "Center", "Bottom", "Stretch"] : Object.values(HmiFillPattern) as string[];
    if (!allowed.includes(value)) return false;
  }
  if (target === "bold" && typeof value !== "boolean") return false;
  record(model)[target] = scalar && scalarFields.has(target) ? value : staticProperty(value); return true;
}
function decode(lexical: string, template: Element): unknown {
  const type = attr(template, "type");
  if (attr(template, "kind") === "enum" || ["System.String", "System.DateTime", "System.TimeSpan", "System.Guid", "System.Decimal", "System.Char", "System.Byte[]"].includes(type ?? "")) return lexical;
  if (type === "System.Boolean") return decodeBoolean(lexical);
  if (type === "System.Drawing.Color") {
    return decodeColor(lexical);
  }
  if (type === "System.Single" || type === "System.Double") {
    if (!["NaN", "Infinity", "-Infinity"].includes(lexical) && !/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/.test(lexical)) throw new Error("Invalid floating-point value.");
    return type === "System.Single" ? Math.fround(Number(lexical)) : Number(lexical);
  }
  if(type==='System.UInt64'||type==='System.Int64'){
    if(!/^-?[0-9]+$/.test(lexical))throw new Error('Invalid typed integer.');
    const value=BigInt(lexical),min=type==='System.UInt64'?0n:-9223372036854775808n,max=type==='System.UInt64'?18446744073709551615n:9223372036854775807n;
    if(value<min||value>max)throw new Error('Typed integer out of range.');return value;
  }
  const ranges: Record<string, [number, number]> = { "System.UInt32": [0, 4294967295], "System.UInt16": [0, 65535], "System.Int32": [-2147483648, 2147483647], "System.Int16": [-32768, 32767], "System.Byte": [0, 255], "System.SByte": [-128, 127] };
  const range = ranges[type ?? ""], value = Number(lexical);
  if (!range || !/^-?[0-9]+$/.test(lexical) || !Number.isInteger(value) || value < range[0] || value > range[1]) throw new Error("Invalid or unsupported typed integer.");
  return value;
}
function cultureId(name: string): number | undefined {
  const names: Record<number, string> = { 1028: "zh-TW", 1029: "cs-CZ", 1030: "da-DK", 1031: "de-DE", 1032: "el-GR", 1033: "en-US", 1035: "fi-FI", 1036: "fr-FR", 1038: "hu-HU", 1040: "it-IT", 1041: "ja-JP", 1042: "ko-KR", 1043: "nl-NL", 1044: "nb-NO", 1045: "pl-PL", 1046: "pt-BR", 1049: "ru-RU", 1053: "sv-SE", 1055: "tr-TR", 2052: "zh-CN", 2057: "en-GB", 2070: "pt-PT", 3082: "es-ES" };
  const pair = Object.entries(names).find(([, culture]) => culture.toLowerCase() === name.toLowerCase()); return pair ? Number(pair[0]) : undefined;
}

function decodeColor(lexical: string): unknown {
    if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(lexical)) throw new Error("Invalid color.");
    const channel = (i: number) => parseInt(lexical.slice(i, i + 2), 16);
    return { alpha: lexical.length === 9 ? channel(7) : 255, red: channel(1), green: channel(3), blue: channel(5) };
}

function decodeBoolean(lexical: string): boolean {
  if (lexical === "True") return true; if (lexical === "False") return false;
  throw new Error("Invalid Boolean.");
}

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
import { HmiFillPattern } from "../../screens/base/HmiFillPattern.js";

export interface HmiUnifiedXmlImportResult {
  readonly screen: HmiScreen;
  readonly sourceComplete: boolean;
  readonly diagnostics: readonly HmiUnifiedXmlDiagnostic[];
}
const n = HmiScreenToUnifiedXmlConverter.namespace;
const u = HmiScreenToUnifiedXmlConverter.contractNamespace;
const children = (node: Element): Element[] => Array.from(node.childNodes).filter((e): e is Element => e.nodeType === 1);
const elements = (node: Element, ns: string, name: string): Element[] => children(node).filter(e => e.namespaceURI === ns && e.localName === name);
const attr = (node: Element, name: string): string | undefined => node.hasAttribute(name) ? node.getAttribute(name)! : undefined;
const text = (node?: Element): string | undefined => node?.textContent ?? undefined;
const key = (node: Element, name: string): string | undefined => node.hasAttributeNS(u, name) ? node.getAttributeNS(u, name)! : undefined;
const record = (obj: object): Record<string, unknown> => obj as Record<string, unknown>;
const names: Record<string, string> = {
  Name: "name", Width: "width", Height: "height", ScreenNumber: "number", Left: "x", Top: "y", Enabled: "enabled", Visible: "visible",
  BackColor: "backgroundColor", AlternateBackColor: "alternateBackgroundColor", ForeColor: "foregroundColor", BorderColor: "borderColor",
  AlternateBorderColor: "alternateBorderColor", BorderWidth: "borderWidth", Opacity: "opacity", RotationAngle: "rotationAngle",
  RotationCenterX: "rotationCenterX", RotationCenterY: "rotationCenterY", TabIndex: "tabIndex", ReadOnly: "readOnly", Graphic: "source",
  HorizontalTextAlignment: "horizontalAlignment", VerticalTextAlignment: "verticalAlignment", BackFillPattern: "fillPattern", Screen: "screenName",
};
const scalarFields = new Set(["name", "number"]);
function parse(xml: string): Element {
  if (xml.length > 16 * 1024 * 1024 || /<!DOCTYPE/i.test(xml)) throw new Error("Oversized XML and DTD declarations are unsupported.");
  if (typeof DOMParser === "undefined") throw new Error("Unified XML reading requires the browser DOMParser API.");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (!doc.documentElement || doc.getElementsByTagNameNS("*", "parsererror").length) throw new Error("Malformed XML.");
  return doc.documentElement;
}

/** Reads XML v2 screen archives with native browser XML and compression APIs. */
export class HmiUnifiedXmlToScreenConverter {
  private catalog?: { id: string; root: Element };
  /** Supply catalog XML to avoid fetching the packaged gzip asset. */
  constructor(private readonly catalogXml?: string) {}

  /** Read individual exports or all screens in a software authoring document. Scripts stay inert. */
  async convertScreens(xml: string): Promise<readonly HmiUnifiedXmlImportResult[]> {
    const root = parse(xml);
    if (attr(root, "scope") === "screen") return [await this.convert(xml)];
    if (root.namespaceURI !== n || root.localName !== "unified-export" || attr(root, "version") !== "2" || attr(root, "scope") !== "device"
      || children(root).length !== 1 || children(root)[0].localName !== "software" || children(root)[0].namespaceURI !== n)
      throw new Error("Expected a Unified XML v2 screen or software document.");
    const screens = Array.from(root.getElementsByTagNameNS(n, "screen"));
    if (!screens.length) throw new Error("The Unified XML document contains no screens.");
    const results: HmiUnifiedXmlImportResult[] = [];
    for (const screen of screens) {
      const envelope = root.cloneNode(false) as Element;
      envelope.setAttribute("scope", "screen"); envelope.setAttribute("screen", attr(screen, "name") ?? "");
      const selected = screen.cloneNode(true) as Element;
      let ancestor: Element | null = screen;
      while (ancestor && !key(ancestor, "operation")) ancestor = ancestor.parentNode?.nodeType === 1 ? ancestor.parentNode as Element : null;
      const operation = ancestor ? key(ancestor, "operation") : undefined;
      if (operation) selected.setAttributeNS(u, "u:operation", operation);
      envelope.appendChild(selected);
      const result = await this.convert(new XMLSerializer().serializeToString(envelope));
      result.screen.sourceData = new TextEncoder().encode(xml);
      results.push(result);
    }
    return results;
  }

  async convert(xml: string): Promise<HmiUnifiedXmlImportResult> {
    const root = parse(xml);
    if (root.namespaceURI !== n || root.localName !== "unified-export" || attr(root, "version") !== "2" || attr(root, "scope") !== "screen" ||
      !/^(19|20|21)\.0\.0\.0$/.test(attr(root, "apiVersion") ?? ""))
      throw new Error("Expected a screen-scope Unified XML v2 archive for TIA V19, V20 or V21.");
    const complete = attr(root, "complete");
    if (complete !== "true" && complete !== "false") throw new Error("Invalid archive complete flag.");
    const roots = children(root);
    if (roots.length !== 1 || roots[0].namespaceURI !== n || roots[0].localName !== "screen") throw new Error("Exactly one screen root is required.");
    const source = roots[0];
    if (!attr(source, "name")?.trim() || attr(source, "name") !== attr(root, "screen")) throw new Error("Archive and screen names must agree.");
    const ids = new Map<string, Element>();
    const all = Array.from(root.getElementsByTagName("*"));
    for (const node of all) {
      const id = key(node, "id");
      if (id !== undefined) { if (!id || ids.has(id)) throw new Error("Duplicate or empty object ID."); ids.set(id, node); }
    }
    for (const ref of all.filter(e => e.namespaceURI === u && e.localName === "ref"))
      if (!ids.has(attr(ref, "ref") ?? "")) throw new Error("Dangling object reference.");
    const catalogId = attr(root, "catalog") ?? "";
    const catalog = this.catalog?.id === catalogId ? this.catalog.root : parse(this.catalogXml ?? await HmiUnifiedXmlCatalog.load(catalogId));
    if (catalog.namespaceURI !== u || catalog.localName !== "catalog" || attr(catalog, "id") !== catalogId)
      throw new Error("Catalog ID mismatch.");
    this.catalog = { id: catalogId, root: catalog };
    const context = new Context(catalog);
    const screen = new HmiScreen(); screen.sourceFormat = "WinCCUnifiedXmlV2"; screen.sourceData = new TextEncoder().encode(xml);
    context.map(source, screen, "screen");
    const layer = new HmiLayer(); layer.name = "Unified screen items"; screen.layers.push(layer);
    const nodes = children(source).flatMap(e => e.namespaceURI === n && e.localName === "screen-items" ? children(e) : [e])
      .filter(e => e.namespaceURI === u && e.localName === "ref" || e.namespaceURI === n && ["button", "text-box", "graphic-view"].includes(e.localName)
            || e.namespaceURI === n && ["rectangle", "faceplate-container", "screen-window"].includes(e.localName) || e.parentNode !== source);
    const items = new Map<Element, HmiScreenItemBase>();
    for (const node of nodes.filter(e => !(e.namespaceURI === u && e.localName === "ref"))) {
      if (["rectangle", "faceplate-container", "screen-window"].includes(node.localName) && !context.hasContract(node)) {
        context.report("screen." + node.localName, "Unsupported control retained in screen sourceData."); continue;
      }
      const item = node.namespaceURI !== n ? undefined : node.localName === "button" ? new HmiButton() : node.localName === "text-box" ? new HmiText() : node.localName === "graphic-view" ? new HmiGraphicView()
        : node.localName === "rectangle" ? new HmiRectangle() : node.localName === "faceplate-container" ? new HmiFaceplateContainer() : node.localName === "screen-window" ? new HmiScreenWindow() : undefined;
      if (!item) { context.report("screen." + node.localName, "Unsupported control retained in screen sourceData."); continue; }
      items.set(node, item); item.sourceFormat = "WinCCUnifiedXmlV2";
      item.sourceData = new TextEncoder().encode(new XMLSerializer().serializeToString(node));
      context.map(node, item, "screen." + node.localName);
    }
    for (const node of nodes) {
      const target = node.namespaceURI === u && node.localName === "ref" ? ids.get(attr(node, "ref")!)! : node;
      const item = items.get(target);
      if (item) layer.items.push(item); else context.report("screen.screen-items", "Reference or control cannot be represented; retained in screen sourceData.");
    }
    if (complete === "false") context.report("screen", "The source archive is marked incomplete.");
    if (attr(root, "coverage") === "authored-objects") context.report("screen", "Authoring preview uses catalog defaults; existing target values and external project resources are unavailable.");
    return { screen, sourceComplete: complete === "true", diagnostics: context.diagnostics };
  }
}

class Context {
  readonly diagnostics: HmiUnifiedXmlDiagnostic[] = [];
  private readonly contracts: Map<string, Element>;
  constructor(catalog: Element) {
    const types = elements(catalog, u, "types");
    if (types.length !== 1) throw new Error("Missing catalog contracts.");
    this.contracts = new Map(children(types[0]).map(e => [attr(e, "id")!, e]));
  }
  report(path: string, message: string): void { this.diagnostics.push({ path, message }); }
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
    const contract = this.contract(node); model.id = key(node, "id");
    const operation = key(node, "operation");
    if (operation && !["create", "update", "upsert"].includes(operation)) throw new Error("Invalid authoring operation.");
    if (operation === "update" || operation === "upsert") this.report(path, "Partial authoring object: omitted values use preview defaults; the existing target is unavailable.");
    const allowed = new Set<string>();
    for (const property of elements(contract, u, "property")) {
      const name = attr(property, "name")!, alias = attr(property, "xml")!; allowed.add(alias);
      const lexical = attr(node, alias) ?? text(elements(property, u, "default")[0]);
      if (lexical === undefined) {
        if (attr(elements(property, u, "value")[0], "kind") !== "null") this.report(`${path}.${name}`, "Required value is absent and has no catalog default.");
        continue;
      }
      model.sourceProperties[name] = lexical;
      const value = decode(lexical, elements(property, u, "value")[0]);
      if (name === "ContainedType" && model instanceof HmiFaceplateContainer) {
        const match = /^V([^\\]+)\\(.+)$/.exec(lexical);
        model.faceplateName = match?.[2] ?? lexical; model.faceplateVersion = match?.[1];
        this.report(path, "Faceplate library definition is external; preview uses a placeholder.");
        continue;
      }
      if (!names[name] || !assign(model, names[name], value)) this.report(`${path}.${name}`, "Field retained in sourceProperties; no neutral-model mapping.");
    }
    for (const member of elements(contract, u, "member")) {
      const name = attr(member, "name")!, alias = attr(member, "xml")!, mappings = attr(member, "attribute-map");
      if (mappings !== undefined) {
        const childContract = this.contracts.get(attr(member, "attribute-type")!)!;
        const explicit = elements(node, n, alias);
        if (explicit.length > 1) throw new Error("Duplicate singleton part.");
        const part = explicit[0] ?? node.ownerDocument!.createElementNS(n, alias);
        for (const pair of mappings.split(" ")) {
          const [child, owner] = pair.split("="); allowed.add(owner);
          const value = attr(node, owner);
          if (value !== undefined) { if (explicit.length) throw new Error("Conflicting promoted and explicit part."); part.setAttribute(child, value); }
        }
        this.part(part, childContract, model, name, path);
      } else if (["Font", "Padding"].includes(name) && elements(node, n, alias).length) {
        const part = elements(node, n, alias)[0]; this.part(part, this.contract(part), model, name, path);
      } else if (["Text", "AlternateText", "ToolTipText"].includes(name)) {
        const explicit = elements(node, n, alias);
        if (explicit.length > 1) throw new Error("Duplicate text singleton.");
        const defaults = elements(member, u, "default-element")[0];
        const textNode = explicit[0] ?? (defaults ? children(defaults)[0] : undefined);
        const target = name[0].toLowerCase() + name.slice(1);
        if (textNode && !assign(model, target, this.readText(textNode, `${path}.${name}`))) this.report(`${path}.${name}`, "Text has no neutral-model property.");
      }
    }
    for (const attribute of Array.from(node.attributes))
      if (attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/" && !(attribute.namespaceURI === u && ["id", "type", "operation"].includes(attribute.localName)) &&
        (attribute.namespaceURI || !allowed.has(attribute.localName))) this.report(`${path}.@${attribute.name}`, "Unknown attribute retained in sourceData.");
    for (const wrapper of elements(node, n, "event-handlers")) for (const handler of children(wrapper)) {
      if (handler.namespaceURI !== n || !["button-event-handler", "screen-event-handler"].includes(handler.localName)) { this.report(`${path}.events`, "Unsupported event retained in sourceData."); continue; }
      this.contract(handler);
      const script = elements(handler, n, "script")[0], eventName = attr(handler, "event-type");
      const code = script ? elements(script, n, "script-code")[0] : undefined;
      if (!code || eventName === undefined) { this.report(`${path}.events`, "Event has no readable script or event type."); continue; }
      this.contract(script);
      const event = new HmiEventBinding(), action = new HmiTextScriptAction();
      event.eventName = eventName; action.language = HmiScriptLanguage.JavaScript; action.sourceCode = readCode(code); event.action = action;
      model.events.push(event);
      this.report(`${path}.events.${eventName}`, "Event script mapped; additional engineering settings remain in sourceData.");
    }
    const dynamized = new Set<string>();
    for (const wrapper of elements(node, n, "dynamizations")) for (const dynamic of children(wrapper)) {
      if (dynamic.namespaceURI !== n || dynamic.localName !== "script-dynamization") { this.report(`${path}.dynamizations`, "Unsupported dynamization retained in sourceData."); continue; }
      this.contract(dynamic);
      const name = attr(dynamic, "property-name");
      if (name === undefined || dynamized.has(name)) throw new Error("Missing or duplicate dynamized property name.");
      dynamized.add(name);
      const target = name === "Text" ? "text" : names[name], code = elements(dynamic, n, "script-code")[0];
      if (!target || !(target in model) || scalarFields.has(target) || !code) { this.report(`${path}.dynamizations.${name}`, "Unmapped script dynamization retained in sourceData."); continue; }
      const previous = record(model)[target] as { staticValue?: unknown } | undefined;
      const property = scriptProperty(readCode(code), HmiScriptLanguage.JavaScript, previous?.staticValue);
      const trigger = elements(dynamic, n, "trigger")[0];
      if (trigger) this.contract(trigger);
      if (trigger && attr(trigger, "type") === "Tags") property.triggers.push({
        kind: HmiTriggerKind.Tag, mode: HmiTagTriggerMode.ValueChange,
        tagNames: elements(trigger, n, "tag").map(e => { const name = attr(e, "name"); if (name === undefined) throw new Error("Missing trigger tag name."); return name; }),
      } as import("../../screens/base/HmiProperty.js").HmiTagTrigger);
      record(model)[target] = property;
      this.report(`${path}.dynamizations.${name}`, "Script and tag triggers mapped; other engineering settings remain in sourceData.");
    }
    const handled = new Set(["font", "padding", "text", "alternate-text", "tool-tip-text", "event-handlers", "dynamizations"]);
    if (model instanceof HmiScreen) for (const name of ["button", "text-box", "graphic-view", "rectangle", "faceplate-container", "screen-window", "screen-items"]) handled.add(name);
    for (const child of children(node))
      if (!(child.namespaceURI === u && child.localName === "ref") && (child.namespaceURI !== n || !handled.has(child.localName)))
        this.report(`${path}.${child.localName}`, "Unsupported member retained in sourceData.");
  }
  private part(node: Element, contract: Element, owner: HmiScreen | HmiScreenItemBase, role: string, path: string): void {
    if (key(node, "type") !== undefined && key(node, "type") !== attr(contract, "id")) throw new Error("Incompatible part contract selector.");
    const part = role === "Font" ? new HmiFont() : role === "Padding" ? new HmiThickness() : undefined;
    const allowed = new Set(elements(contract, u, "property").map(p => attr(p, "xml")!));
    for (const property of elements(contract, u, "property")) {
      const name = attr(property, "name")!, lexical = attr(node, attr(property, "xml")!) ?? text(elements(property, u, "default")[0]);
      if (lexical === undefined) { this.report(`${path}.${role}.${name}`, "Required part value is absent and has no catalog default."); continue; }
      owner.sourceProperties[`${role}.${name}`] = lexical;
      let value = decode(lexical, elements(property, u, "value")[0]);
      let target = name === "StrikeOut" ? "strikethrough" : name[0].toLowerCase() + name.slice(1);
      if (role === "Font" && name === "Weight") { target = "bold"; value = lexical === "Bold" ? true : lexical === "Normal" ? false : value; }
      if (!part || !assign(part, target, value, false)) this.report(`${path}.${role}.${name}`, "Part field retained in sourceProperties.");
    }
    const target = role[0].toLowerCase() + role.slice(1);
    if (part && target in owner) record(owner)[target] = part;
    for (const attribute of Array.from(node.attributes))
      if (attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/" && !(attribute.namespaceURI === u && ["id", "type", "operation"].includes(attribute.localName)) &&
        (attribute.namespaceURI || !allowed.has(attribute.localName))) this.report(`${path}.${role}.@${attribute.name}`, "Unknown part attribute retained in sourceData.");
    for (const child of children(node)) this.report(`${path}.${role}.${child.localName}`, "Part member retained in sourceData.");
  }
  private readText(node: Element, path: string): HmiMultilingualText {
    this.contract(node);
    const result = new HmiMultilingualText();
    for (const child of children(node)) {
      if (child.namespaceURI !== n || child.localName !== "multilingual-text-item") { this.report(path, "Unsupported text member retained in sourceData."); continue; }
      this.contract(child);
      for (const attribute of Array.from(child.attributes))
        if (attribute.namespaceURI !== "http://www.w3.org/2000/xmlns/" && !(attribute.namespaceURI === u && ["id", "type", "operation"].includes(attribute.localName)) &&
          (attribute.namespaceURI || !["lang", "text"].includes(attribute.localName))) this.report(`${path}.@${attribute.name}`, "Unknown localized-text attribute retained in sourceData.");
      const language = attr(child, "lang"), value = attr(child, "text");
      if (language === undefined || value === undefined) throw new Error("Missing text language or payload.");
      const lcid = cultureId(language);
      if (lcid === undefined) { this.report(path, `Unsupported language ${language}; retained in sourceData.`); continue; }
      if (result.texts.has(lcid)) throw new Error("Duplicate text language.");
      result.texts.set(lcid, value); if (value.startsWith("<body")) result.formattedTexts.set(lcid, value);
    }
    return result;
  }
}
function readCode(node: Element): string {
  if (!children(node).length) return text(node) ?? "";
  const value = elements(node, u, "Value")[0];
  if (children(node).length !== 1 || !value || children(value).length || attr(value, "kind") !== "scalar" || attr(value, "type") !== "System.String") throw new Error("Unsupported script payload.");
  if (attr(value, "encoding") === "text") return text(value) ?? "";
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
  if (attr(template, "kind") === "enum" || type === "System.String") return lexical;
  if (type === "System.Boolean") { if (lexical === "True") return true; if (lexical === "False") return false; throw new Error("Invalid Boolean."); }
  if (type === "System.Drawing.Color") {
    if (!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(lexical)) throw new Error("Invalid color.");
    const channel = (i: number) => parseInt(lexical.slice(i, i + 2), 16);
    return { alpha: lexical.length === 9 ? channel(7) : 255, red: channel(1), green: channel(3), blue: channel(5) };
  }
  if (type === "System.Single" || type === "System.Double") {
    if (!["NaN", "Infinity", "-Infinity"].includes(lexical) && !/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/.test(lexical)) throw new Error("Invalid floating-point value.");
    return type === "System.Single" ? Math.fround(Number(lexical)) : Number(lexical);
  }
  const ranges: Record<string, [number, number]> = { "System.UInt32": [0, 4294967295], "System.UInt16": [0, 65535], "System.Int32": [-2147483648, 2147483647], "System.Int16": [-32768, 32767], "System.Byte": [0, 255] };
  const range = ranges[type ?? ""], value = Number(lexical);
  if (!range || !/^-?[0-9]+$/.test(lexical) || !Number.isInteger(value) || value < range[0] || value > range[1]) throw new Error("Invalid or unsupported typed integer.");
  return value;
}
function cultureId(name: string): number | undefined {
  const names: Record<number, string> = { 1028: "zh-TW", 1029: "cs-CZ", 1030: "da-DK", 1031: "de-DE", 1032: "el-GR", 1033: "en-US", 1035: "fi-FI", 1036: "fr-FR", 1038: "hu-HU", 1040: "it-IT", 1041: "ja-JP", 1042: "ko-KR", 1043: "nl-NL", 1044: "nb-NO", 1045: "pl-PL", 1046: "pt-BR", 1049: "ru-RU", 1053: "sv-SE", 1055: "tr-TR", 2052: "zh-CN", 2057: "en-GB", 2070: "pt-PT", 3082: "es-ES" };
  const pair = Object.entries(names).find(([, culture]) => culture.toLowerCase() === name.toLowerCase()); return pair ? Number(pair[0]) : undefined;
}

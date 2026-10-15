import { HmiScreen } from "../../screens/screen/HmiScreen.js";
import type { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import type { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { HmiScreenKind } from "../../screens/base/HmiScreenKind.js";
import { HmiPropertyKind } from "../../screens/base/HmiProperty.js";
import type { HmiColor } from "../../screens/base/HmiColor.js";
import type { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiButton } from "../../screens/widgets/HmiButton.js";
import { HmiText } from "../../screens/shapes/HmiText.js";
import { HmiTextBox } from "../../screens/widgets/HmiTextBox.js";
import { HmiGraphicView } from "../../screens/shapes/HmiGraphicView.js";

export interface HmiUnifiedXmlDiagnostic { readonly path: string; readonly message: string; }
export interface HmiUnifiedXmlExportResult {
  readonly xml: string;
  /** The neutral model cannot certify the full Unified engineering graph. */
  readonly complete: false;
  readonly diagnostics: readonly HmiUnifiedXmlDiagnostic[];
}

const ns = "urn:s7mcp:wincc-unified:2";
const contractNs = "urn:s7mcp:wincc-unified:2:contract";
const catalog = "89ce7b2e33155ea0da70a8cfd76f09798b9a9f9d68c08155a7afb646a76bdd1a";
type Model = object;
type Mapping = readonly [string, string, string];
class Element {
  readonly attributes = new Map<string, string>();
  readonly children: Element[] = [];
  constructor(readonly tag: string) {}
  toString(): string {
    const attrs = [...this.attributes].map(([key, value]) => ` ${key}="${escapeXml(value)}"`).join("");
    return this.children.length ? `<${this.tag}${attrs}>${this.children.join("")}</${this.tag}>` : `<${this.tag}${attrs}/>`;
  }
}
function verify(value: string): string {
  // XML 1.0 permits paired surrogates, but not isolated UTF-16 code units.
  if (/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u.test(value))
    throw new Error("Value contains XML-illegal UTF-16; no compatible inline contract is available.");
  return value;
}
function escapeXml(value: string): string {
  return verify(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll("\r", "&#xD;").replaceAll("\n", "&#xA;").replaceAll("\t", "&#x9;");
}
function get(model: Model, property: string): unknown { return (model as Record<string, unknown>)[property]; }

/** Writes incomplete inspection archives against the fixed V21 WinCC Unified XML format profile. */
export class HmiScreenToUnifiedXmlConverter {
  static readonly catalogId = catalog;
  static readonly namespace = ns;
  static readonly contractNamespace = contractNs;

  /** defaultCultureLcid explicitly maps neutral default-language text (LCID -1 or 0). */
  convert(screen: HmiScreenBase, deviceName: string, defaultCultureLcid?: number): HmiUnifiedXmlExportResult {
    if (!screen || !deviceName?.trim() || !screen.name?.trim()) throw new Error("A screen name and device name are required.");
    if (Object.getPrototypeOf(screen) !== HmiScreen.prototype || screen.kind !== HmiScreenKind.Screen)
      throw new Error("The fixed V21 profile only maps ordinary screens.");
    verify(deviceName); verify(screen.name);
    const context = new Context(defaultCultureLcid);
    const root = new Element("unified-export");
    for (const [key, value] of Object.entries({ xmlns: ns, "xmlns:u": contractNs, version: "2", catalog,
      device: deviceName, apiVersion: "21.0.0.0", scope: "screen", screen: screen.name,
      coverage: "exposed-openness-graph", complete: "false" })) root.attributes.set(key, value);
    context.report("screen", "The neutral model has no complete V21 engineering source mapping; this archive is for inspection and cannot be restored as a complete archive.");
    const element = context.object(screen, "screen", "t1"); root.children.push(element);
    const mapped = context.common(screen, element, "screen", false);
    context.attribute(screen, mapped, element, ["number", "screen-number", "u16"], "screen");
    context.attribute(screen, mapped, element, ["backgroundColor", "back-color", "color"], "screen");
    mapped.add("kind"); mapped.add("layers"); context.audit(screen, mapped, "screen");
    screen.layers.forEach((layer, i) => {
      const path = `screen.layers[${i}]`;
      context.report(path, "Layer metadata has no released encoding contract; items are flattened in layer order.");
      layer.items.forEach((item, j) => context.item(item, element, `${path}.items[${j}]`));
    });
    return { xml: '<?xml version="1.0" encoding="utf-8"?>\n' + root.toString(), complete: false, diagnostics: context.diagnostics };
  }
}

class Context {
  readonly diagnostics: HmiUnifiedXmlDiagnostic[] = [];
  private readonly identities = new Map<Model, string>();
  constructor(private readonly defaultCultureLcid?: number) {}
  report(path: string, message: string): void { this.diagnostics.push({ path, message }); }
  object(model: Model, tag: string, type: string): Element {
    const id = `o${this.identities.size + 1}`; this.identities.set(model, id);
    const element = new Element(tag); element.attributes.set("u:id", id); element.attributes.set("u:type", type); return element;
  }
  common(model: Model, element: Element, path: string, item: boolean): Set<string> {
    const mapped = new Set(["id", "hmiObjectType"]);
    for (const mapping of [["name", "name", "string"], ["width", "width", "u32"], ["height", "height", "u32"]] as const)
      this.attribute(model, mapped, element, mapping, path);
    if (item) for (const mapping of [["x", "left", "i32"], ["y", "top", "i32"], ["visible", "visible", "bool"],
      ["enabled", "enabled", "bool"], ["opacity", "opacity", "single"], ["rotationAngle", "rotation-angle", "i16"],
      ["rotationCenterX", "rotation-center-x", "single"], ["rotationCenterY", "rotation-center-y", "single"],
      ["tabIndex", "tab-index", "u16"], ["backgroundColor", "back-color", "color"],
      ["alternateBackgroundColor", "alternate-back-color", "color"]] as const) this.attribute(model, mapped, element, mapping, path);
    return mapped;
  }
  item(item: HmiScreenItemBase, parent: Element, path: string): void {
    const id = this.identities.get(item);
    if (id) { const ref = new Element("u:ref"); ref.attributes.set("ref", id); parent.children.push(ref); return; }
    const type = item.constructor;
    const tag = type === HmiButton ? "button" : (type === HmiText || type === HmiTextBox) ? "text-box" : type === HmiGraphicView ? "graphic-view" : undefined;
    if (!tag) { this.report(path, "Unsupported control type: " + type.name); return; }
    const element = this.object(item, tag, tag === "button" ? "t9" : tag === "text-box" ? "t14" : "t6"); parent.children.push(element);
    const mapped = this.common(item, element, path, true);
    if (tag !== "graphic-view") {
      for (const mapping of [["foregroundColor", "fore-color", "color"], ["borderColor", "border-color", "color"],
        ["alternateBorderColor", "alternate-border-color", "color"], ["borderWidth", "border-width", "byte"]] as const)
        this.attribute(item, mapped, element, mapping, path);
      this.part(item, mapped, element, "font", path);
      if (tag === "text-box") this.attribute(item, mapped, element, ["readOnly", "read-only", "bool"], path);
    } else this.attribute(item, mapped, element, ["source", "graphic", "string"], path);
    this.part(item, mapped, element, "padding", path);
    if (tag !== "graphic-view") this.text(item, mapped, element, "text", "text", path);
    if (tag === "button") this.text(item, mapped, element, "alternateText", "alternate-text", path);
    this.text(item, mapped, element, "toolTipText", "tool-tip-text", path);
    this.audit(item, mapped, path);
  }
  private value(value: unknown, path: string): unknown {
    if (value == null || typeof value !== "object" || !("kind" in value)) return value;
    if (value.kind !== HmiPropertyKind.Static) {
      this.report(path, "Dynamic/default properties require a semantic mapping; no static fallback was exported."); return undefined;
    }
    return get(value, "staticValue");
  }
  attribute(model: Model, mapped: Set<string>, element: Element, [property, alias, codec]: Mapping, path: string): void {
    mapped.add(property);
    const value = this.value(get(model, property), `${path}.${property}`); if (value == null) return;
    try {
      let lexical: string;
      if (codec === "color") {
        const color = value as HmiColor;
        const bytes = [color.red, color.green, color.blue, ...(color.alpha === 255 ? [] : [color.alpha])];
        if (bytes.some(v => !Number.isInteger(v) || v < 0 || v > 255)) throw new Error("Invalid color channel.");
        lexical = "#" + bytes.map(v => v.toString(16).padStart(2, "0").toUpperCase()).join("");
      } else if (codec === "bool") {
        if (typeof value !== "boolean") throw new Error("Expected a boolean.");
        lexical = value ? "True" : "False";
      } else if (codec === "string") {
        if (typeof value !== "string") throw new Error("Expected a string.");
        lexical = verify(value);
      } else {
        if (typeof value !== "number") throw new Error("Expected a number.");
        if (codec === "single") {
          if (!Number.isNaN(value) && Math.fround(value) !== value) throw new Error("Value is not exactly representable as System.Single.");
          lexical = singleLexical(value);
        } else {
          const min = codec === "i32" ? -2147483648 : codec === "i16" ? -32768 : 0;
          const max = codec === "u32" ? 4294967295 : codec === "i32" ? 2147483647 : codec === "i16" ? 32767 : codec === "u16" ? 65535 : 255;
          if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Value is outside the exact ${codec} integer range.`);
          lexical = String(value);
        }
      }
      element.attributes.set(alias, lexical);
    } catch (error) { this.report(`${path}.${property}`, (error as Error).message); }
  }
  private part(owner: Model, mapped: Set<string>, element: Element, property: string, path: string): void {
    mapped.add(property); const part = get(owner, property) as Model | undefined; if (!part) return;
    const fields = new Set<string>(); const partPath = `${path}.${property}`;
    if (property === "padding") for (const side of ["left", "top", "right", "bottom"])
      this.attribute(part, fields, element, [side, `padding-${side}`, "i32"], partPath);
    else {
      fields.add("name"); const name = this.value(get(part, "name"), `${partPath}.name`);
      if (name === "Arial" || name === "SiemensSans") element.attributes.set("font-family", name);
      else if (name != null) this.report(`${partPath}.name`, "Unmapped Unified font enum: " + name);
      for (const mapping of [["size", "font-size", "single"], ["italic", "font-italic", "bool"],
        ["underline", "font-underline", "bool"], ["strikethrough", "font-strike-out", "bool"]] as const)
        this.attribute(part, fields, element, mapping, partPath);
    }
    this.audit(part, fields, partPath);
  }
  private text(model: Model, mapped: Set<string>, element: Element, property: string, alias: string, path: string): void {
    mapped.add(property); const text = this.value(get(model, property), `${path}.${property}`) as HmiMultilingualText | undefined;
    if (!text) return;
    const wrapper = new Element(alias); element.children.push(wrapper);
    const languages = new Set<string>();
    for (const lcid of new Set([...text.texts.keys(), ...text.formattedTexts.keys()])) {
      try {
        const effective = lcid <= 0 ? this.defaultCultureLcid : lcid;
        const culture = cultureName(effective);
        if (languages.has(culture)) throw new Error(`Multiple source language keys map to ${culture}.`);
        const value = verify(text.formattedTexts.get(lcid) ?? text.texts.get(lcid)!);
        const child = new Element("multilingual-text-item"); child.attributes.set("u:type", "t3");
        child.attributes.set("lang", culture); child.attributes.set("text", value); wrapper.children.push(child); languages.add(culture);
      } catch (error) { this.report(`${path}.${property}[${lcid}]`, (error as Error).message); }
    }
    if (text.parts.size) this.report(`${path}.${property}.parts`, "Structured text parts have no mapping.");
    if (text.sourceDefaultLanguageId != null || text.categoryTypeId !== 0 || text.categorySubtype != null)
      this.report(`${path}.${property}`, "Native text category/default-language metadata has no mapping.");
  }
  audit(model: Model, mapped: Set<string>, path: string): void {
    for (const property of Object.keys(model).sort()) {
      if (mapped.has(property)) continue;
      const value = get(model, property);
      if (value == null || (value instanceof Map || value instanceof Set) && value.size === 0 || Array.isArray(value) && value.length === 0) continue;
      if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === 0) continue;
      this.report(`${path}.${property}`, "No released semantic mapping for this populated field.");
    }
  }
}

function singleLexical(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (Object.is(value, -0)) return "-0";
  for (let precision = 1; precision <= 9; precision++) {
    const candidate = value.toPrecision(precision);
    if (Math.fround(Number(candidate)) === value) return String(Number(candidate));
  }
  return String(value);
}

// Explicit LCID mapping; unsupported languages produce diagnostics rather than guesses.
function cultureName(lcid?: number): string {
  const names: Record<number, string> = { 1028: "zh-TW", 1029: "cs-CZ", 1030: "da-DK", 1031: "de-DE", 1032: "el-GR",
    1033: "en-US", 1035: "fi-FI", 1036: "fr-FR", 1038: "hu-HU", 1040: "it-IT", 1041: "ja-JP", 1042: "ko-KR",
    1043: "nl-NL", 1044: "nb-NO", 1045: "pl-PL", 1046: "pt-BR", 1049: "ru-RU", 1053: "sv-SE", 1055: "tr-TR",
    2052: "zh-CN", 2057: "en-GB", 2070: "pt-PT", 3082: "es-ES" };
  if (lcid === undefined || !names[lcid]) throw new Error("Unsupported or unspecified culture LCID: " + lcid);
  return names[lcid];
}

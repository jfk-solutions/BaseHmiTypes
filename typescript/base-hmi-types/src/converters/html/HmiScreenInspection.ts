import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiContainerBase } from "../../screens/base/HmiContainerBase.js";
import { HmiGroup } from "../../screens/base/HmiGroup.js";
import { HmiLayer } from "../../screens/base/HmiLayer.js";
import { HmiLayoutContainerBase } from "../../screens/base/HmiLayoutContainerBase.js";
import { HmiPropertyKind, getStaticValue } from "../../screens/base/HmiProperty.js";
import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";
import { HmiScreenItemBase } from "../../screens/base/HmiScreenItemBase.js";
import { HmiSymbolContainer } from "../../screens/base/HmiSymbolContainer.js";
import { HmiScreenWindow } from "../../screens/screen/HmiScreenWindow.js";

export type HmiInspectionNodeKind = "screen" | "template" | "layer" | "item" | "reference";
export type HmiInspectionOrigin = "root" | "template" | "subscreen";
export type HmiInspectionReferenceStatus = "missing" | "recursive";

export interface HmiInspectionNode {
  key: string;
  name: string;
  typeName: string;
  kind: HmiInspectionNodeKind;
  origin: HmiInspectionOrigin;
  rendered: boolean;
  selectable: boolean;
  referenceStatus?: HmiInspectionReferenceStatus;
  children: HmiInspectionNode[];
}

export interface HmiScreenInspection {
  root: HmiInspectionNode;
  modelsByKey: ReadonlyMap<string, object>;
}

export interface HmiInspectableScreenHtml {
  html: string;
  inspection: HmiScreenInspection;
}

export interface HmiInspectionBinding {
  kind: string;
  summary: string;
  details: HmiInspectionProperty[];
}

export interface HmiInspectionProperty {
  name: string;
  value: string;
  valueType: string;
  binding?: HmiInspectionBinding;
  children: HmiInspectionProperty[];
}

export interface HmiPropertyInspectionOptions {
  maxDepth?: number;
  maxEntries?: number;
}

export async function inspectHmiScreenAsync(
  screen: HmiScreenBase,
  project?: IHmiProject,
  signal?: AbortSignal,
): Promise<HmiScreenInspection> {
  const modelsByKey = new Map<string, object>();
  const screenStack = new Set<string>();
  const root = await inspectScreen(screen, project, "screen", "root", true, screenStack, modelsByKey, signal);
  return { root, modelsByKey };
}

export function inspectHmiProperties(
  model: object,
  options: HmiPropertyInspectionOptions = {},
): HmiInspectionProperty[] {
  const state: PropertyInspectionState = {
    maxDepth: Math.max(1, options.maxDepth ?? 8),
    remaining: Math.max(1, options.maxEntries ?? 500),
    ancestors: new Set<object>(),
  };
  state.ancestors.add(model);
  return Object.entries(model)
    .filter(([name, value]) => isInspectableEntry(name, value))
    .map(([name, value]) => inspectProperty(name, value, 0, state))
    .filter((value): value is HmiInspectionProperty => value !== undefined);
}

async function inspectScreen(
  screen: HmiScreenBase,
  project: IHmiProject | undefined,
  key: string,
  origin: HmiInspectionOrigin,
  rendered: boolean,
  screenStack: Set<string>,
  modelsByKey: Map<string, object>,
  signal?: AbortSignal,
): Promise<HmiInspectionNode> {
  throwIfAborted(signal);
  const screenKeys = getScreenReferenceKeys(screen);
  for (const screenKey of screenKeys)
    screenStack.add(screenKey);

  const node = createModelNode(screen, key, origin === "template" ? "template" : "screen", origin, rendered, modelsByKey);
  try {
    const templateId = getStaticValue(screen.templateId)?.trim();
    const templateName = getStaticValue(screen.templateName)?.trim();
    if (templateId || templateName) {
      const template = await resolveScreen(project, templateId, templateName, signal);
      const referenceName = templateName || templateId || "Template";
      if (!template) {
        node.children.push(createReferenceNode(`${key}/template-reference`, referenceName, "template", "missing"));
      } else if (getScreenReferenceKeys(template).some(candidate => screenStack.has(candidate))) {
        node.children.push(createReferenceNode(`${key}/template-reference`, template.name || referenceName, "template", "recursive"));
      } else {
        node.children.push(await inspectScreen(template, project, `${key}/template`, "template", rendered, screenStack, modelsByKey, signal));
      }
    }

    for (let layerIndex = 0; layerIndex < screen.layers.length; layerIndex++) {
      const layer = screen.layers[layerIndex];
      const layerRendered = rendered && getStaticValue(layer.visible) !== false;
      node.children.push(await inspectLayer(
        layer,
        project,
        `${key}/layer:${layerIndex}`,
        origin,
        layerRendered,
        screenStack,
        modelsByKey,
        signal,
      ));
    }
    return node;
  } finally {
    for (const screenKey of screenKeys)
      screenStack.delete(screenKey);
  }
}

async function inspectLayer(
  layer: HmiLayer,
  project: IHmiProject | undefined,
  key: string,
  origin: HmiInspectionOrigin,
  rendered: boolean,
  screenStack: Set<string>,
  modelsByKey: Map<string, object>,
  signal?: AbortSignal,
): Promise<HmiInspectionNode> {
  const node = createModelNode(layer, key, "layer", origin, rendered, modelsByKey);
  for (let itemIndex = 0; itemIndex < layer.items.length; itemIndex++) {
    node.children.push(await inspectItem(
      layer.items[itemIndex],
      project,
      `${key}/item:${itemIndex}`,
      origin,
      rendered,
      screenStack,
      modelsByKey,
      signal,
    ));
  }
  return node;
}

async function inspectItem(
  item: HmiScreenItemBase,
  project: IHmiProject | undefined,
  key: string,
  origin: HmiInspectionOrigin,
  parentRendered: boolean,
  screenStack: Set<string>,
  modelsByKey: Map<string, object>,
  signal?: AbortSignal,
): Promise<HmiInspectionNode> {
  throwIfAborted(signal);
  const rendered = parentRendered && getStaticValue(item.visible) !== false;
  const hasOwnRenderedElement = !(item instanceof HmiGroup && item.isLogicGrouping);
  const node = createModelNode(item, key, "item", origin, rendered && hasOwnRenderedElement, modelsByKey);
  const childItems = getChildItems(item);
  for (let childIndex = 0; childIndex < childItems.length; childIndex++) {
    node.children.push(await inspectItem(
      childItems[childIndex],
      project,
      `${key}/item:${childIndex}`,
      origin,
      rendered,
      screenStack,
      modelsByKey,
      signal,
    ));
  }

  if (item instanceof HmiScreenWindow) {
    const screenId = getStaticValue(item.screenId)?.trim();
    const screenName = getStaticValue(item.screenName)?.trim();
    const referenced = await resolveScreen(project, screenId, screenName, signal);
    const referenceName = screenName || screenId || "Subscreen";
    if (!referenced) {
      node.children.push(createReferenceNode(`${key}/subscreen-reference`, referenceName, "subscreen", "missing"));
    } else if (getScreenReferenceKeys(referenced).some(candidate => screenStack.has(candidate))) {
      node.children.push(createReferenceNode(`${key}/subscreen-reference`, referenced.name || referenceName, "subscreen", "recursive"));
    } else {
      node.children.push(await inspectScreen(referenced, project, `${key}/subscreen`, "subscreen", rendered, screenStack, modelsByKey, signal));
    }
  }
  return node;
}

function createModelNode(
  model: object & { name?: string },
  key: string,
  kind: HmiInspectionNodeKind,
  origin: HmiInspectionOrigin,
  rendered: boolean,
  modelsByKey: Map<string, object>,
): HmiInspectionNode {
  modelsByKey.set(key, model);
  return {
    key,
    name: model.name?.trim() || model.constructor.name,
    typeName: model.constructor.name,
    kind,
    origin,
    rendered,
    selectable: true,
    children: [],
  };
}

function createReferenceNode(
  key: string,
  name: string,
  origin: HmiInspectionOrigin,
  referenceStatus: HmiInspectionReferenceStatus,
): HmiInspectionNode {
  return {
    key,
    name,
    typeName: referenceStatus === "missing" ? "Missing screen reference" : "Recursive screen reference",
    kind: "reference",
    origin,
    rendered: false,
    selectable: false,
    referenceStatus,
    children: [],
  };
}

function getChildItems(item: HmiScreenItemBase): readonly HmiScreenItemBase[] {
  if (
    item instanceof HmiGroup
    || item instanceof HmiContainerBase
    || item instanceof HmiLayoutContainerBase
    || item instanceof HmiSymbolContainer
  )
    return item.items;
  return [];
}

async function resolveScreen(
  project: IHmiProject | undefined,
  id: string | undefined,
  name: string | undefined,
  signal?: AbortSignal,
): Promise<HmiScreenBase | undefined> {
  if (!project)
    return undefined;
  if (id) {
    const byId = await project.getScreen(id, signal);
    if (byId)
      return byId;
  }
  return name ? project.getScreen(name, signal) : undefined;
}

function getScreenReferenceKeys(screen: HmiScreenBase): string[] {
  const result: string[] = [];
  if (screen.id?.trim())
    result.push(`id:${screen.id}`);
  if (screen.name?.trim())
    result.push(`name:${screen.name}`);
  return result;
}

function inspectProperty(
  name: string,
  value: unknown,
  depth: number,
  state: PropertyInspectionState,
): HmiInspectionProperty | undefined {
  if (state.remaining-- <= 0)
    return undefined;

  if (isHmiProperty(value)) {
    const staticValue = value.staticValue;
    return {
      name,
      value: summarizeValue(staticValue),
      valueType: valueType(staticValue),
      binding: value.kind === HmiPropertyKind.Static ? undefined : inspectBinding(value, depth, state),
      children: inspectChildren(staticValue, depth + 1, state),
    };
  }

  return {
    name,
    value: summarizeValue(value),
    valueType: valueType(value),
    children: inspectChildren(value, depth + 1, state),
  };
}

function inspectBinding(
  property: Record<string, unknown> & { kind: HmiPropertyKind },
  depth: number,
  state: PropertyInspectionState,
): HmiInspectionBinding {
  const details = Object.entries(property)
    .filter(([name]) => name !== "kind" && name !== "staticValue")
    .map(([name, value]) => inspectProperty(name, value, depth + 1, state))
    .filter((value): value is HmiInspectionProperty => value !== undefined);
  return {
    kind: property.kind,
    summary: bindingSummary(property),
    details,
  };
}

function inspectChildren(value: unknown, depth: number, state: PropertyInspectionState): HmiInspectionProperty[] {
  if (depth >= state.maxDepth || !isExpandable(value))
    return [];
  if (state.ancestors.has(value))
    return [{ name: "value", value: "[Circular]", valueType: "circular", children: [] }];

  state.ancestors.add(value);
  try {
    const entries = value instanceof Map
      ? Array.from(value.entries(), ([key, item]) => [String(key), item] as [string, unknown])
      : Array.isArray(value)
        ? value.map((item, index) => [String(index), item] as [string, unknown])
        : Object.entries(value);
    return entries
      .filter(([name, item]) => isInspectableEntry(name, item))
      .map(([name, item]) => inspectProperty(name, item, depth, state))
      .filter((item): item is HmiInspectionProperty => item !== undefined);
  } finally {
    state.ancestors.delete(value);
  }
}

function isHmiProperty(value: unknown): value is Record<string, unknown> & { kind: HmiPropertyKind; staticValue?: unknown } {
  return !!value
    && typeof value === "object"
    && typeof (value as { kind?: unknown }).kind === "string"
    && Object.values(HmiPropertyKind).includes((value as { kind: HmiPropertyKind }).kind);
}

function isExpandable(value: unknown): value is object {
  return typeof value === "object" && value !== null && !(value instanceof Date) && !(value instanceof Uint8Array);
}

function isStructuralProperty(name: string, value: unknown): boolean {
  return (name === "layers" || name === "items")
    && Array.isArray(value);
}

function isInspectableEntry(name: string, value: unknown): boolean {
  return typeof value !== "function" && !isStructuralProperty(name, value);
}

function summarizeValue(value: unknown): string {
  if (value === undefined)
    return "undefined";
  if (value === null)
    return "null";
  if (typeof value === "string")
    return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint")
    return String(value);
  if (value instanceof Date)
    return value.toISOString();
  if (value instanceof Uint8Array)
    return `${value.byteLength} bytes`;
  if (value instanceof Map)
    return `${value.size} entries`;
  if (Array.isArray(value))
    return `${value.length} items`;
  if (isHmiColor(value))
    return colorSummary(value);
  const text = safeToString(value);
  return text && text !== "[object Object]" ? text : value.constructor.name;
}

function valueType(value: unknown): string {
  if (value === undefined)
    return "undefined";
  if (value === null)
    return "null";
  if (Array.isArray(value))
    return "array";
  if (value instanceof Map)
    return "map";
  if (value instanceof Uint8Array)
    return "bytes";
  return typeof value === "object" ? value.constructor.name : typeof value;
}

function bindingSummary(property: Record<string, unknown> & { kind: HmiPropertyKind }): string {
  switch (property.kind) {
    case HmiPropertyKind.Tag:
      return property.tagName ? `Tag: ${String(property.tagName)}` : "Tag";
    case HmiPropertyKind.FaceplateInterface:
      return property.interfaceName ? `Interface: ${String(property.interfaceName)}` : "Faceplate interface";
    case HmiPropertyKind.Script:
      return property.language ? `Script (${String(property.language)})` : "Script";
    case HmiPropertyKind.Expression:
      return property.expression ? `Expression: ${String(property.expression)}` : "Expression";
    case HmiPropertyKind.Blink:
      return property.conditionTagName ? `Blink: ${String(property.conditionTagName)}` : "Blink";
    case HmiPropertyKind.Default:
      return property.propertyName ? `Default: ${String(property.propertyName)}` : "Default";
    default:
      return property.kind;
  }
}

function isHmiColor(value: object): value is { alpha: number; red: number; green: number; blue: number } {
  return "alpha" in value && "red" in value && "green" in value && "blue" in value
    && typeof value.alpha === "number" && typeof value.red === "number"
    && typeof value.green === "number" && typeof value.blue === "number";
}

function colorSummary(value: { alpha: number; red: number; green: number; blue: number }): string {
  const hex = [value.red, value.green, value.blue]
    .map(component => Math.max(0, Math.min(255, component)).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return value.alpha === 255 ? `#${hex}` : `rgba(${value.red}, ${value.green}, ${value.blue}, ${Number((value.alpha / 255).toFixed(3))})`;
}

function safeToString(value: object): string | undefined {
  try {
    return typeof value.toString === "function" ? value.toString() : undefined;
  } catch {
    return undefined;
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted)
    throw signal.reason ?? new DOMException("The operation was aborted.", "AbortError");
}

interface PropertyInspectionState {
  maxDepth: number;
  remaining: number;
  ancestors: Set<object>;
}

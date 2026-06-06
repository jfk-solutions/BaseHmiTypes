export enum HmiPropertyKind {
  Static = "Static",
  Tag = "Tag",
  Script = "Script",
  Expression = "Expression",
  Blink = "Blink",
}

export enum HmiScriptLanguage {
  Unknown = "Unknown",
  C = "C",
  VBScript = "VBScript",
  JavaScript = "JavaScript",
}

export enum HmiBlinkCondition {
  Always = "Always",
  WhenTrue = "WhenTrue",
  WhenFalse = "WhenFalse",
}

export enum HmiBlinkRate {
  Default = "Default",
  Slow = "Slow",
  Medium = "Medium",
  Fast = "Fast",
}

export enum HmiTriggerKind {
  Tag = "Tag",
  Cycle = "Cycle",
  Event = "Event",
}

export enum HmiTagTriggerMode {
  ValueChange = "ValueChange",
  RisingEdge = "RisingEdge",
  FallingEdge = "FallingEdge",
}

export enum HmiValueConverterKind {
  Unknown = "Unknown",
  Linear = "Linear",
  Range = "Range",
  Expression = "Expression",
  Script = "Script",
}

export interface HmiProperty<T> {
  readonly kind: HmiPropertyKind;
  staticValue?: T;
}

export interface HmiDynamicProperty<T> extends HmiProperty<T> {
  triggers: HmiTrigger[];
}

export interface HmiTrigger {
  readonly kind: HmiTriggerKind;
  name?: string;
}

export interface HmiTagTrigger extends HmiTrigger {
  readonly kind: HmiTriggerKind.Tag;
  tagNames: string[];
  mode: HmiTagTriggerMode;
}

export interface HmiCycleTrigger extends HmiTrigger {
  readonly kind: HmiTriggerKind.Cycle;
  cycleName?: string;
  cycleTime?: number;
  cycleUnit?: string;
}

export interface HmiEventTrigger extends HmiTrigger {
  readonly kind: HmiTriggerKind.Event;
  eventName?: string;
}

export interface HmiValueConverter {
  kind: HmiValueConverterKind;
  name?: string;
  expression?: string;
  language: HmiScriptLanguage;
  script?: string;
  parameters: Record<string, unknown>;
}

export interface HmiStaticProperty<T> extends HmiProperty<T> {
  readonly kind: HmiPropertyKind.Static;
}

export interface HmiTagProperty<T> extends HmiDynamicProperty<T> {
  readonly kind: HmiPropertyKind.Tag;
  tagName?: string;
}

export interface HmiScriptProperty<T> extends HmiDynamicProperty<T> {
  readonly kind: HmiPropertyKind.Script;
  language: HmiScriptLanguage;
  script?: string;
}

export interface HmiExpressionProperty<T> extends HmiDynamicProperty<T> {
  readonly kind: HmiPropertyKind.Expression;
  expression?: string;
  converters: HmiValueConverter[];
}

export interface HmiBlinkProperty<T> extends HmiProperty<T> {
  readonly kind: HmiPropertyKind.Blink;
  blinkValue?: T;
  condition: HmiBlinkCondition;
  rate: HmiBlinkRate;
  conditionTagName?: string;
}

export function staticProperty<T>(value?: T): HmiStaticProperty<T> {
  return { kind: HmiPropertyKind.Static, staticValue: value };
}

export function tagProperty<T>(tagName: string, fallbackValue?: T): HmiTagProperty<T> {
  return { kind: HmiPropertyKind.Tag, tagName, staticValue: fallbackValue, triggers: [] };
}

export function scriptProperty<T>(
  script: string,
  language: HmiScriptLanguage,
  fallbackValue?: T,
): HmiScriptProperty<T> {
  return { kind: HmiPropertyKind.Script, language, script, staticValue: fallbackValue, triggers: [] };
}

export function expressionProperty<T>(expression: string, fallbackValue?: T): HmiExpressionProperty<T> {
  return { kind: HmiPropertyKind.Expression, expression, staticValue: fallbackValue, triggers: [], converters: [] };
}

export function blinkProperty<T>(
  staticValue?: T,
  blinkValue?: T,
  rate: HmiBlinkRate = HmiBlinkRate.Default,
  condition: HmiBlinkCondition = HmiBlinkCondition.Always,
  conditionTagName?: string,
): HmiBlinkProperty<T> {
  return { kind: HmiPropertyKind.Blink, staticValue, blinkValue, rate, condition, conditionTagName };
}

export function getStaticValue<T>(property?: HmiProperty<T>): T | undefined {
  return property?.staticValue;
}

export function getStaticValueOrDefault<T>(property: HmiProperty<T> | undefined, defaultValue: T): T {
  return property?.staticValue ?? defaultValue;
}

export class HmiPropertyExtensions {
  static getStaticValue<T>(property?: HmiProperty<T>): T | undefined {
    return getStaticValue(property);
  }

  static getStaticValueOrDefault<T>(property: HmiProperty<T> | undefined, defaultValue: T): T {
    return getStaticValueOrDefault(property, defaultValue);
  }
}

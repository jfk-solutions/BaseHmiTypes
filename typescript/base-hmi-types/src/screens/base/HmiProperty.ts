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

export interface HmiProperty<T> {
  readonly kind: HmiPropertyKind;
  staticValue?: T;
}

export interface HmiStaticProperty<T> extends HmiProperty<T> {
  readonly kind: HmiPropertyKind.Static;
}

export interface HmiTagProperty<T> extends HmiProperty<T> {
  readonly kind: HmiPropertyKind.Tag;
  tagName?: string;
}

export interface HmiScriptProperty<T> extends HmiProperty<T> {
  readonly kind: HmiPropertyKind.Script;
  language: HmiScriptLanguage;
  script?: string;
}

export interface HmiExpressionProperty<T> extends HmiProperty<T> {
  readonly kind: HmiPropertyKind.Expression;
  expression?: string;
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
  return { kind: HmiPropertyKind.Tag, tagName, staticValue: fallbackValue };
}

export function scriptProperty<T>(
  script: string,
  language: HmiScriptLanguage,
  fallbackValue?: T,
): HmiScriptProperty<T> {
  return { kind: HmiPropertyKind.Script, language, script, staticValue: fallbackValue };
}

export function expressionProperty<T>(expression: string, fallbackValue?: T): HmiExpressionProperty<T> {
  return { kind: HmiPropertyKind.Expression, expression, staticValue: fallbackValue };
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

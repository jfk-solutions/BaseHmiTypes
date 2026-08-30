export enum HmiTextPartKind {
  Literal,
  NumericVariable,
  StringVariable,
  DateTimeVariable,
}

export enum HmiTextFillMode {
  None,
  Zero,
  Space,
}

/**
 * One ordered part of text that combines literal content with dynamic
 * variables. Expressions remain inert source text and are never evaluated.
 */
export class HmiTextPart {
  kind = HmiTextPartKind.Literal;
  sourceText = "";
  text?: string;
  expression?: string;
  isLiteral = false;
  fieldLength?: number;
  useRightmostCharacters = false;
  showTruncationIndicator = false;
  fillMode = HmiTextFillMode.None;
  digitsAfterDecimal?: number;
  format?: string;
  previewText?: string;
}

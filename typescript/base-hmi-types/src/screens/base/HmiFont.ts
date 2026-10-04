import { HmiProperty } from "./HmiProperty.js";

export class HmiFont {
  name?: HmiProperty<string>;
  size?: HmiProperty<number>;
  characterWidth?: HmiProperty<number>;
  characterHeight?: HmiProperty<number>;
  escapementAngle?: HmiProperty<number>;
  orientationAngle?: HmiProperty<number>;
  weight?: HmiProperty<number>;
  bold?: HmiProperty<boolean>;
  italic?: HmiProperty<boolean>;
  underline?: HmiProperty<boolean>;
  strikethrough?: HmiProperty<boolean>;
  characterSet?: HmiProperty<number>;
  outputPrecision?: HmiProperty<number>;
  clippingPrecision?: HmiProperty<number>;
  quality?: HmiProperty<number>;
  pitchAndFamily?: HmiProperty<number>;

  readonly localizedFonts = new Map<number, HmiFont>();

  getForCulture(lcid?: number): HmiFont {
    const localized = lcid === undefined ? undefined : this.localizedFonts.get(lcid);
    if (!localized) return this;
    const result = new HmiFont();
    { const value = localized.name ?? this.name; if (value !== undefined) result.name = value; }
    { const value = localized.size ?? this.size; if (value !== undefined) result.size = value; }
    { const value = localized.characterWidth ?? this.characterWidth; if (value !== undefined) result.characterWidth = value; }
    { const value = localized.characterHeight ?? this.characterHeight; if (value !== undefined) result.characterHeight = value; }
    { const value = localized.escapementAngle ?? this.escapementAngle; if (value !== undefined) result.escapementAngle = value; }
    { const value = localized.orientationAngle ?? this.orientationAngle; if (value !== undefined) result.orientationAngle = value; }
    { const value = localized.weight ?? this.weight; if (value !== undefined) result.weight = value; }
    { const value = localized.bold ?? this.bold; if (value !== undefined) result.bold = value; }
    { const value = localized.italic ?? this.italic; if (value !== undefined) result.italic = value; }
    { const value = localized.underline ?? this.underline; if (value !== undefined) result.underline = value; }
    { const value = localized.strikethrough ?? this.strikethrough; if (value !== undefined) result.strikethrough = value; }
    { const value = localized.characterSet ?? this.characterSet; if (value !== undefined) result.characterSet = value; }
    { const value = localized.outputPrecision ?? this.outputPrecision; if (value !== undefined) result.outputPrecision = value; }
    { const value = localized.clippingPrecision ?? this.clippingPrecision; if (value !== undefined) result.clippingPrecision = value; }
    { const value = localized.quality ?? this.quality; if (value !== undefined) result.quality = value; }
    { const value = localized.pitchAndFamily ?? this.pitchAndFamily; if (value !== undefined) result.pitchAndFamily = value; }
    return result;
  }
}

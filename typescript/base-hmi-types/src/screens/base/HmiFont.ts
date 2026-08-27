import { HmiProperty } from "./HmiProperty.js";

export class HmiFont {
  name?: HmiProperty<string>;
  size?: HmiProperty<number>;
  characterWidth?: HmiProperty<number>;
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
}

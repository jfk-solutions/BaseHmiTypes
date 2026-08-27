import { HmiColor } from "./HmiColor.js";
import { HmiColorBehavior } from "./HmiColorBehavior.js";
import { HmiGradientDirection } from "./HmiGradientDirection.js";

export class HmiColorAnimationState {
  value?: number;
  foregroundBehavior?: HmiColorBehavior;
  foregroundColor1?: HmiColor;
  foregroundColor2?: HmiColor;
  backgroundBehavior?: HmiColorBehavior;
  backgroundColor1?: HmiColor;
  backgroundColor2?: HmiColor;
  fillColorMode?: number;
  backgroundEndColor?: HmiColor;
  backgroundGradientStop?: number;
  backgroundGradientAxis?: string;
  backgroundGradientDirection?: HmiGradientDirection;
  fillEndColor?: HmiColor;
  fillGradientStop?: number;
  fillGradientAxis?: string;
  fillGradientDirection?: HmiGradientDirection;
}

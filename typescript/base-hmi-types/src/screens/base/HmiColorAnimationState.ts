import { HmiColor } from "./HmiColor.js";
import { HmiColorBehavior } from "./HmiColorBehavior.js";
import { HmiGradientDirection } from "./HmiGradientDirection.js";

export class HmiColorAnimationState {
  value?: number;
  /** Inclusive range bounds; omitted bounds retain exact value matching. */
  minimumValue?: number;
  maximumValue?: number;
  /** Bit matching replaces numeric range matching when a selector is present. */
  bitIndex?: number;
  /** Expected selected bit value; omitted means true. */
  bitValue?: boolean;
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

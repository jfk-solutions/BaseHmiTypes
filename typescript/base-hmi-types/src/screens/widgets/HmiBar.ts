import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiFillDirection } from "../base/HmiFillDirection.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiColor } from "../base/HmiColor.js";

export class HmiBar extends HmiScaleWidgetBase {
  fillStyle?: HmiProperty<HmiBarFillStyle>;
  /** Color of the unfilled bar track, independent of widget background. Omitted retains the background-based track. */
  trackColor?: HmiProperty<HmiColor>;
  /** Color of the value region, independent of widget foreground. Disabled and threshold colors take precedence; omitted inherits foreground. */
  fillColor?: HmiProperty<HmiColor>;
  fillDirection?: HmiProperty<HmiFillDirection>;
  /** Position of originValue in percent, used only with useAutoScaling. Valid preview positions are zero through 100. */
  originPositionPercent?: HmiProperty<number>;
  /** Transform of normalized range positions. Automatic origin placement takes precedence. */
  valueMapping?: HmiProperty<HmiBarValueMapping>;
  /** Tangent pivot in normalized percent. Omitted uses normalized originValue, or 50 without an origin. */
  tangentPivotPercent?: HmiProperty<number>;
  /** True places the scale right/below; false places it left/above. Omitted uses right/below. */
  scaleAfterBar?: HmiProperty<boolean>;
  /** Use the lowest enabled threshold strictly above the value; otherwise retain the foreground color. */
  useThresholdFillColors?: HmiProperty<boolean>;
  /** Show a black end arrow when the raw value is strictly below this limit. */
  underflowLimit?: HmiProperty<number>;
  /** Show a black end arrow when the raw value is strictly above this limit. */
  overflowLimit?: HmiProperty<number>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiBar;
  }
}

export enum HmiBarFillStyle {
  Solid = "Solid",
  Gradient = "Gradient",
  /** Paint no value-region color; retain track, scale, thresholds, arrows and meter value. */
  Transparent = "Transparent",
}

/** Range-normalized mappings, not logarithms/powers of the raw process value. */
export enum HmiBarValueMapping {
  Linear = 0,
  NormalizedLogarithmic = 1,
  InverseNormalizedLogarithmic = 2,
  Tangent = 4,
  Quadratic = 5,
  Cubic = 6,
}

import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiFillDirection } from "../base/HmiFillDirection.js";
import { HmiProperty } from "../base/HmiProperty.js";

export class HmiBar extends HmiScaleWidgetBase {
  fillStyle?: HmiProperty<HmiBarFillStyle>;
  fillDirection?: HmiProperty<HmiFillDirection>;
  /** Position of originValue in percent, used only with useAutoScaling. Valid preview positions are zero through 100. */
  originPositionPercent?: HmiProperty<number>;
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
}

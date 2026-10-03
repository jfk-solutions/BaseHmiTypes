import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiFillDirection } from "../base/HmiFillDirection.js";
import { HmiProperty } from "../base/HmiProperty.js";

export class HmiBar extends HmiScaleWidgetBase {
  fillStyle?: HmiProperty<HmiBarFillStyle>;
  fillDirection?: HmiProperty<HmiFillDirection>;
  /** True places the scale right/below; false places it left/above. Omitted uses right/below. */
  scaleAfterBar?: HmiProperty<boolean>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiBar;
  }
}

export enum HmiBarFillStyle {
  Solid = "Solid",
  Gradient = "Gradient",
}

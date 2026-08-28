import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";

/** A value-driven arrow that moves along a horizontal or vertical scale. */
export class HmiArrowIndicator extends HmiScaleWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiArrowIndicator;
  }
}

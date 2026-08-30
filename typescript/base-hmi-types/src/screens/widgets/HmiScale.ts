import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";

/** A static ruler-style scale with tick marks and optional labels. */
export class HmiScale extends HmiScaleWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiScale;
  }
}

import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiBar extends HmiScaleWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiBar;
  }
}

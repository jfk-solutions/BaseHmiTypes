import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiGauge extends HmiScaleWidgetBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGauge;
  }
}

import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiGaugeSweepStyle } from "./HmiGaugeSweepStyle.js";

export class HmiGauge extends HmiScaleWidgetBase {
  needleWidth?: HmiProperty<number>;
  sweepStyle?: HmiProperty<HmiGaugeSweepStyle>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGauge;
  }
}

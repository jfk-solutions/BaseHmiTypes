import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiGaugeSweepStyle } from "./HmiGaugeSweepStyle.js";

export class HmiGauge extends HmiScaleWidgetBase {
  needleWidth?: HmiProperty<number>;
  sweepStyle?: HmiProperty<HmiGaugeSweepStyle>;
  engineeringUnit?: HmiProperty<string>;
  targetValue?: HmiProperty<number>;
  targetHighDeviation?: HmiProperty<number>;
  targetLowDeviation?: HmiProperty<number>;
  setpointValue?: HmiProperty<number>;
  thresholdHighHigh?: HmiProperty<number>;
  thresholdHigh?: HmiProperty<number>;
  thresholdLow?: HmiProperty<number>;
  thresholdLowLow?: HmiProperty<number>;
  controlLimitHighHigh?: HmiProperty<number>;
  controlLimitHigh?: HmiProperty<number>;
  controlLimitLow?: HmiProperty<number>;
  controlLimitLowLow?: HmiProperty<number>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGauge;
  }
}

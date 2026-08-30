import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiGaugeSweepStyle } from "./HmiGaugeSweepStyle.js";
import { HmiLineStyle } from "../base/HmiLineStyle.js";
import type { HmiColor } from "../base/HmiColor.js";
import type { HmiFont } from "../base/HmiFont.js";

export class HmiGauge extends HmiScaleWidgetBase {
  needleWidth?: HmiProperty<number>;
  sweepStyle?: HmiProperty<HmiGaugeSweepStyle>;
  engineeringUnit?: HmiProperty<string>;
  currentValueVisible?: HmiProperty<boolean>;
  currentValueFieldLength?: HmiProperty<number>;
  currentValueDecimalPlaces?: HmiProperty<number>;
  currentValueColor?: HmiProperty<HmiColor>;
  currentValueFont?: HmiFont;
  engineeringUnitVisible?: HmiProperty<boolean>;
  useVariableEngineeringUnit?: HmiProperty<boolean>;
  engineeringUnitColor?: HmiProperty<HmiColor>;
  engineeringUnitFont?: HmiFont;
  targetValue?: HmiProperty<number>;
  targetEnabled?: HmiProperty<boolean>;
  useVariableTarget?: HmiProperty<boolean>;
  targetColor?: HmiProperty<HmiColor>;
  expectedRangeColor?: HmiProperty<HmiColor>;
  targetHighDeviation?: HmiProperty<number>;
  targetLowDeviation?: HmiProperty<number>;
  setpointValue?: HmiProperty<number>;
  setpointEnabled?: HmiProperty<boolean>;
  thresholdHighHigh?: HmiProperty<number>;
  thresholdHigh?: HmiProperty<number>;
  thresholdLow?: HmiProperty<number>;
  thresholdLowLow?: HmiProperty<number>;
  controlLimitHighHigh?: HmiProperty<number>;
  controlLimitHigh?: HmiProperty<number>;
  controlLimitLow?: HmiProperty<number>;
  controlLimitLowLow?: HmiProperty<number>;
  sparklineEnabled?: HmiProperty<boolean>;
  gaugeBarSize?: HmiProperty<number>;
  sparklineLineWidth?: HmiProperty<number>;
  sparklineDurationSeconds?: HmiProperty<number>;
  sparklineGridLineStyle?: HmiProperty<HmiLineStyle>;
  sparklineGridLineCount?: HmiProperty<number>;
  sparklineGridLineColor?: HmiProperty<HmiColor>;
  sparklineThresholdLinesVisible?: HmiProperty<boolean>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiGauge;
  }
}

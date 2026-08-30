import { HmiScaleWidgetBase } from "./HmiScaleWidgetBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiGaugeSweepStyle } from "./HmiGaugeSweepStyle.js";
import { HmiLineStyle } from "../base/HmiLineStyle.js";
import type { HmiColor } from "../base/HmiColor.js";
import type { HmiFont } from "../base/HmiFont.js";

export class HmiGauge extends HmiScaleWidgetBase {
  needleWidth?: HmiProperty<number>;
  needleColor?: HmiProperty<HmiColor>;
  sweepFillColor?: HmiProperty<HmiColor>;
  gaugeStyle?: HmiProperty<string>;
  valueIndicatorSize?: HmiProperty<string>;
  valueIndicatorColor?: HmiProperty<HmiColor>;
  alarmIndicatorVisible?: HmiProperty<boolean>;
  alarmIndicatorSize?: HmiProperty<string>;
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
  normalOperatingRangeColor?: HmiProperty<HmiColor>;
  useVariableThresholds?: HmiProperty<boolean>;
  highHighThresholdPresentation?: HmiGaugeThresholdPresentation;
  highThresholdPresentation?: HmiGaugeThresholdPresentation;
  lowThresholdPresentation?: HmiGaugeThresholdPresentation;
  lowLowThresholdPresentation?: HmiGaugeThresholdPresentation;
  controlLimitHighHigh?: HmiProperty<number>;
  controlLimitHigh?: HmiProperty<number>;
  controlLimitLow?: HmiProperty<number>;
  controlLimitLowLow?: HmiProperty<number>;
  useVariableControlLimits?: HmiProperty<boolean>;
  controlLimitHighHighEnabled?: HmiProperty<boolean>;
  controlLimitHighEnabled?: HmiProperty<boolean>;
  controlLimitLowEnabled?: HmiProperty<boolean>;
  controlLimitLowLowEnabled?: HmiProperty<boolean>;
  controlLimitIconSize?: HmiProperty<string>;
  withinControlLimitColor?: HmiProperty<HmiColor>;
  beyondControlLimitColor?: HmiProperty<HmiColor>;
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

export class HmiGaugeThresholdPresentation {
  enabled?: HmiProperty<boolean>;
  inactiveColor?: HmiProperty<HmiColor>;
  activeColor?: HmiProperty<HmiColor>;
  blink?: HmiProperty<boolean>;
}

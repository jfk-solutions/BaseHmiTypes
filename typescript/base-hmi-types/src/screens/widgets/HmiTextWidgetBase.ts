import type { HmiInputBehavior } from "../base/HmiUnifiedTagDynamization.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export abstract class HmiTextWidgetBase extends HmiWidgetBase {
  processValue?: HmiProperty<string>;
  ioFieldType?: HmiProperty<string>;
  inputBehavior?: HmiInputBehavior;

  text?: HmiProperty<HmiMultilingualText>;
  alternateText?: HmiProperty<HmiMultilingualText>;
  readOnly?: HmiProperty<boolean>;
  outputFormat?: HmiProperty<string>;
  formatPattern?: HmiProperty<string>;
  fieldLength?: HmiProperty<number>;
  fitToLargest?: HmiProperty<boolean>;
  resizable?: HmiProperty<boolean>;
  extraHeightOffset?: HmiProperty<number>;
  aboveUpperLimitColor?: HmiProperty<HmiColor>;
  belowLowerLimitColor?: HmiProperty<HmiColor>;
}

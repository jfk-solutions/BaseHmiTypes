import { HmiColor, HmiFont, HmiProperty } from "../base.js";
import { HmiWidgetBase } from "./HmiWidgetBase.js";

export abstract class HmiScaleWidgetBase extends HmiWidgetBase {
  value?: HmiProperty<number>;
  fillLevel?: HmiProperty<number>;
  showFillLevel?: HmiProperty<boolean>;
  showScale?: HmiProperty<boolean>;
  drawInsideFrame?: HmiProperty<boolean>;
  showTickLabels?: HmiProperty<boolean>;
  useAutoScaling?: HmiProperty<boolean>;
  showLimitRanges?: HmiProperty<boolean>;
  beginValue?: HmiProperty<number>;
  endValue?: HmiProperty<number>;
  originValue?: HmiProperty<number>;
  divisionCount?: HmiProperty<number>;
  subDivisionCount?: HmiProperty<number>;
  barMode?: HmiProperty<number>;
  scaleMode?: HmiProperty<number>;
  orientation?: HmiProperty<number>;
  showValue?: HmiProperty<boolean>;
  valuePosition?: HmiProperty<number>;
  labelColor?: HmiProperty<HmiColor>;
  scaleBackgroundColor?: HmiProperty<HmiColor>;
  scaleForegroundColor?: HmiProperty<HmiColor>;
  tickColor?: HmiProperty<HmiColor>;
  labelFont?: HmiFont;
}

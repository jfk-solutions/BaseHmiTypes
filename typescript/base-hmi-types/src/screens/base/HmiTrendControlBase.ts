import { HmiControlWindowBase } from "./HmiControlWindowBase.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendChartStyle } from "./HmiTrendChartStyle.js";
import { HmiTrendPen } from "./HmiTrendPen.js";
import { HmiTrendUpdateMode } from "./HmiTrendUpdateMode.js";

export abstract class HmiTrendControlBase extends HmiControlWindowBase {
  readonly pens: HmiTrendPen[] = [];
  minimumValue?: HmiProperty<number>;
  maximumValue?: HmiProperty<number>;
  chartStyle?: HmiProperty<HmiTrendChartStyle>;
  xAxisPenNumber?: HmiProperty<number>;
  updateMode?: HmiProperty<HmiTrendUpdateMode>;
  refreshRateMilliseconds?: HmiProperty<number>;
  heartbeatMilliseconds?: HmiProperty<number>;
  deadbandPercent?: HmiProperty<number>;
}

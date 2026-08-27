import { HmiControlWindowBase } from "./HmiControlWindowBase.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendChartStyle } from "./HmiTrendChartStyle.js";
import { HmiTrendDataPointConnection } from "./HmiTrendDataPointConnection.js";
import { HmiTrendNumericRadix } from "./HmiTrendNumericRadix.js";
import { HmiTrendPen } from "./HmiTrendPen.js";
import { HmiTrendTimeFormat } from "./HmiTrendTimeFormat.js";
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
  timeFormat?: HmiProperty<HmiTrendTimeFormat>;
  numericRadix?: HmiProperty<HmiTrendNumericRadix>;
  dataPointConnection?: HmiProperty<HmiTrendDataPointConnection>;
  displayMilliseconds?: HmiProperty<boolean>;
  displayPenIcons?: HmiProperty<boolean>;
}

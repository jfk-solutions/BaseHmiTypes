import { HmiControlWindowBase } from "./HmiControlWindowBase.js";
import { HmiColor } from "./HmiColor.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendChartStyle } from "./HmiTrendChartStyle.js";
import { HmiTrendDataPointConnection } from "./HmiTrendDataPointConnection.js";
import { HmiTrendNumericRadix } from "./HmiTrendNumericRadix.js";
import { HmiTrendPen } from "./HmiTrendPen.js";
import { HmiTrendScrollMode } from "./HmiTrendScrollMode.js";
import { HmiTrendTimeFormat } from "./HmiTrendTimeFormat.js";
import { HmiTrendUpdateMode } from "./HmiTrendUpdateMode.js";
import { HmiTrendYAxisRangeMode } from "./HmiTrendYAxisRangeMode.js";
import { HmiTrendYAxisScaleMode } from "./HmiTrendYAxisScaleMode.js";

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
  allowScrolling?: HmiProperty<boolean>;
  scrollMode?: HmiProperty<HmiTrendScrollMode>;
  bufferSizePerPen?: HmiProperty<number>;
  xAxisScaleVisible?: HmiProperty<boolean>;
  xAxisDateVisible?: HmiProperty<boolean>;
  xAxisGridVisible?: HmiProperty<boolean>;
  xAxisMajorGridLineCount?: HmiProperty<number>;
  xAxisMinorGridLineCount?: HmiProperty<number>;
  xAxisGridColor?: HmiProperty<HmiColor>;
  /** Engineering-system date text used at the left edge when scrolling is disabled. */
  xAxisStartDate?: string;
  /** Engineering-system time text used at the left edge when scrolling is disabled. */
  xAxisStartTime?: string;
  xAxisTimeSpan?: HmiProperty<number>;
  xAxisTimeSpanUnit?: string;
  yAxisRangeMode?: HmiProperty<HmiTrendYAxisRangeMode>;
  yAxisIsolatedGraphing?: HmiProperty<boolean>;
  yAxisIsolationPercent?: HmiProperty<number>;
  yAxisScaleVisible?: HmiProperty<boolean>;
  yAxisDecimalPlaces?: HmiProperty<number>;
  yAxisGridVisible?: HmiProperty<boolean>;
  yAxisMajorGridLineCount?: HmiProperty<number>;
  yAxisMinorGridLineCount?: HmiProperty<number>;
  yAxisGridColor?: HmiProperty<HmiColor>;
  yAxisScaleMode?: HmiProperty<HmiTrendYAxisScaleMode>;
  yAxisScalePenNumber?: HmiProperty<number>;
}

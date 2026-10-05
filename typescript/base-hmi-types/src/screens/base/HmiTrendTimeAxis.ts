import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiColor } from "./HmiColor.js";
import { HmiVerticalAlignment } from "./HmiVerticalAlignment.js";
import { HmiTrendTimeFormat } from "./HmiTrendTimeFormat.js";
import { HmiTrendTimeRangeType } from "./HmiTrendTimeRangeType.js";

/** A named time axis configured independently of trend pens. */
export class HmiTrendTimeAxis {
  name?: string;
  trendWindowName?: string;
  visible?: HmiProperty<boolean>;
  showDate?: HmiProperty<boolean>;
  dateFormat?: HmiProperty<string>;
  color?: HmiProperty<HmiColor>;
  inTrendColor?: HmiProperty<boolean>;
  alignment?: HmiProperty<HmiVerticalAlignment>;
  label?: string;
  labelText?: HmiMultilingualText;
  timeFormat?: HmiProperty<HmiTrendTimeFormat>;
  displayMilliseconds?: HmiProperty<boolean>;
  timeRangeBaseCode?: HmiProperty<number>;
  timeRangeFactor?: HmiProperty<number>;
  timeRangeBaseMilliseconds?: HmiProperty<number>;
  timeSpan?: HmiProperty<number>;
  timeSpanUnit?: string;
  rangeType?: HmiProperty<HmiTrendTimeRangeType>;
  /** ISO 8601 timestamp with an explicit offset. */
  startTime?: HmiProperty<string>;
  /** ISO 8601 timestamp with an explicit offset. */
  endTime?: HmiProperty<string>;
  measurementPoints?: HmiProperty<number>;
  refreshEnabled?: HmiProperty<boolean>;
}

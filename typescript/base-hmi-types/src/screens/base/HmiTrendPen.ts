import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor } from "./HmiColor.js";
import { HmiLineStyle } from "./HmiLineStyle.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendPenType } from "./HmiTrendPenType.js";
import { HmiTrendLineType } from "./HmiTrendLineType.js";
import { HmiTrendAxisScaleType } from "./HmiTrendAxisScaleType.js";
import { HmiVerticalAlignment } from "./HmiVerticalAlignment.js";
import { HmiHorizontalAlignment } from "./HmiHorizontalAlignment.js";

export class HmiTrendPen {
  /** One-based pen number as exposed by the engineering system. */
  number = 0;
  name?: string;
  label?: string;
  labelText?: HmiMultilingualText;
  /** Named trend window assigned to this pen. */
  trendWindowName?: string;
  /** Named time axis assigned to this pen. */
  timeAxisName?: string;
  value?: HmiProperty<number>;
  color?: HmiProperty<HmiColor>;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  type?: HmiProperty<HmiTrendPenType>;
  lineType?: HmiProperty<HmiTrendLineType>;
  style?: HmiProperty<HmiLineStyle>;
  /** Whether the area below the trend line is filled. */
  fillVisible?: HmiProperty<boolean>;
  /** Area-fill color independently of the trend line color. */
  fillColor?: HmiProperty<HmiColor>;
  lowerLimitColoring?: HmiProperty<boolean>;
  lowerLimitValue?: HmiProperty<number>;
  lowerLimitColor?: HmiProperty<HmiColor>;
  upperLimitColoring?: HmiProperty<boolean>;
  upperLimitValue?: HmiProperty<number>;
  upperLimitColor?: HmiProperty<HmiColor>;
  /** Whether uncertain-quality values use a dedicated color. */
  uncertainColoring?: HmiProperty<boolean>;
  /** Color used for uncertain-quality values. */
  uncertainColor?: HmiProperty<HmiColor>;
  /** Whether alarm symbols are displayed for limit violations. */
  showAlarms?: HmiProperty<boolean>;
  /** Vertical alignment of labels for the values-only trend type. */
  valueAlignment?: HmiProperty<HmiVerticalAlignment>;
  /** Engineering-system marker name or numeric marker identifier. */
  marker?: HmiProperty<string>;
  /** Marker color independently of the trend line color. */
  markerColor?: HmiProperty<HmiColor>;
  /** Marker width in pixels. */
  markerSize?: HmiProperty<number>;
  minimumValue?: HmiProperty<number>;
  maximumValue?: HmiProperty<number>;
  /** Scaling type of the value axis assigned to this pen. */
  axisScaleType?: HmiProperty<HmiTrendAxisScaleType>;
  /** Whether values on this pen's axis use exponential notation. */
  exponentialFormat?: HmiProperty<boolean>;
  /** Whether decimal precision is derived automatically from the axis range. */
  autoDecimalPlaces?: HmiProperty<boolean>;
  /** Fixed decimal precision of the value axis assigned to this pen. */
  decimalPlaces?: HmiProperty<number>;
  valueAxisDivisionCount?: HmiProperty<number>;
  valueAxisAutoScale?: HmiProperty<boolean>;
  /** Identity of the shared value axis assigned to this pen. */
  valueAxisName?: string;
  valueAxisVisible?: HmiProperty<boolean>;
  valueAxisColor?: HmiProperty<HmiColor>;
  valueAxisInTrendColor?: HmiProperty<boolean>;
  valueAxisAlignment?: HmiProperty<HmiHorizontalAlignment>;
  valueAxisLabel?: string;
  valueAxisLabelText?: HmiMultilingualText;
  /** Current minimum value used to scale this pen. */
  currentScaleMinimumValue?: HmiProperty<number>;
  /** Current maximum value used to scale this pen. */
  currentScaleMaximumValue?: HmiProperty<number>;
  /** Whether the pen's current value is in an error state. */
  isInError?: HmiProperty<boolean>;
  linkData?: HmiProperty<boolean>;
  dataLogModelName?: string;
  dataSourceName?: string;
  dataSourcePath?: string;
  dataSourceApplication?: string;
  description?: string;
  engineeringUnit?: string;
  engineeringUnitText?: HmiMultilingualText;
  logarithmicScale?: HmiProperty<boolean>;
  /** FactoryTalk pen index used as the lower boundary of a shaded range. */
  lowerBoundPenIndex?: HmiProperty<number>;
  /** FactoryTalk pen index used as the upper boundary of a shaded range. */
  upperBoundPenIndex?: HmiProperty<number>;
}

import { HmiProperty } from "./HmiProperty.js";
import { HmiColor } from "./HmiColor.js";
import { HmiHorizontalAlignment } from "./HmiHorizontalAlignment.js";
import { HmiTrendAxisScaleType } from "./HmiTrendAxisScaleType.js";

/** A configured value axis, independent of whether any pen uses it. */
export class HmiTrendValueAxis {
  name?: string;
  /** Trend window assigned to this axis, independent of pen assignments. */
  trendWindowName?: string;
  label?: string;
  minimumValue?: HmiProperty<number>;
  maximumValue?: HmiProperty<number>;
  visible?: HmiProperty<boolean>;
  decimalPlaces?: HmiProperty<number>;
  autoScale?: HmiProperty<boolean>;
  scaleType?: HmiProperty<HmiTrendAxisScaleType>;
  exponentialFormat?: HmiProperty<boolean>;
  autoDecimalPlaces?: HmiProperty<boolean>;
  color?: HmiProperty<HmiColor>;
  inTrendColor?: HmiProperty<boolean>;
  alignment?: HmiProperty<HmiHorizontalAlignment>;
}

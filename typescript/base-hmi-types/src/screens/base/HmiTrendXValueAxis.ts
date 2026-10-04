import { HmiProperty } from "./HmiProperty.js";
import { HmiColor } from "./HmiColor.js";
import { HmiVerticalAlignment } from "./HmiVerticalAlignment.js";
import { HmiTrendAxisScaleType } from "./HmiTrendAxisScaleType.js";

/** A configured numeric X axis of an XY plot, independent of curve assignments. */
export class HmiTrendXValueAxis {
  name?: string;
  trendWindowName?: string;
  label?: string;
  minimumValue?: HmiProperty<number>;
  maximumValue?: HmiProperty<number>;
  visible?: HmiProperty<boolean>;
  /** Whether the range must be determined from runtime curve values. */
  autoRange?: HmiProperty<boolean>;
  divisionCount?: HmiProperty<number>;
  decimalPlaces?: HmiProperty<number>;
  scaleType?: HmiProperty<HmiTrendAxisScaleType>;
  exponentialFormat?: HmiProperty<boolean>;
  color?: HmiProperty<HmiColor>;
  alignment?: HmiProperty<HmiVerticalAlignment>;
}

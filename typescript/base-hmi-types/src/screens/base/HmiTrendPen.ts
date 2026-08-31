import { HmiColor } from "./HmiColor.js";
import { HmiLineStyle } from "./HmiLineStyle.js";
import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendPenType } from "./HmiTrendPenType.js";

export class HmiTrendPen {
  /** One-based pen number as exposed by the engineering system. */
  number = 0;
  name?: string;
  value?: HmiProperty<number>;
  color?: HmiProperty<HmiColor>;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  type?: HmiProperty<HmiTrendPenType>;
  style?: HmiProperty<HmiLineStyle>;
  /** Engineering-system marker name or numeric marker identifier. */
  marker?: HmiProperty<string>;
  minimumValue?: HmiProperty<number>;
  maximumValue?: HmiProperty<number>;
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
  logarithmicScale?: HmiProperty<boolean>;
  /** FactoryTalk pen index used as the lower boundary of a shaded range. */
  lowerBoundPenIndex?: HmiProperty<number>;
  /** FactoryTalk pen index used as the upper boundary of a shaded range. */
  upperBoundPenIndex?: HmiProperty<number>;
}

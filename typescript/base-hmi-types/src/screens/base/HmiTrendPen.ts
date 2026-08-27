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
  linkData?: HmiProperty<boolean>;
  dataLogModelName?: string;
  description?: string;
  engineeringUnit?: string;
  logarithmicScale?: HmiProperty<boolean>;
  /** FactoryTalk pen index used as the lower boundary of a shaded range. */
  lowerBoundPenIndex?: HmiProperty<number>;
  /** FactoryTalk pen index used as the upper boundary of a shaded range. */
  upperBoundPenIndex?: HmiProperty<number>;
}

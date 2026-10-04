import { HmiProperty } from "./HmiProperty.js";
import { HmiColor } from "./HmiColor.js";

/** A separately laid out plotting window within a trend control. */
export class HmiTrendWindow {
  name?: string;
  visible?: HmiProperty<boolean>;
  spacePortion?: HmiProperty<number>;
  /** Relative height of the area; preserves fractional engineering values. */
  sizeFactor?: HmiProperty<number>;
  backgroundColor?: HmiProperty<HmiColor>;
  xAxisGridVisible?: HmiProperty<boolean>;
  yAxisGridVisible?: HmiProperty<boolean>;
  majorGridVisible?: HmiProperty<boolean>;
  majorGridColor?: HmiProperty<HmiColor>;
  minorGridVisible?: HmiProperty<boolean>;
  minorGridColor?: HmiProperty<HmiColor>;
  gridInTrendColor?: HmiProperty<boolean>;
  useGraphicValueBar?: HmiProperty<boolean>;
  valueBarColor?: HmiProperty<HmiColor>;
  valueBarWidth?: HmiProperty<number>;
  useGraphicStatisticRulers?: HmiProperty<boolean>;
  statisticRulerColor?: HmiProperty<HmiColor>;
  statisticRulerWidth?: HmiProperty<number>;
}

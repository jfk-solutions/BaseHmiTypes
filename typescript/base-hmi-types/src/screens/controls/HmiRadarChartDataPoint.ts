import { HmiProperty } from "../base/HmiProperty.js";

export class HmiRadarChartDataPoint {
  categoryIndex?: number;
  categoryName?: string;
  tag?: string;
  constantValue?: HmiProperty<number>;
  sourceValue?: string;
}

import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiColor } from "../base/HmiColor.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiRadarChartDataPoint } from "./HmiRadarChartDataPoint.js";

export class HmiRadarChartSeries {
  index?: number;
  name?: HmiMultilingualText;
  lineAndMarker?: string;
  lineColor?: HmiProperty<HmiColor>;
  fillColor?: HmiProperty<HmiColor>;
  readonly dataPoints: HmiRadarChartDataPoint[] = [];
}

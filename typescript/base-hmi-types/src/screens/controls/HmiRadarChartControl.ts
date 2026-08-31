import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiColor } from "../base/HmiColor.js";
import { HmiFont } from "../base/HmiFont.js";
import { HmiLineStyle } from "../base/HmiLineStyle.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiRadarLegendPosition } from "./HmiRadarLegendPosition.js";
import { HmiRadarShape } from "./HmiRadarShape.js";
import { HmiRadarChartCategory } from "./HmiRadarChartCategory.js";
import { HmiRadarChartSeries } from "./HmiRadarChartSeries.js";

/**
 * Represents a radar/spider chart control. Product-specific chart payloads can
 * remain attached through the inherited source-data fields until decoded.
 */
export class HmiRadarChartControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRadarChartControl;
  }

  title?: HmiMultilingualText;
  seriesCount?: HmiProperty<number>;
  categoryCount?: HmiProperty<number>;
  radarShape?: HmiProperty<HmiRadarShape>;
  sourceRadarShape?: string;
  chartBackgroundColor?: HmiProperty<HmiColor>;
  gridLineStyle?: HmiProperty<HmiLineStyle>;
  sourceGridLineStyle?: string;
  gridLineColor?: HmiProperty<HmiColor>;
  bandedColor?: HmiProperty<HmiColor>;
  showLegend?: HmiProperty<boolean>;
  legendPosition?: HmiProperty<HmiRadarLegendPosition>;
  sourceLegendPosition?: string;
  decimalPlaces?: HmiProperty<number>;
  refreshRateSeconds?: HmiProperty<number>;
  titleFont?: HmiFont;
  categoryFont?: HmiFont;
  legendFont?: HmiFont;
  dataLabelFont?: HmiFont;
  readonly categories: HmiRadarChartCategory[] = [];
  readonly series: HmiRadarChartSeries[] = [];
}

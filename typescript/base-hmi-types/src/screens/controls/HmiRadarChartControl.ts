import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

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
}

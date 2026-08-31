import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base/HmiProperty.js";

export class HmiRadarChartCategory {
  index?: number;
  name?: HmiMultilingualText;
  minimum?: HmiProperty<number>;
  maximum?: HmiProperty<number>;
}

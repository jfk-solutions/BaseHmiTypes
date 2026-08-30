import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";
import { HmiAlarmToolbarButtonType } from "./HmiAlarmToolbarButtonType.js";

export class HmiAlarmToolbarButton {
  type = HmiAlarmToolbarButtonType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  order?: HmiProperty<number>;
  caption?: HmiMultilingualText;
  tooltip?: HmiMultilingualText;
  format?: string;
}

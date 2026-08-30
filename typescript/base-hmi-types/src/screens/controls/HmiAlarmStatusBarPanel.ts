import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";
import { HmiAlarmStatusBarPanelType } from "./HmiAlarmStatusBarPanelType.js";

export class HmiAlarmStatusBarPanel {
  type = HmiAlarmStatusBarPanelType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  order?: HmiProperty<number>;
  tooltip?: HmiMultilingualText;
}

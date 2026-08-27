import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiProperty } from "../base.js";
import { HmiAlarmColumnType } from "./HmiAlarmColumnType.js";

export class HmiAlarmColumn {
  type = HmiAlarmColumnType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  timeAndDateFormat?: string;
  headerText?: HmiMultilingualText;
  symbol?: string;
}

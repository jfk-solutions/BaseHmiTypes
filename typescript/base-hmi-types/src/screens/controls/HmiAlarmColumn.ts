import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiHorizontalAlignment, HmiProperty } from "../base.js";
import { HmiAlarmColumnType } from "./HmiAlarmColumnType.js";

export class HmiAlarmColumn {
  type = HmiAlarmColumnType.Unknown;
  sourceType?: string;
  visible?: HmiProperty<boolean>;
  width?: HmiProperty<number>;
  autoSize?: HmiProperty<boolean>;
  decimalPlaces?: HmiProperty<number>;
  /** Configured native leading-zero setting, without assuming a formatting range. */
  leadingZeros?: HmiProperty<number>;
  automaticDecimalPlaces?: HmiProperty<boolean>;
  exponentialFormat?: HmiProperty<boolean>;
  timeAndDateFormat?: string;
  headerText?: HmiMultilingualText;
  symbol?: string;
  alignment?: HmiProperty<HmiHorizontalAlignment>;
  order?: HmiProperty<number>;
}

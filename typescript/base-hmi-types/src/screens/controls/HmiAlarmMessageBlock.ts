import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiHorizontalAlignment, HmiProperty } from "../base.js";
/** A configured message block independent of displayed alarm columns. */
export class HmiAlarmMessageBlock {
  name?: string;
  caption?: HmiMultilingualText;
  alignment?: HmiProperty<HmiHorizontalAlignment>;
  decimalPlaces?: HmiProperty<number>;
  leadingZeros?: HmiProperty<number>;
  automaticDecimalPlaces?: HmiProperty<boolean>;
  exponentialFormat?: HmiProperty<boolean>;
  dateFormat?: string;
  timeFormat?: string;
  showDate?: HmiProperty<boolean>;
}

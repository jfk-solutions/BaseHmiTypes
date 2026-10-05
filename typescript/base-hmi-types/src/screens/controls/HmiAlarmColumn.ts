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
  dateFormat?: string;
  timeFormat?: string;
  showDate?: HmiProperty<boolean>;
  headerText?: HmiMultilingualText;
  symbol?: string;
  alignment?: HmiProperty<HmiHorizontalAlignment>;
  order?: HmiProperty<number>;
  allowSort?: HmiProperty<boolean>;
  /** Configured Unified sorting priority, separate from column layout order. */
  sortOrder?: HmiProperty<number>;
  /** Configured Unified sort direction; unknown native codes remain available. */
  sortDirection?: HmiProperty<number>;
  /** Native row-sort mode, separate from column layout order. */
  sortMode?: HmiProperty<number>;
  /** Native sort priority; zero removes this criterion. */
  sortIndex?: HmiProperty<number>;
}

import { HmiAlarmColumn } from "./HmiAlarmColumn.js";
import type { HmiProperty, HmiColor, HmiFont } from "../base.js";

/** A named column configuration, such as a message list or statistics list. */
export class HmiAlarmColumnSet {
  name?: string;
  allowSort?: HmiProperty<boolean>;
  allowFilter?: HmiProperty<boolean>;
  allowColumnReorder?: HmiProperty<boolean>;
  allowColumnResize?: HmiProperty<boolean>;
  backgroundColor?: HmiProperty<HmiColor>;
  foregroundColor?: HmiProperty<HmiColor>;
  headerBackgroundColor?: HmiProperty<HmiColor>;
  headerForegroundColor?: HmiProperty<HmiColor>;
  headerBorderColor?: HmiProperty<HmiColor>;
  contentFont?: HmiFont;
  headerFont?: HmiFont;
  readonly columns: HmiAlarmColumn[] = [];
}

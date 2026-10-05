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
  gridLineColor?: HmiProperty<HmiColor>;
  gridLineWidth?: HmiProperty<number>;
  /** Native visibility code; unknown values are not treated as flags. */
  gridLineVisibility?: HmiProperty<number>;
  cellPaddingLeft?: HmiProperty<number>;
  cellPaddingTop?: HmiProperty<number>;
  cellPaddingRight?: HmiProperty<number>;
  cellPaddingBottom?: HmiProperty<number>;
  /** Configured row height; zero requests automatic sizing. */
  rowHeight?: HmiProperty<number>;
  horizontalScrollBarVisibility?: HmiProperty<number>;
  verticalScrollBarVisibility?: HmiProperty<number>;
  gridSelectionMode?: HmiProperty<number>;
  selectFullRow?: HmiProperty<boolean>;
  readonly columns: HmiAlarmColumn[] = [];
}

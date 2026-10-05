import { HmiAlarmColumn } from "./HmiAlarmColumn.js";
import type { HmiProperty } from "../base.js";

/** A named column configuration, such as a message list or statistics list. */
export class HmiAlarmColumnSet {
  name?: string;
  allowSort?: HmiProperty<boolean>;
  allowFilter?: HmiProperty<boolean>;
  allowColumnReorder?: HmiProperty<boolean>;
  allowColumnResize?: HmiProperty<boolean>;
  readonly columns: HmiAlarmColumn[] = [];
}

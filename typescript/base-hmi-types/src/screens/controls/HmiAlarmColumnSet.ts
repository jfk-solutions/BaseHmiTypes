import { HmiAlarmColumn } from "./HmiAlarmColumn.js";

/** A named column configuration, such as a message list or statistics list. */
export class HmiAlarmColumnSet {
  name?: string;
  readonly columns: HmiAlarmColumn[] = [];
}

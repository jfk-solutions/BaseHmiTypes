import { HmiAlarmColumnType } from "./HmiAlarmColumnType.js";
import { HmiAlarmSortDirection } from "./HmiAlarmSortDirection.js";

export class HmiAlarmSortCriterion {
  column = HmiAlarmColumnType.Unknown;
  sourceColumn?: string;
  direction = HmiAlarmSortDirection.Unknown;
  sourceDirection?: string;
}

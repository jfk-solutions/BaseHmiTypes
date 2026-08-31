import { HmiAlarmSortDirection } from "./HmiAlarmSortDirection.js";
import { HmiSystemDiagnosisColumnType } from "./HmiSystemDiagnosisColumnType.js";

export class HmiSystemDiagnosisSortCriterion {
  column = HmiSystemDiagnosisColumnType.Unknown;
  sourceColumn?: string;
  direction = HmiAlarmSortDirection.Unknown;
  sourceDirection?: string;
}

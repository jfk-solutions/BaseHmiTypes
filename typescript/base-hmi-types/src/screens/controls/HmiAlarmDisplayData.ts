/** Detached presentation snapshot supplied by a runtime, independently of PLC transport. */
export interface HmiAlarmDisplayRow {
  key: string;
  text: string;
  active: boolean;
  acknowledged: boolean;
  canAcknowledge?: boolean;
  cells: Readonly<Record<string, string>>;
}
export interface HmiAlarmDisplayData {
  rows: readonly HmiAlarmDisplayRow[];
  selectedKeys?: readonly string[];
}

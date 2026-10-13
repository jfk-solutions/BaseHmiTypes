import type { IHmiObject } from "../IHmiObject.js";
import type { HmiMultilingualText } from "../common/HmiMultilingualText.js";
import { HmiTriggerKind, type HmiTrigger } from "../screens/base/HmiProperty.js";
import type { HmiEventBinding } from "../scripts/HmiEventBinding.js";

export class HmiScheduledTask implements IHmiObject {
  id?: string;
  name?: string;
  comment?: HmiMultilingualText;
  enabled = true;
  readonly triggers: HmiTrigger[] = [];
  readonly events: HmiEventBinding[] = [];
  readonly unsupportedTriggers: string[] = [];
}
export interface HmiCalendarTrigger extends HmiTrigger {
  readonly kind: HmiTriggerKind.Calendar;
  schedule: 'Once' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  hour: number; minute: number; second: number;
  day?: number; month?: number; year?: number;
  /** Sunday = 0, Saturday = 6. */
  weekday?: number;
}
export interface HmiAlarmTrigger extends HmiTrigger {
  readonly kind: HmiTriggerKind.Alarm;
  criteria: HmiAlarmTriggerCriterion[];
}
export interface HmiAlarmTriggerCriterion {
  attribute: string;
  operator: string;
  value: string;
  /** Equivalent identifiers for mapped controller alarm classes. */
  values?: string[];
  andOrOperation: 'AND' | 'OR';
}

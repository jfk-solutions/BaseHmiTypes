import { HmiProperty } from "../base.js";
import { HmiAlarmEventPriority } from "./HmiAlarmEventPriority.js";

export class HmiAlarmEventSubscription {
  name?: string;
  isDefault?: HmiProperty<boolean>;
  readonly priorities: HmiAlarmEventPriority[] = [];
  readonly sourcePriorities: string[] = [];
  readonly scopes: string[] = [];
  readonly eventSources: string[] = [];
}

import { HmiColor, HmiProperty } from "../base.js";
import { HmiAlarmCondition } from "./HmiAlarmCondition.js";

export class HmiAlarmConditionPresentation {
  condition = HmiAlarmCondition.ActiveAcknowledged;
  display?: HmiProperty<boolean>;
  blink?: HmiProperty<boolean>;
  useAlarmColors?: HmiProperty<boolean>;
  backgroundColor?: HmiProperty<HmiColor>;
  foregroundColor?: HmiProperty<HmiColor>;
}

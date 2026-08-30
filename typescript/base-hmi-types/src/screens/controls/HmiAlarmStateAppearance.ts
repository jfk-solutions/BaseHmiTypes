import { HmiColor, HmiProperty } from "../base.js";
import { HmiAlarmStateAppearanceType } from "./HmiAlarmStateAppearanceType.js";

export class HmiAlarmStateAppearance {
  type = HmiAlarmStateAppearanceType.Unknown;
  sourceType?: string;
  foregroundColor?: HmiProperty<HmiColor>;
  backgroundColor?: HmiProperty<HmiColor>;
  blink?: HmiProperty<boolean>;
}

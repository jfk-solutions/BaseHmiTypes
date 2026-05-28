import { HmiColor, HmiProperty } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";

export class HmiAlarmIndicator extends HmiSimpleScreenItemBase {
  isFlashingRequired?: HmiProperty<boolean>;
  flashingColor?: HmiProperty<HmiColor>;
  flashingRate?: HmiProperty<number>;
  alarmState?: HmiProperty<number>;
  noAlarmState?: HmiProperty<number>;
  numberOfAlarms?: HmiProperty<number>;
  showAcknowledgedAlarmClasses?: HmiProperty<number[]>;
  showPendingAlarmClasses?: HmiProperty<number[]>;
}

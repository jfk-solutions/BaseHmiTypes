import { HmiProperty } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiAlarmLineControl extends HmiSimpleScreenItemBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiAlarmLineControl;
  }

  suppressFlashing?: HmiProperty<boolean>;
  acknowledgmentFlashingRate?: HmiProperty<number>;
  resetFlashingRate?: HmiProperty<number>;
  numberOfRows?: HmiProperty<number>;
  queueNewAlarms?: HmiProperty<boolean>;
  showTriggerValue?: HmiProperty<boolean>;
  showTriggerLabel?: HmiProperty<boolean>;
  showInactiveAlarms?: HmiProperty<boolean>;
  showAlarmState?: HmiProperty<boolean>;
  showAlarmTime?: HmiProperty<boolean>;
  alarmTimeFormat?: string;
  readonly filteredTriggers: string[] = [];
}

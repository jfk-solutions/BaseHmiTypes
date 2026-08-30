import { HmiFont, HmiHorizontalAlignment, HmiProperty } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiAlarmLineViewKind } from "./HmiAlarmLineViewKind.js";

export class HmiAlarmLineControl extends HmiSimpleScreenItemBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiAlarmLineControl;
  }

  suppressFlashing?: HmiProperty<boolean>;
  viewKind = HmiAlarmLineViewKind.Unknown;
  acknowledgmentFlashingRate?: HmiProperty<number>;
  resetFlashingRate?: HmiProperty<number>;
  numberOfRows?: HmiProperty<number>;
  font?: HmiFont;
  wordWrap?: HmiProperty<boolean>;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  useAlarmColors?: HmiProperty<boolean>;
  messageBlink?: HmiProperty<boolean>;
  useAlarmIdentifier?: HmiProperty<boolean>;
  alarmIdentifier?: HmiProperty<number>;
  queueNewAlarms?: HmiProperty<boolean>;
  showTriggerValue?: HmiProperty<boolean>;
  showTriggerLabel?: HmiProperty<boolean>;
  showInactiveAlarms?: HmiProperty<boolean>;
  showAlarmState?: HmiProperty<boolean>;
  showAlarmTime?: HmiProperty<boolean>;
  alarmTimeFormat?: string;
  readonly filteredTriggers: string[] = [];
}

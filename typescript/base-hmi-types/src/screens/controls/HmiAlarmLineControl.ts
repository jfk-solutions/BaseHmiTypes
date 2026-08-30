import { HmiColor, HmiFont, HmiHorizontalAlignment, HmiProperty } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiAlarmLineViewKind } from "./HmiAlarmLineViewKind.js";
import { HmiAlarmRowDoubleClickAction } from "./HmiAlarmRowDoubleClickAction.js";
import { HmiAlarmColumn } from "./HmiAlarmColumn.js";
import { HmiAlarmTimePrecision } from "./HmiAlarmTimePrecision.js";
import { HmiAlarmSortCriterion } from "./HmiAlarmSortCriterion.js";
import { HmiAlarmEventSubscription } from "./HmiAlarmEventSubscription.js";
import { HmiAlarmBlinkRate } from "./HmiAlarmBlinkRate.js";
import { HmiAlarmStateAppearance } from "./HmiAlarmStateAppearance.js";

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
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  iconStyle?: HmiProperty<string>;
  rowDoubleClickAction?: HmiProperty<HmiAlarmRowDoubleClickAction>;
  showBorder?: HmiProperty<boolean>;
  statusBarFont?: HmiFont;
  statusBarButtonSize?: HmiProperty<string>;
  showTooltips?: HmiProperty<boolean>;
  showStatusBar?: HmiProperty<boolean>;
  alarmAndEventSummaryCommand?: HmiProperty<string>;
  displayErrorsInDialog?: HmiProperty<boolean>;
  maintainSelection?: HmiProperty<boolean>;
  showWaitingMessage?: HmiProperty<boolean>;
  alarmBellEnabled?: HmiProperty<boolean>;
  readonly columnDefinitions: HmiAlarmColumn[] = [];
  timePrecision?: HmiProperty<HmiAlarmTimePrecision>;
  sortOrder?: HmiProperty<string>;
  readonly sortCriteria: HmiAlarmSortCriterion[] = [];
  readonly eventSubscriptions: HmiAlarmEventSubscription[] = [];
  readonly stateAppearances: HmiAlarmStateAppearance[] = [];
  alarmBlinkRate?: HmiProperty<HmiAlarmBlinkRate>;
  alarmBlinkRateSource?: string;
  alarmSoundRepeatIntervalSeconds?: HmiProperty<number>;
  showTriggerValue?: HmiProperty<boolean>;
  showTriggerLabel?: HmiProperty<boolean>;
  showInactiveAlarms?: HmiProperty<boolean>;
  showAlarmState?: HmiProperty<boolean>;
  showAlarmTime?: HmiProperty<boolean>;
  alarmTimeFormat?: string;
  readonly filteredTriggers: string[] = [];
}

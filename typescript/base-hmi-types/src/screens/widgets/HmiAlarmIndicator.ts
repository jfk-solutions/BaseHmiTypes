import { HmiColor, HmiFillPattern, HmiFont, HmiHorizontalAlignment, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiAlarmIndicatorSegment } from "./HmiAlarmIndicatorSegment.js";
import { HmiAlarmIndicatorState } from "./HmiAlarmIndicatorState.js";

export class HmiAlarmIndicator extends HmiSimpleScreenItemBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiAlarmIndicator;
  }

  isFlashingRequired?: HmiProperty<boolean>;
  flashingColor?: HmiProperty<HmiColor>;
  isForegroundFlashingRequired?: HmiProperty<boolean>;
  flashingForegroundColor?: HmiProperty<HmiColor>;
  flashingRate?: HmiProperty<number>;
  alarmState?: HmiProperty<number>;
  visualState?: HmiProperty<HmiAlarmIndicatorState>;
  isGroupRelevant?: HmiProperty<boolean>;
  significantMask?: HmiProperty<number>;
  eventAcknowledgementMask?: HmiProperty<number>;
  useGlobalAlarmClasses?: HmiProperty<boolean>;
  useGlobalSettings?: HmiProperty<boolean>;
  userValue1?: HmiProperty<number>;
  userValue2?: HmiProperty<number>;
  userValue3?: HmiProperty<number>;
  userValue4?: HmiProperty<number>;
  noAlarmState?: HmiProperty<number>;
  numberOfAlarms?: HmiProperty<number>;
  text?: HmiProperty<string>;
  font?: HmiFont;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  verticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  useEqualSegmentWidths?: HmiProperty<boolean>;
  segments: HmiAlarmIndicatorSegment[] = [];
  isLocked?: HmiProperty<boolean>;
  lockedText?: HmiProperty<string>;
  lockedForegroundColor?: HmiProperty<HmiColor>;
  lockedBackgroundColor?: HmiProperty<HmiColor>;
  backFillPattern?: HmiProperty<number>;
  fillPattern?: HmiProperty<HmiFillPattern>;
  showAcknowledgedAlarmClasses?: HmiProperty<number[]>;
  showPendingAlarmClasses?: HmiProperty<number[]>;
}

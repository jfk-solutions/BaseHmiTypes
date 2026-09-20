import { HmiColor, HmiFont, HmiHorizontalAlignment, HmiProperty, HmiVerticalAlignment } from "../base.js";
import { HmiSimpleScreenItemBase } from "../base/HmiSimpleScreenItemBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiAlarmIndicatorSegment } from "./HmiAlarmIndicatorSegment.js";

export class HmiAlarmIndicator extends HmiSimpleScreenItemBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiAlarmIndicator;
  }

  isFlashingRequired?: HmiProperty<boolean>;
  flashingColor?: HmiProperty<HmiColor>;
  flashingRate?: HmiProperty<number>;
  alarmState?: HmiProperty<number>;
  noAlarmState?: HmiProperty<number>;
  numberOfAlarms?: HmiProperty<number>;
  text?: HmiProperty<string>;
  font?: HmiFont;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  verticalAlignment?: HmiProperty<HmiVerticalAlignment>;
  useEqualSegmentWidths?: HmiProperty<boolean>;
  segments: HmiAlarmIndicatorSegment[] = [];
  showAcknowledgedAlarmClasses?: HmiProperty<number[]>;
  showPendingAlarmClasses?: HmiProperty<number[]>;
}

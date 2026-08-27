import { HmiColor, HmiLineStyle, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiAlarmControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiAlarmControl;
  }

  suppressFlashing?: HmiProperty<boolean>;
  acknowledgmentFlashingRate?: HmiProperty<number>;
  resetFlashingRate?: HmiProperty<number>;
  numberOfRows?: HmiProperty<number>;
  wrapAround?: HmiProperty<boolean>;
  showHeader?: HmiProperty<boolean>;
  showAlarmTime?: HmiProperty<boolean>;
  showAcknowledgmentTime?: HmiProperty<boolean>;
  showAcknowledgeButton?: HmiProperty<boolean>;
  showHelpButton?: HmiProperty<boolean>;
  showPendingAlarms?: HmiProperty<boolean>;
  showAlarmsToAcknowledge?: HmiProperty<boolean>;
  sortByTimeEnabled?: HmiProperty<boolean>;
  messageAreaWidth?: HmiProperty<number>;
  messageAreaHeight?: HmiProperty<number>;
  alarmClasses?: HmiProperty<number[]>;
  columns?: HmiProperty<number[]>;
  columnOrder?: HmiProperty<number[]>;
  columnWidth?: HmiProperty<number[]>;
  minimumColumnWidth?: HmiProperty<number[]>;
  tableBackgroundColor?: HmiProperty<HmiColor>;
  tableForegroundColor?: HmiProperty<HmiColor>;
  tableHeaderBackgroundColor?: HmiProperty<HmiColor>;
  tableHeaderForegroundColor?: HmiProperty<HmiColor>;
  tableHeaderBorderBackgroundColor?: HmiProperty<HmiColor>;
  tableHeaderBorderColor?: HmiProperty<HmiColor>;
  tableHeaderBorderWidth?: HmiProperty<number>;
  tableHeaderBackFillStyle?: HmiProperty<number>;
  tableHeaderCornerRadius?: HmiProperty<number>;
  tableHeaderEdgeStyle?: HmiProperty<HmiLineStyle>;
  tableHeaderFirstGradientColor?: HmiProperty<HmiColor>;
  tableHeaderMiddleGradientColor?: HmiProperty<HmiColor>;
  tableHeaderSecondGradientColor?: HmiProperty<HmiColor>;
  gridLineColor?: HmiProperty<HmiColor>;
  buttonBackgroundColor?: HmiProperty<HmiColor>;
  buttonBorderBackgroundColor?: HmiProperty<HmiColor>;
  buttonBorderColor?: HmiProperty<HmiColor>;
  buttonBorderWidth?: HmiProperty<number>;
  buttonBackFillStyle?: HmiProperty<number>;
  buttonCornerRadius?: HmiProperty<number>;
  buttonEdgeStyle?: HmiProperty<HmiLineStyle>;
  buttonFirstGradientColor?: HmiProperty<HmiColor>;
  buttonFirstGradientOffset?: HmiProperty<number>;
  buttonMiddleGradientColor?: HmiProperty<HmiColor>;
  buttonSecondGradientColor?: HmiProperty<HmiColor>;
  buttonSecondGradientOffset?: HmiProperty<number>;
  buttonPositions?: HmiProperty<number[]>;
}

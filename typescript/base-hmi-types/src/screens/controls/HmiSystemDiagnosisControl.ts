import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiColor } from "../base/HmiColor.js";
import { HmiFont } from "../base/HmiFont.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiSystemDiagnosisViewKind } from "./HmiSystemDiagnosisViewKind.js";
import { HmiAlarmRowDoubleClickAction } from "./HmiAlarmRowDoubleClickAction.js";

export class HmiSystemDiagnosisControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSystemDiagnosisControl;
  }

  viewKind = HmiSystemDiagnosisViewKind.Unknown;
  wrapAround?: HmiProperty<boolean>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  showColumnHeadings?: HmiProperty<boolean>;
  showHorizontalGridLines?: HmiProperty<boolean>;
  showVerticalGridLines?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  showHorizontalScrollbar?: HmiProperty<boolean>;
  showVerticalScrollbar?: HmiProperty<boolean>;
  detailsPaneVisible?: HmiProperty<boolean>;
  detailsPaneAllowResize?: HmiProperty<boolean>;
  detailsPaneHeightPercent?: HmiProperty<number>;
  detailsPaneBackgroundColor?: HmiProperty<HmiColor>;
  detailsPaneForegroundColor?: HmiProperty<HmiColor>;
  detailsPaneFont?: HmiFont;
  showToolbar?: HmiProperty<boolean>;
  toolbarBackgroundColor?: HmiProperty<HmiColor>;
  toolbarForegroundColor?: HmiProperty<HmiColor>;
  toolbarFont?: HmiFont;
  toolbarIconSize?: HmiProperty<string>;
  showStatusBar?: HmiProperty<boolean>;
  statusBarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarForegroundColor?: HmiProperty<HmiColor>;
  statusBarFont?: HmiFont;
  statusBarIconSize?: HmiProperty<string>;
  showTooltips?: HmiProperty<boolean>;
  allowColumnResize?: HmiProperty<boolean>;
  allowSortByColumn?: HmiProperty<boolean>;
  displayContextMenu?: HmiProperty<boolean>;
  rowDoubleClickAction?: HmiProperty<HmiAlarmRowDoubleClickAction>;
  displayErrorsInDialog?: HmiProperty<boolean>;
  showWaitingMessage?: HmiProperty<boolean>;
}

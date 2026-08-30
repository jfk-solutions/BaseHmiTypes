import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";

export class HmiDataGridControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDataGridControl;
  }

  showExportCsv?: HmiProperty<boolean>;
  showProperties?: HmiProperty<boolean>;
  showStatusBar?: HmiProperty<boolean>;
  showToolbar?: HmiProperty<boolean>;
  toolbarIconSize?: HmiProperty<string>;
  maximumRows?: HmiProperty<number>;
  useLocalMachineTimeZone?: HmiProperty<boolean>;
  timePeriodAbsoluteMode?: HmiProperty<boolean>;
  timePeriodDuration?: HmiProperty<string>;
  timePeriodStart?: HmiProperty<string>;
  timePeriodEnd?: HmiProperty<string>;
}

import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiColor, HmiProperty } from "../base.js";

export class HmiDetailedParameterControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDetailedParameterControl;
  }
  parameterSetTypeFixed?: HmiProperty<boolean>;
  hideDetails?: HmiProperty<boolean>;
  /** Native editing-mode value; no cross-family enum translation is assumed. */
  editMode?: HmiProperty<number>;
  showToolbar?: HmiProperty<boolean>;
  showStatusBar?: HmiProperty<boolean>;
  toolbarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarForegroundColor?: HmiProperty<HmiColor>;
}

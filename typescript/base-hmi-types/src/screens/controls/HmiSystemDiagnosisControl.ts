import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiColor } from "../base/HmiColor.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiSystemDiagnosisViewKind } from "./HmiSystemDiagnosisViewKind.js";

export class HmiSystemDiagnosisControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSystemDiagnosisControl;
  }

  viewKind = HmiSystemDiagnosisViewKind.Unknown;
  wrapAround?: HmiProperty<boolean>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
}

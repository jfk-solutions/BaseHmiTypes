import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiSystemDiagnosisViewKind } from "./HmiSystemDiagnosisViewKind.js";

export class HmiSystemDiagnosisControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiSystemDiagnosisControl;
  }

  viewKind = HmiSystemDiagnosisViewKind.Unknown;
}

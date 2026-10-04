import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiProcessDiagnosisGraphOverviewControl extends HmiControlWindowBase {
  associatedGraphDbTagSourceId?: string;
  associatedGraphDbTagName?: string;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiProcessDiagnosisGraphOverviewControl;
  }
}

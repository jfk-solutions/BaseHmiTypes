import { HmiCompanionBase } from "../base/HmiCompanionBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiProcessDiagnosisCriteriaAnalysisControl extends HmiCompanionBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiProcessDiagnosisCriteriaAnalysisControl;
  }
}

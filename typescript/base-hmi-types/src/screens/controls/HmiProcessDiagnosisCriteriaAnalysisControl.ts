import { HmiCompanionBase } from "../base/HmiCompanionBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiColor } from "../base/HmiColor.js";

export class HmiProcessDiagnosisCriteriaAnalysisControl extends HmiCompanionBase {
  showGridLines?: HmiProperty<boolean>;
  showColumnHeadings?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiProcessDiagnosisCriteriaAnalysisControl;
  }
}

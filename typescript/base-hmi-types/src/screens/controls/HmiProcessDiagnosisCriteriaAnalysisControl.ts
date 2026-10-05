import { HmiCompanionBase } from "../base/HmiCompanionBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiColor } from "../base/HmiColor.js";

export class HmiProcessDiagnosisCriteriaAnalysisControl extends HmiCompanionBase {
  showGridLines?: HmiProperty<boolean>;
  showColumnHeadings?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;

  headerBorderBackgroundColor?: HmiProperty<HmiColor>;
  headerCornerRadius?: HmiProperty<number>;
  headerBackFillStyle?: HmiProperty<number>;
  headerEdgeStyle?: HmiProperty<number>;
  headerFirstGradientColor?: HmiProperty<HmiColor>;
  headerMiddleGradientColor?: HmiProperty<HmiColor>;
  headerSecondGradientColor?: HmiProperty<HmiColor>;
  headerFirstGradientOffset?: HmiProperty<number>;
  headerSecondGradientOffset?: HmiProperty<number>;
  useHeaderFirstGradient?: HmiProperty<boolean>;
  useHeaderSecondGradient?: HmiProperty<boolean>;

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiProcessDiagnosisCriteriaAnalysisControl;
  }
}

import { HmiColor, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiProcessDiagnosisPlcCodeViewerControl extends HmiControlWindowBase {
  drawingAreaBackgroundColor?: HmiProperty<HmiColor>;
  drawingAreaForegroundColor?: HmiProperty<HmiColor>;
  pathHeaderBackgroundColor?: HmiProperty<HmiColor>;
  pathHeaderForegroundColor?: HmiProperty<HmiColor>;
  showGridLines?: HmiProperty<boolean>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;
  gridLineColor?: HmiProperty<HmiColor>;
  toolbarBackgroundColor?: HmiProperty<HmiColor>;
  showToolbar?: HmiProperty<boolean>;
  useToolbarBackgroundColor?: HmiProperty<boolean>;
  toolbarAlignment?: HmiProperty<number>;
  buttonBackgroundColor?: HmiProperty<HmiColor>;
  buttonBorderBackgroundColor?: HmiProperty<HmiColor>;
  buttonBorderColor?: HmiProperty<HmiColor>;
  buttonFirstGradientColor?: HmiProperty<HmiColor>;
  buttonMiddleGradientColor?: HmiProperty<HmiColor>;
  buttonSecondGradientColor?: HmiProperty<HmiColor>;
  buttonBorderWidth?: HmiProperty<number>;
  buttonCornerRadius?: HmiProperty<number>;
  buttonEdgeStyle?: HmiProperty<number>;
  buttonBackFillStyle?: HmiProperty<number>;
  buttonFirstGradientOffset?: HmiProperty<number>;
  buttonSecondGradientOffset?: HmiProperty<number>;
  useButtonFirstGradient?: HmiProperty<boolean>;
  useButtonSecondGradient?: HmiProperty<boolean>;
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
    this.hmiObjectType = HmiObjectType.HmiProcessDiagnosisPlcCodeViewerControl;
  }
}

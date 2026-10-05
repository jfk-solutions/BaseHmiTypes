import { HmiColor, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiProcessDiagnosisGraphOverviewControl extends HmiControlWindowBase {
  associatedGraphDbTagSourceId?: string;
  associatedGraphDbTagName?: string;

  errorColor?: HmiProperty<HmiColor>;
  highlightColor?: HmiProperty<HmiColor>;
  selectedStepColor?: HmiProperty<HmiColor>;
  separatorColor?: HmiProperty<HmiColor>;
  toolbarBackgroundColor?: HmiProperty<HmiColor>;
  useToolbarBackgroundColor?: HmiProperty<boolean>;
  showMessageViewButton?: HmiProperty<boolean>;
  showPlcCodeViewButton?: HmiProperty<boolean>;
  showStepButton?: HmiProperty<boolean>;
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

  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiProcessDiagnosisGraphOverviewControl;
  }
}

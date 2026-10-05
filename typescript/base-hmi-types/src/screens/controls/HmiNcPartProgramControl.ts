import { HmiColor, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiNcPartProgramControl extends HmiControlWindowBase {
  constructor() { super(); this.hmiObjectType = HmiObjectType.HmiNcPartProgramControl; }
  listBackgroundColor?: HmiProperty<HmiColor>;
  listForegroundColor?: HmiProperty<HmiColor>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;
  gridLineColor?: HmiProperty<HmiColor>;
  showGridLines?: HmiProperty<boolean>;
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
  textualObjectsBorderBackgroundColor?: HmiProperty<HmiColor>;
  textualObjectsBorderColor?: HmiProperty<HmiColor>;
  textualObjectsBorderWidth?: HmiProperty<number>;
  textualObjectsCornerRadius?: HmiProperty<number>;
  textualObjectsEdgeStyle?: HmiProperty<number>;
}

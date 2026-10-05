import { HmiColor, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";

export class HmiStatusForceControl extends HmiControlWindowBase {
  constructor() { super(); this.hmiObjectType = HmiObjectType.HmiStatusForceControl; }

  showGridLines?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;

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
  headerFontReferenceDeviceSize?: HmiProperty<number>;
  contentFontReferenceDeviceSize?: HmiProperty<number>;
}

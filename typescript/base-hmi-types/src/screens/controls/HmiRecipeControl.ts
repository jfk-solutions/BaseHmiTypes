import { HmiColor, HmiFont, HmiHorizontalAlignment, HmiProperty } from "../base.js";
import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiRecipeColumn } from "./HmiRecipeColumn.js";
import { HmiRecipeViewKind } from "./HmiRecipeViewKind.js";

export class HmiRecipeControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiRecipeControl;
  }

  viewKind = HmiRecipeViewKind.Selector;
  defaultRecipeName?: HmiProperty<string>;
  fieldLength?: HmiProperty<number>;
  horizontalAlignment?: HmiProperty<HmiHorizontalAlignment>;
  enableRecipeDialog?: HmiProperty<boolean>;
  headerCornerRadius?: HmiProperty<number>;
  headerBorderBackgroundColor?: HmiProperty<HmiColor>;
  headerBackFillStyle?: HmiProperty<number>;
  headerEdgeStyle?: HmiProperty<number>;
  headerFirstGradientColor?: HmiProperty<HmiColor>;
  headerMiddleGradientColor?: HmiProperty<HmiColor>;
  headerSecondGradientColor?: HmiProperty<HmiColor>;
  headerFirstGradientOffset?: HmiProperty<number>;
  headerSecondGradientOffset?: HmiProperty<number>;
  useHeaderFirstGradient?: HmiProperty<boolean>;
  useHeaderSecondGradient?: HmiProperty<boolean>;
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
  showHeader?: HmiProperty<boolean>;
  showGridLines?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  showStatusBar?: HmiProperty<boolean>;
  statusBarFont?: HmiFont;
  comboBoxFont?: HmiFont;
  showNumbers?: HmiProperty<boolean>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;
  showFooter?: HmiProperty<boolean>;
  linesPerItem?: HmiProperty<number>;
  wordWrap?: HmiProperty<boolean>;
  viewOnly?: HmiProperty<boolean>;
  wrapAround?: HmiProperty<boolean>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  readonly columnDefinitions: HmiRecipeColumn[] = [];
}

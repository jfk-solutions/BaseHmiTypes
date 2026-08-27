import { HmiColor, HmiProperty } from "../base.js";
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
  showHeader?: HmiProperty<boolean>;
  showFooter?: HmiProperty<boolean>;
  linesPerItem?: HmiProperty<number>;
  wordWrap?: HmiProperty<boolean>;
  viewOnly?: HmiProperty<boolean>;
  wrapAround?: HmiProperty<boolean>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  readonly columnDefinitions: HmiRecipeColumn[] = [];
}

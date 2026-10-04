import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiColor, HmiProperty } from "../base.js";
import { HmiMultilingualText } from "../../common/HmiMultilingualText.js";
import { HmiParameterColumn } from "./HmiParameterColumn.js";

export class HmiDetailedParameterControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDetailedParameterControl;
  }
  parameterSetTypeFixed?: HmiProperty<boolean>;
  currentParameterSetId?: HmiProperty<number>;
  currentParameterSetTypeId?: HmiProperty<number>;
  readonly columnDefinitions: HmiParameterColumn[] = [];
  parameterSetTypeLabel?: HmiProperty<HmiMultilingualText>;
  parameterSetLabel?: HmiProperty<HmiMultilingualText>;
  numberLabel?: HmiProperty<HmiMultilingualText>;
  hideDetails?: HmiProperty<boolean>;
  gridLineColor?: HmiProperty<HmiColor>;
  gridLineWidth?: HmiProperty<number>;
  rowHeight?: HmiProperty<number>;
  cellPaddingLeft?: HmiProperty<number>;
  cellPaddingTop?: HmiProperty<number>;
  cellPaddingRight?: HmiProperty<number>;
  cellPaddingBottom?: HmiProperty<number>;
  /** Native editing-mode value; no cross-family enum translation is assumed. */
  editMode?: HmiProperty<number>;
  showToolbar?: HmiProperty<boolean>;
  showStatusBar?: HmiProperty<boolean>;
  toolbarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarForegroundColor?: HmiProperty<HmiColor>;
}

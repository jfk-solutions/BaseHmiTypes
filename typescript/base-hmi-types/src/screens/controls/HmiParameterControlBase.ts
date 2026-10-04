import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiColor, HmiProperty } from "../base.js";
import { HmiParameterColumn } from "./HmiParameterColumn.js";

export abstract class HmiParameterControlBase extends HmiControlWindowBase {
  readonly columnDefinitions: HmiParameterColumn[] = [];
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

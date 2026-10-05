import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiColor, HmiFont, HmiProperty } from "../base.js";
import { HmiParameterColumn } from "./HmiParameterColumn.js";

export abstract class HmiParameterControlBase extends HmiControlWindowBase {
  allowSortByColumn?: HmiProperty<boolean>;
  allowFilterByColumn?: HmiProperty<boolean>;
  gridLineVisibility?: HmiProperty<number>;
  gridSelectionMode?: HmiProperty<number>;
  coloringMode?: HmiProperty<number>;
  horizontalScrollBarVisibility?: HmiProperty<number>;
  verticalScrollBarVisibility?: HmiProperty<number>;
  selectFullRow?: HmiProperty<boolean>;
  selectionBackgroundColor?: HmiProperty<HmiColor>;
  selectionForegroundColor?: HmiProperty<HmiColor>;
  selectionBorderColor?: HmiProperty<HmiColor>;
  selectionBorderWidth?: HmiProperty<number>;
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
  toolbarForegroundColor?: HmiProperty<HmiColor>;
  toolbarFont?: HmiFont;
  statusBarFont?: HmiFont;
  statusBarBackgroundColor?: HmiProperty<HmiColor>;
  statusBarForegroundColor?: HmiProperty<HmiColor>;
}

import { HmiControlWindowBase } from "../base/HmiControlWindowBase.js";
import { HmiColor } from "../base/HmiColor.js";
import { HmiObjectType } from "../base/HmiObjectType.js";
import { HmiProperty } from "../base/HmiProperty.js";
import { HmiDataGridColumn } from "./HmiDataGridColumn.js";
import { HmiDataGridDataSourceKind } from "./HmiDataGridDataSourceKind.js";
import { HmiDataGridSortDirection } from "./HmiDataGridSortDirection.js";

export class HmiDataGridControl extends HmiControlWindowBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiDataGridControl;
  }

  showExportCsv?: HmiProperty<boolean>;
  showProperties?: HmiProperty<boolean>;
  showStatusBar?: HmiProperty<boolean>;
  showToolbar?: HmiProperty<boolean>;
  toolbarIconSize?: HmiProperty<string>;
  dataSourceKind?: HmiProperty<HmiDataGridDataSourceKind>;
  sourceDataSourceKind?: string;
  dataSourceName?: HmiProperty<string>;
  tableOrView?: HmiProperty<string>;
  timeSortDirection?: HmiProperty<HmiDataGridSortDirection>;
  sourceTimeSortDirection?: string;
  historianInterpolatedMode?: HmiProperty<boolean>;
  historianInterpolationInterval?: HmiProperty<string>;
  maximumRows?: HmiProperty<number>;
  useLocalMachineTimeZone?: HmiProperty<boolean>;
  alternatingRowBackgroundColor?: HmiProperty<HmiColor>;
  gridLineColor?: HmiProperty<HmiColor>;
  headerRowHeightAutomatic?: HmiProperty<boolean>;
  headerRowHeight?: HmiProperty<number>;
  rowHeightAutomatic?: HmiProperty<boolean>;
  rowHeight?: HmiProperty<number>;
  readonly columnDefinitions: HmiDataGridColumn[] = [];
  timePeriodAbsoluteMode?: HmiProperty<boolean>;
  timePeriodDuration?: HmiProperty<string>;
  timePeriodStart?: HmiProperty<string>;
  timePeriodEnd?: HmiProperty<string>;
}
